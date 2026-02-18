<!-- Sidebar — minimal navigation between Chat, Graph, and Settings views. -->
<script lang="ts">
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/', label: 'Chat', icon: '💬' },
		{ href: '/graph', label: 'Graph', icon: '🕸' },
		{ href: '/settings', label: 'Settings', icon: '⚙' }
	];

	function isActive(href: string, pathname: string): boolean {
		if (href === '/') return pathname === '/';
		return pathname.startsWith(href);
	}
</script>

<nav class="flex flex-col w-14 bg-bg-secondary border-r border-border h-full py-3 gap-1">
	<div class="px-2 pb-3 mb-2 border-b border-border">
		<div class="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
			M
		</div>
	</div>

	{#each navItems as item}
		<a
			href={item.href}
			class="flex flex-col items-center gap-0.5 py-2 px-1 mx-1 rounded-lg text-xs transition-colors
				{isActive(item.href, $page.url.pathname)
					? 'bg-bg-tertiary text-text'
					: 'text-text-secondary hover:text-text hover:bg-bg-tertiary/50'}"
		>
			<span class="text-base">{item.icon}</span>
			<span>{item.label}</span>
		</a>
	{/each}
</nav>
