// RAG retrieval — assembles vault context for Claude to answer from user's knowledge base.
// MVP: context stuffing (no vector DB). Loads all markdown into Claude's context window.

import { get } from 'svelte/store';
import { settings } from '$lib/stores/settings';
import { readAllNotes } from '$lib/vault/filesystem';

const RETRIEVAL_PATTERNS = [
	/what did (i|we)/i,
	/when did (i|we)/i,
	/remind me/i,
	/what do i know/i,
	/what have i/i,
	/do i have any notes/i,
	/search (my|for)/i,
	/find (my|me)/i,
	/tell me about/i,
	/what('s| is) my/i,
	/did i (mention|say|write|note|decide)/i,
	/recall/i,
	/look up/i,
	/what were my/i,
	/summarize my/i
];

/** Detect if a message is a retrieval question vs new conversation. */
export function isRetrievalQuery(message: string): boolean {
	return RETRIEVAL_PATTERNS.some((pattern) => pattern.test(message));
}

/** Build the RAG system prompt with vault context. */
export async function buildRagContext(): Promise<string | null> {
	const s = get(settings);
	if (!s.vaultPath) return null;

	let notes: Map<string, string>;
	try {
		notes = await readAllNotes(s.vaultPath);
	} catch {
		return null;
	}

	if (notes.size === 0) return null;

	// Build context string from all notes
	let context = '';
	let tokenEstimate = 0;
	const MAX_CHARS = 400_000; // ~100k tokens, safe for Claude's context

	for (const [path, content] of notes) {
		const noteBlock = `\n### File: ${path}\n${content}\n`;
		if (tokenEstimate + noteBlock.length > MAX_CHARS) break;
		context += noteBlock;
		tokenEstimate += noteBlock.length;
	}

	return `You are Mycelia, the user's personal AI companion. The user is asking about something from their personal knowledge base.

Below are their notes — answer their question using information from these notes. When you reference information, mention which note it comes from. If you can't find the answer in the notes, say so honestly and offer to help them think through it.

Be conversational, not robotic. You're a friend who happens to have perfect recall of everything they've told you.

<vault_context>
${context}
</vault_context>`;
}
