<!-- ChatMessage — renders a single user or assistant message bubble. -->
<script lang="ts">
	import type { ChatMessage } from '$lib/stores/chat';

	let { message }: { message: ChatMessage } = $props();

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}
</script>

<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'} mb-3">
	<div
		class="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
			{message.role === 'user'
				? 'bg-user-bubble text-text rounded-br-md'
				: 'bg-assistant-bubble text-text rounded-bl-md border border-border'}"
	>
		{message.content}
		<div class="text-[10px] text-text-secondary mt-1 {message.role === 'user' ? 'text-right' : 'text-left'}">
			{formatTime(message.timestamp)}
		</div>
	</div>
</div>
