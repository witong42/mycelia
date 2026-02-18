// Daily journal — auto-writes summarized conversation entries to journals/YYYY-MM-DD.md.

import { get } from 'svelte/store';
import { settings } from '$lib/stores/settings';
import { callClaude } from '$lib/ai/claude';
import { writeNote } from './filesystem';
import { exists } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

function buildJournalPrompt(perspective: 'first' | 'second'): string {
	const examples = perspective === 'first'
		? '("I discussed...", "I decided...")'
		: '("You discussed...", "You decided...")';
	const person = perspective === 'first' ? 'first' : 'second';
	return `You are a concise journal entry writer. Given a conversation exchange between a user and their AI, write a brief journal entry summarizing what was discussed.

Rules:
- Write 2-4 sentences max
- Write in past tense, ${person} person ${examples}
- Use [[wikilinks]] for notable people, projects, tools, or concepts mentioned
- Focus on substance: decisions, ideas, plans, insights
- Skip greetings, small talk, or meta-conversation
- If there's truly nothing worth journaling, respond with exactly: NO_ENTRY

Output ONLY the journal entry text (with wikilinks), nothing else.`;
}

/** Get today's date formatted as YYYY-MM-DD. */
function todayDate(): string {
	return new Date().toISOString().split('T')[0];
}

/** Get current time as HH:MM. */
function currentTime(): string {
	return new Date().toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
}

/** Get a human-readable date header (e.g., "Tuesday, February 18, 2026"). */
function dateHeader(): string {
	return new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

/** Create the YAML frontmatter for a new daily journal. */
function journalFrontmatter(date: string): string {
	return `---
title: "${date}"
date: ${date}
type: journal
---

# ${dateHeader()}
`;
}

/** Write a journal entry for the latest conversation exchange. */
export async function writeJournalEntry(
	userMessage: string,
	assistantMessage: string
): Promise<void> {
	const s = get(settings);
	if (!s.vaultPath) {
		console.warn('[journal] Skipped: no vaultPath');
		return;
	}

	console.log('[journal] Summarizing exchange with model:', s.extractionModel);
	// Summarize the exchange into a journal entry
	const summary = await callClaude(
		[
			{
				role: 'user',
				content: `User said: "${userMessage}"\n\nAssistant replied: "${assistantMessage}"`
			}
		],
		buildJournalPrompt(s.writingPerspective || 'second')
	);

	console.log('[journal] Summary response:', summary.slice(0, 200));

	if (summary.trim() === 'NO_ENTRY') {
		console.log('[journal] Claude returned NO_ENTRY');
		return;
	}

	const date = todayDate();
	const time = currentTime();
	const filename = `${date}.md`;

	// Ensure journals directory exists
	const journalsDir = await join(s.vaultPath, 'journals');
	const dirExists = await exists(journalsDir);
	if (!dirExists) {
		const { mkdir } = await import('@tauri-apps/plugin-fs');
		await mkdir(journalsDir, { recursive: true });
	}

	// Check if today's journal already exists
	const journalPath = await join(s.vaultPath, 'journals', filename);
	const journalExists = await exists(journalPath);

	if (journalExists) {
		// Append new timestamped entry
		const entry = `\n## ${time}\n${summary}\n`;
		await writeNote(s.vaultPath, 'journals', filename, entry);
	} else {
		// Create new journal with frontmatter + first entry
		const content = journalFrontmatter(date) + `\n## ${time}\n${summary}\n`;
		await writeNote(s.vaultPath, 'journals', filename, content);
	}

	console.log('[journal] Wrote journal entry:', filename);
}
