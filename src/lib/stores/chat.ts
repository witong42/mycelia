// Chat store — manages conversation messages and persistence.

import { writable, get } from 'svelte/store';
import { settings } from './settings';
import { saveConversation, loadConversation } from '$lib/vault/filesystem';

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
}

export const messages = writable<ChatMessage[]>([]);
export const isLoading = writable(false);

/** Generate a simple unique ID. */
function uid(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Add a user message to the conversation. */
export function addUserMessage(content: string): ChatMessage {
	const msg: ChatMessage = {
		id: uid(),
		role: 'user',
		content,
		timestamp: Date.now()
	};
	messages.update((msgs) => [...msgs, msg]);
	persistMessages();
	return msg;
}

/** Add an assistant message (initially empty for streaming). */
export function addAssistantMessage(): ChatMessage {
	const msg: ChatMessage = {
		id: uid(),
		role: 'assistant',
		content: '',
		timestamp: Date.now()
	};
	messages.update((msgs) => [...msgs, msg]);
	return msg;
}

/** Append text to the last assistant message (for streaming). */
export function appendToLastMessage(text: string): void {
	messages.update((msgs) => {
		const last = msgs[msgs.length - 1];
		if (last && last.role === 'assistant') {
			return [...msgs.slice(0, -1), { ...last, content: last.content + text }];
		}
		return msgs;
	});
}

/** Finalize the last assistant message and persist. */
export function finalizeLastMessage(): void {
	persistMessages();
}

/** Load chat history from vault. */
export async function loadChatHistory(): Promise<void> {
	const s = get(settings);
	if (!s.vaultPath) return;

	const saved = await loadConversation(s.vaultPath);
	if (saved.length > 0) {
		messages.set(saved as ChatMessage[]);
	}
}

/** Persist current messages to vault. */
async function persistMessages(): Promise<void> {
	const s = get(settings);
	if (!s.vaultPath) return;

	const msgs = get(messages);
	await saveConversation(s.vaultPath, msgs);
}

/** Clear all messages and start fresh. */
export function clearMessages(): void {
	messages.set([]);
	persistMessages();
}
