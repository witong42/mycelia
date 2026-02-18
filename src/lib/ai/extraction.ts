// Knowledge extraction engine — the core product.
// Silently extracts structured notes from conversation and writes to vault.

import { get } from 'svelte/store';
import { settings } from '$lib/stores/settings';
import { callClaude } from './claude';
import { writeNote, listAllNotes } from '$lib/vault/filesystem';
import type { ChatMessage } from '$lib/stores/chat';

const PERSPECTIVE_INSTRUCTIONS = {
	second: {
		rule: 'Write in second person ("You mentioned...", "You decided...", "You\'re interested in...")',
		example: "You're considering building software for [[farriers]] (horseshoe makers). This connects to your broader interest in [[niche markets]] and [[B2B SaaS]]. The insight is that underserved trades often have terrible software and will pay well for something that actually works."
	},
	first: {
		rule: 'Write in first person ("I mentioned...", "I decided...", "I\'m interested in...")',
		example: "I'm considering building software for [[farriers]] (horseshoe makers). This connects to my broader interest in [[niche markets]] and [[B2B SaaS]]. The insight is that underserved trades often have terrible software and will pay well for something that actually works."
	}
};

function buildExtractionPrompt(perspective: 'first' | 'second'): string {
	const p = PERSPECTIVE_INSTRUCTIONS[perspective];
	return `You are a knowledge extraction engine for a personal knowledge base called Mycelia.

Given a conversation between a user and their AI, extract information worth remembering long-term. Output structured markdown notes.

## Rules
- Only extract genuinely useful information: ideas, decisions, facts, plans, insights, preferences, people, projects, questions worth revisiting
- Skip small talk, greetings, filler, meta-conversation about the AI itself
- If the conversation contains NOTHING worth extracting, respond with exactly: NO_EXTRACTION
- Each distinct topic gets its own note block
- Use [[wikilinks]] for people, projects, tools, concepts, and connections between ideas
- ${p.rule}
- Be concise — capture the essence, not the full conversation

## Output Format
For EACH note, output this exact structure. Separate multiple notes with a line containing only ===

---
title: <short descriptive title>
folder: <one of: topics, people, projects, decisions, ideas>
filename: <kebab-case.md>
mode: <create or append>
tags: [<relevant, tags>]
date: <YYYY-MM-DD>
source: conversation
---

<markdown body with [[wikilinks]]>

===

## Folder guide
- topics: General knowledge, concepts, learning, interests
- people: People mentioned — friends, colleagues, public figures
- projects: Active projects, businesses, ventures, side projects
- decisions: Decisions made with reasoning
- ideas: Raw ideas, shower thoughts, creative sparks, what-ifs

## Example output

---
title: Niche Software Business Idea
folder: ideas
filename: niche-software-farriers.md
mode: create
tags: [business, software, niche-markets]
date: 2026-02-18
source: conversation
---

${p.example}

===`;
}

/** Extract notes from the last few messages and write to vault. */
export async function extractKnowledge(messages: ChatMessage[]): Promise<void> {
	const s = get(settings);
	if (!s.vaultPath || !s.apiKey) {
		console.warn('[extraction] Skipped: missing vaultPath or apiKey');
		return;
	}

	// Take the last 10 messages for context
	const recentMessages = messages.slice(-10);
	if (recentMessages.length < 2) {
		console.warn('[extraction] Skipped: fewer than 2 messages');
		return;
	}

	// Get existing filenames so the model can decide append vs create
	let existingFiles: string[] = [];
	try {
		existingFiles = await listAllNotes(s.vaultPath);
	} catch {
		// Vault may not be initialized yet
	}

	const conversationText = recentMessages
		.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
		.join('\n\n');

	const prompt = existingFiles.length > 0
		? `Existing notes in vault:\n${existingFiles.join('\n')}\n\nIf a topic already has a note, use mode: append with the existing filename.\n\nConversation to extract from:\n${conversationText}`
		: `Conversation to extract from:\n${conversationText}`;

	const today = new Date().toISOString().split('T')[0];
	const systemPrompt = buildExtractionPrompt(s.writingPerspective || 'second').replace(/2026-02-18/g, today);

	console.log('[extraction] Calling Claude with model:', s.extractionModel);
	const result = await callClaude([{ role: 'user', content: prompt }], systemPrompt);
	console.log('[extraction] Response length:', result.length);
	console.log('[extraction] Response preview:', result.slice(0, 300));

	if (result.trim() === 'NO_EXTRACTION') {
		console.log('[extraction] Claude returned NO_EXTRACTION');
		return;
	}

	// Parse the response into individual notes
	const noteBlocks = result.split('===').filter((b) => b.trim());
	console.log('[extraction] Found', noteBlocks.length, 'note block(s)');

	let written = 0;
	for (const block of noteBlocks) {
		const ok = await processNoteBlock(s.vaultPath, block.trim());
		if (ok) written++;
	}
	console.log('[extraction] Wrote', written, 'note(s)');
}

/** Parse a single note block and write it to the vault. */
async function processNoteBlock(vaultPath: string, block: string): Promise<boolean> {
	// Normalize line endings (Claude may output \r\n)
	const normalized = block.replace(/\r\n/g, '\n').trim();

	// Split frontmatter from body — tolerant of extra whitespace around ---
	const fmMatch = normalized.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
	if (!fmMatch) {
		console.warn('[extraction] Failed to parse frontmatter from block:', normalized.slice(0, 200));
		return false;
	}

	const frontmatterText = fmMatch[1];
	const body = fmMatch[2].trim();

	if (!body) {
		console.warn('[extraction] Empty body, skipping');
		return false;
	}

	// Parse frontmatter fields
	const folder = extractField(frontmatterText, 'folder') || 'topics';
	const filename = extractField(frontmatterText, 'filename') || 'untitled.md';
	const mode = extractField(frontmatterText, 'mode') || 'create';
	const title = extractField(frontmatterText, 'title') || 'Untitled';
	const tags = extractField(frontmatterText, 'tags') || '[]';
	const date = extractField(frontmatterText, 'date') || new Date().toISOString().split('T')[0];

	console.log(`[extraction] Writing note: ${folder}/${filename} (mode: ${mode})`);

	// Ensure target folder exists
	const { join } = await import('@tauri-apps/api/path');
	const { exists, mkdir } = await import('@tauri-apps/plugin-fs');
	const dirPath = await join(vaultPath, folder);
	const dirExists = await exists(dirPath);
	if (!dirExists) {
		await mkdir(dirPath, { recursive: true });
	}

	if (mode === 'append') {
		// Append under a date header
		const appendContent = `\n\n## ${date}\n${body}`;
		await writeNote(vaultPath, folder, filename, appendContent);
	} else {
		// Create new note with full frontmatter
		const fullContent = `---
title: "${title}"
tags: ${tags}
date: ${date}
source: conversation
---

${body}
`;
		await writeNote(vaultPath, folder, filename, fullContent);
	}

	console.log(`[extraction] Wrote ${folder}/${filename}`);
	return true;
}

/** Extract a YAML field value from frontmatter text. */
function extractField(frontmatter: string, field: string): string | null {
	const match = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
	return match ? match[1].trim() : null;
}
