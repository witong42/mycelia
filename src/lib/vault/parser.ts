// Markdown parser — extracts wikilinks and frontmatter from vault files.

/** Extract all [[wikilinks]] from markdown content. */
export function extractWikilinks(content: string): string[] {
	const matches = content.matchAll(/\[\[([^\]]+)\]\]/g);
	const links: string[] = [];
	for (const match of matches) {
		links.push(match[1]);
	}
	return [...new Set(links)];
}

/** Extract YAML frontmatter fields from markdown content. */
export function extractFrontmatter(content: string): Record<string, string> {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};

	const fields: Record<string, string> = {};
	const lines = match[1].split('\n');
	for (const line of lines) {
		const kvMatch = line.match(/^(\w+):\s*(.+)$/);
		if (kvMatch) {
			fields[kvMatch[1]] = kvMatch[2].replace(/^["']|["']$/g, '');
		}
	}
	return fields;
}

/** Get the folder category from a file path. */
export function getFolderFromPath(path: string): string {
	const parts = path.split('/');
	return parts.length > 1 ? parts[0] : 'root';
}

/** Convert a title or link text into a kebab-case filename. */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}
