// Claude API client — handles conversation and streaming responses.

import { get } from 'svelte/store';
import { settings } from '$lib/stores/settings';
import type { ChatMessage } from '$lib/stores/chat';

const API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You are Mycelia, a thoughtful personal AI companion. The user talks to you about their day, ideas, plans, and thoughts. You're like a smart, curious friend who genuinely cares about what they're working on.

Be concise and natural. Ask follow-up questions to draw out insights when something seems interesting. Help them think through problems. Remember context from earlier in the conversation.

Don't be overly formal or use bullet points unless asked. Just talk like a real person.`;

export interface ClaudeMessage {
	role: 'user' | 'assistant';
	content: string;
}

/** Convert chat messages to Claude API format. */
function toClaudeMessages(messages: ChatMessage[]): ClaudeMessage[] {
	return messages.map((m) => ({ role: m.role, content: m.content }));
}

/** Stream a response from Claude. Calls onChunk for each text delta. */
export async function streamResponse(
	conversationHistory: ChatMessage[],
	onChunk: (text: string) => void,
	systemPrompt?: string
): Promise<string> {
	const s = get(settings);
	if (!s.apiKey) throw new Error('API key not configured');

	const response = await fetch(API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': s.apiKey,
			'anthropic-version': '2023-06-01',
			'anthropic-dangerous-direct-browser-access': 'true'
		},
		body: JSON.stringify({
			model: s.model,
			max_tokens: 4096,
			system: systemPrompt || SYSTEM_PROMPT,
			messages: toClaudeMessages(conversationHistory),
			stream: true
		})
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Claude API error (${response.status}): ${error}`);
	}

	const reader = response.body?.getReader();
	if (!reader) throw new Error('No response body');

	const decoder = new TextDecoder();
	let fullResponse = '';
	let buffer = '';

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split('\n');
		buffer = lines.pop() || '';

		for (const line of lines) {
			if (!line.startsWith('data: ')) continue;
			const data = line.slice(6);
			if (data === '[DONE]') continue;

			try {
				const event = JSON.parse(data);
				if (event.type === 'content_block_delta' && event.delta?.text) {
					fullResponse += event.delta.text;
					onChunk(event.delta.text);
				}
			} catch {
				// Skip malformed JSON lines
			}
		}
	}

	return fullResponse;
}

/** Make a non-streaming call to Claude (for extraction). */
export async function callClaude(
	messages: ClaudeMessage[],
	systemPrompt: string
): Promise<string> {
	const s = get(settings);
	if (!s.apiKey) throw new Error('API key not configured');

	const response = await fetch(API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': s.apiKey,
			'anthropic-version': '2023-06-01',
			'anthropic-dangerous-direct-browser-access': 'true'
		},
		body: JSON.stringify({
			model: s.extractionModel,
			max_tokens: 4096,
			system: systemPrompt,
			messages
		})
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Claude API error (${response.status}): ${error}`);
	}

	const result = await response.json();
	return result.content[0]?.text || '';
}
