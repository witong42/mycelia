<!-- Chat view — the main conversation interface. -->
<script lang="ts">
	import { onMount, tick } from 'svelte';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import {
		messages,
		isLoading,
		addUserMessage,
		addAssistantMessage,
		appendToLastMessage,
		finalizeLastMessage
	} from '$lib/stores/chat';
	import { streamResponse } from '$lib/ai/claude';
	import { isRetrievalQuery, buildRagContext } from '$lib/ai/rag';
	import { writeJournalEntry } from '$lib/vault/journal';
	import { extractKnowledge } from '$lib/ai/extraction';

	let chatContainer: HTMLDivElement;
	let bgError = $state('');

	function scrollToBottom() {
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}

	function showBgError(label: string, err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error(`${label}:`, err);
		bgError = `${label}: ${msg}`;
		setTimeout(() => (bgError = ''), 8000);
	}

	async function handleSend(text: string) {
		addUserMessage(text);
		isLoading.set(true);
		await tick();
		scrollToBottom();

		addAssistantMessage();

		try {
			// Check if this is a retrieval query and build RAG context
			let systemPrompt: string | undefined;
			if (isRetrievalQuery(text)) {
				const ragContext = await buildRagContext();
				if (ragContext) systemPrompt = ragContext;
			}

			const fullResponse = await streamResponse(
				$messages.slice(0, -1), // exclude the empty assistant message
				(chunk) => {
					appendToLastMessage(chunk);
					scrollToBottom();
				},
				systemPrompt
			);

			finalizeLastMessage();

			// Background tasks — run in parallel, surface errors visibly
			writeJournalEntry(text, fullResponse).catch((err) =>
				showBgError('Journal write failed', err)
			);
			extractKnowledge($messages).catch((err) =>
				showBgError('Extraction failed', err)
			);
		} catch (error) {
			appendToLastMessage(
				`\n\n*Error: ${error instanceof Error ? error.message : 'Something went wrong'}*`
			);
			finalizeLastMessage();
		} finally {
			isLoading.set(false);
			await tick();
			scrollToBottom();
		}
	}

	onMount(() => {
		scrollToBottom();
	});
</script>

<div class="flex flex-col h-full relative">
	<!-- Background error toast -->
	{#if bgError}
		<div class="absolute top-3 right-3 z-50 max-w-sm bg-red-900/80 text-red-200 text-xs px-4 py-2.5 rounded-lg border border-red-800 shadow-lg">
			{bgError}
		</div>
	{/if}

	<!-- Chat messages -->
	<div
		bind:this={chatContainer}
		class="flex-1 overflow-y-auto px-4 py-6"
	>
		<div class="max-w-3xl mx-auto">
			{#if $messages.length === 0}
				<div class="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
					<div class="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
						<span class="text-accent text-2xl font-bold">M</span>
					</div>
					<h2 class="text-lg font-medium text-text mb-2">Start talking</h2>
					<p class="text-text-secondary text-sm max-w-sm">
						Tell me about your day, your ideas, or anything on your mind. I'll organize it all into your knowledge base automatically.
					</p>
				</div>
			{:else}
				{#each $messages as message (message.id)}
					<ChatMessage {message} />
				{/each}

				{#if $isLoading && $messages[$messages.length - 1]?.content === ''}
					<div class="flex justify-start mb-3">
						<div class="bg-assistant-bubble border border-border rounded-2xl rounded-bl-md px-4 py-3">
							<div class="flex gap-1">
								<span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></span>
								<span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:150ms]"></span>
								<span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:300ms]"></span>
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>

	<!-- Input -->
	<ChatInput onsend={handleSend} />
</div>
