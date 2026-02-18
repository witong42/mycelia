<!-- GraphView — force-directed graph of vault notes and their wikilink connections. -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { FOLDER_COLORS, type GraphData, type GraphNode } from '$lib/vault/graph';

	let { data }: { data: GraphData } = $props();

	let container: HTMLDivElement;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let graph: any = null;
	let observer: ResizeObserver | null = null;

	onMount(async () => {
		const module = await import('force-graph');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const ForceGraph = module.default as any;

		graph = ForceGraph()(container)
			.graphData(data)
			.nodeLabel((node: object) => (node as GraphNode).name)
			.nodeColor((node: object) => FOLDER_COLORS[(node as GraphNode).folder] || '#6b7280')
			.nodeRelSize(5)
			.nodeVal((node: object) => Math.max(1, (node as GraphNode).connections))
			.linkColor(() => '#2a2a3a')
			.linkWidth(1)
			.linkDirectionalParticles(0)
			.backgroundColor('#0a0a0f')
			.width(container.clientWidth)
			.height(container.clientHeight)
			.cooldownTicks(100)
			.onNodeClick((node: object) => {
				const n = node as GraphNode;
				if (n.id && !n.id.startsWith('_link_')) {
					console.log('Clicked note:', n.id);
				}
			});

		observer = new ResizeObserver(() => {
			if (graph && container) {
				graph.width(container.clientWidth);
				graph.height(container.clientHeight);
			}
		});
		observer.observe(container);
	});

	onDestroy(() => {
		observer?.disconnect();
		graph?._destructor?.();
	});
</script>

<div bind:this={container} class="w-full h-full"></div>
