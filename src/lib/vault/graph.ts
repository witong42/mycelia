// Graph data builder — transforms vault files into nodes and links for visualization.

import { extractWikilinks, extractFrontmatter, getFolderFromPath } from './parser';

export interface GraphNode {
	id: string;
	name: string;
	folder: string;
	connections: number;
}

export interface GraphLink {
	source: string;
	target: string;
}

export interface GraphData {
	nodes: GraphNode[];
	links: GraphLink[];
}

/** Folder-to-color mapping for graph visualization. */
export const FOLDER_COLORS: Record<string, string> = {
	journals: '#f59e0b',
	topics: '#3b82f6',
	people: '#10b981',
	projects: '#8b5cf6',
	decisions: '#ef4444',
	ideas: '#ec4899',
	root: '#6b7280'
};

/** Build graph data from vault notes. */
export function buildGraphData(notes: Map<string, string>): GraphData {
	const nodeMap = new Map<string, GraphNode>();
	const links: GraphLink[] = [];

	// Create nodes for each file
	for (const [path] of notes) {
		const content = notes.get(path)!;
		const frontmatter = extractFrontmatter(content);
		const folder = getFolderFromPath(path);
		const name = frontmatter.title || path.replace(/\.md$/, '').split('/').pop() || path;

		nodeMap.set(path, {
			id: path,
			name,
			folder,
			connections: 0
		});
	}

	// Extract links from wikilinks
	for (const [path, content] of notes) {
		const wikilinks = extractWikilinks(content);

		for (const link of wikilinks) {
			const linkLower = link.toLowerCase();

			// Find matching node by name or filename
			let targetPath: string | null = null;
			for (const [nodePath, node] of nodeMap) {
				if (
					node.name.toLowerCase() === linkLower ||
					nodePath.toLowerCase().includes(linkLower)
				) {
					targetPath = nodePath;
					break;
				}
			}

			if (!targetPath) {
				// Create a phantom node for unresolved links
				const phantomId = `_link_${linkLower}`;
				if (!nodeMap.has(phantomId)) {
					nodeMap.set(phantomId, {
						id: phantomId,
						name: link,
						folder: 'root',
						connections: 0
					});
				}
				targetPath = phantomId;
			}

			if (path !== targetPath) {
				links.push({ source: path, target: targetPath });
				const sourceNode = nodeMap.get(path);
				const targetNode = nodeMap.get(targetPath);
				if (sourceNode) sourceNode.connections++;
				if (targetNode) targetNode.connections++;
			}
		}
	}

	return {
		nodes: Array.from(nodeMap.values()),
		links
	};
}
