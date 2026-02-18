<!-- ChatInput — text input with send button. Enter to send, Shift+Enter for newline. -->
<script lang="ts">
	import { isLoading } from '$lib/stores/chat';

	let { onsend }: { onsend: (text: string) => void } = $props();

	let value = $state('');
	let textarea = $state<HTMLTextAreaElement | null>(null);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	function send() {
		const trimmed = value.trim();
		if (!trimmed || $isLoading) return;
		onsend(trimmed);
		value = '';
		if (textarea) textarea.style.height = 'auto';
	}

	function autoResize() {
		if (!textarea) return;
		textarea.style.height = 'auto';
		textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
	}
</script>

<div class="border-t border-border bg-bg-secondary p-4">
	<div class="flex gap-3 items-end max-w-3xl mx-auto">
		<textarea
			bind:this={textarea}
			bind:value
			onkeydown={handleKeydown}
			oninput={autoResize}
			placeholder={$isLoading ? 'Thinking...' : 'Talk to Mycelia...'}
			disabled={$isLoading}
			rows="1"
			class="flex-1 bg-bg-tertiary text-text border border-border rounded-xl px-4 py-3
				resize-none text-sm placeholder-text-secondary focus:outline-none focus:border-accent
				disabled:opacity-50 transition-colors"
		></textarea>
		<button
			onclick={send}
			disabled={!value.trim() || $isLoading}
			class="px-4 py-3 bg-accent text-white rounded-xl text-sm font-medium
				hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
		>
			Send
		</button>
	</div>
</div>
