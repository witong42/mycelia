// Vault filesystem operations — wraps Tauri FS plugin for markdown read/write.

import {
	readTextFile,
	writeTextFile,
	readDir,
	mkdir,
	exists
} from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

const VAULT_FOLDERS = ['journals', 'topics', 'people', 'projects', 'decisions', 'ideas', '.mycelia'];

/** Ensure all vault subdirectories exist. */
export async function ensureVaultStructure(vaultPath: string): Promise<void> {
	for (const folder of VAULT_FOLDERS) {
		const dirPath = await join(vaultPath, folder);
		const dirExists = await exists(dirPath);
		if (!dirExists) {
			await mkdir(dirPath, { recursive: true });
		}
	}
}

/** Write a markdown note. If the file exists, appends content under a date separator. */
export async function writeNote(
	vaultPath: string,
	folder: string,
	filename: string,
	content: string
): Promise<string> {
	const dirPath = await join(vaultPath, folder);
	const filePath = await join(dirPath, filename);

	const fileExists = await exists(filePath);
	if (fileExists) {
		const existing = await readTextFile(filePath);
		await writeTextFile(filePath, existing + '\n\n' + content);
	} else {
		await writeTextFile(filePath, content);
	}

	return filePath;
}

/** Read a single markdown file. */
export async function readNote(vaultPath: string, relativePath: string): Promise<string> {
	const filePath = await join(vaultPath, relativePath);
	return readTextFile(filePath);
}

/** Recursively list all .md files in the vault (excluding .mycelia). */
export async function listAllNotes(vaultPath: string): Promise<string[]> {
	const results: string[] = [];

	async function walk(dir: string, prefix: string) {
		const entries = await readDir(dir);
		for (const entry of entries) {
			const entryPath = prefix ? `${prefix}/${entry.name}` : entry.name;
			if (entry.isDirectory) {
				if (entry.name === '.mycelia') continue;
				await walk(await join(dir, entry.name), entryPath);
			} else if (entry.name.endsWith('.md')) {
				results.push(entryPath);
			}
		}
	}

	await walk(vaultPath, '');
	return results;
}

/** Read all markdown files and return as a map of path → content. */
export async function readAllNotes(vaultPath: string): Promise<Map<string, string>> {
	const files = await listAllNotes(vaultPath);
	const notes = new Map<string, string>();

	for (const file of files) {
		const content = await readNote(vaultPath, file);
		notes.set(file, content);
	}

	return notes;
}

/** Save conversation history to .mycelia/chat.json. */
export async function saveConversation(
	vaultPath: string,
	messages: unknown[]
): Promise<void> {
	const dirPath = await join(vaultPath, '.mycelia');
	const dirExists = await exists(dirPath);
	if (!dirExists) {
		await mkdir(dirPath, { recursive: true });
	}
	const filePath = await join(dirPath, 'chat.json');
	await writeTextFile(filePath, JSON.stringify(messages, null, 2));
}

/** Load conversation history from .mycelia/chat.json. */
export async function loadConversation(vaultPath: string): Promise<unknown[]> {
	const filePath = await join(vaultPath, '.mycelia', 'chat.json');
	const fileExists = await exists(filePath);
	if (!fileExists) return [];

	const content = await readTextFile(filePath);
	return JSON.parse(content);
}
