<!-- Graph view — visualize knowledge connections. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import GraphView from '$lib/components/GraphView.svelte';
	import { buildGraphData, FOLDER_COLORS, type GraphData } from '$lib/vault/graph';
	import { readAllNotes } from '$lib/vault/filesystem';
	import { settings } from '$lib/stores/settings';
	import { get } from 'svelte/store';

	let graphData = $state<GraphData | null>(null);
	let loading = $state(true);

	onMount(async () => {
		const s = get(settings);
		if (!s.vaultPath) {
			loading = false;
			return;
		}

		try {
			const notes = await readAllNotes(s.vaultPath);
			graphData = buildGraphData(notes);
		} catch (error) {
			console.error('Failed to build graph:', error);
		}
		loading = false;
	});
</script>

<div class="flex flex-col h-full">
	<!-- Header -->
	<div class="flex items-center justify-between px-6 py-3 border-b border-border">
		<h1 class="text-sm font-medium text-text">Knowledge Graph</h1>
		{#if graphData}
			<span class="text-xs text-text-secondary">
				{graphData.nodes.length} notes, {graphData.links.length} connections
			</span>
		{/if}
	</div>

	<!-- Legend -->
	<div class="flex gap-4 px-6 py-2 border-b border-border">
		{#each Object.entries(FOLDER_COLORS) as [folder, color]}
			{#if folder !== 'root'}
				<span class="flex items-center gap-1.5 text-xs text-text-secondary">
					<span class="w-2.5 h-2.5 rounded-full" style="background-color: {color}"></span>
					{folder}
				</span>
			{/if}
		{/each}
	</div>

	<!-- Graph -->
	<div class="flex-1 relative">
		{#if loading}
			<div class="flex items-center justify-center h-full">
				<span class="text-text-secondary text-sm">Loading graph...</span>
			</div>
		{:else if !graphData || graphData.nodes.length === 0}
			<div class="flex flex-col items-center justify-center h-full text-center">
				<p class="text-text-secondary text-sm mb-1">No notes yet</p>
				<p class="text-text-secondary text-xs">Start chatting and your knowledge graph will grow here.</p>
			</div>
		{:else}
			<GraphView data={graphData} />
		{/if}
	</div>
</div>
