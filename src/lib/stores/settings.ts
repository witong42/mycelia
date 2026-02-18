// Settings store — persists API key and vault path using Tauri store plugin.

import { writable, get } from 'svelte/store';
import { load, type Store } from '@tauri-apps/plugin-store';

export type WritingPerspective = 'second' | 'first';

export interface Settings {
	apiKey: string;
	vaultPath: string;
	model: string;
	extractionModel: string;
	writingPerspective: WritingPerspective;
}

const DEFAULT_SETTINGS: Settings = {
	apiKey: '',
	vaultPath: '',
	model: 'claude-sonnet-4-6',
	extractionModel: 'claude-haiku-4-5-20251001',
	writingPerspective: 'second'
};

export const settings = writable<Settings>(DEFAULT_SETTINGS);
export const isConfigured = writable(false);

let store: Store | null = null;

/** Initialize settings from persistent store. */
export async function initSettings(): Promise<Settings> {
	store = await load('settings.json', {
		defaults: {
			apiKey: '',
			vaultPath: '',
			model: DEFAULT_SETTINGS.model,
			extractionModel: DEFAULT_SETTINGS.extractionModel,
			writingPerspective: DEFAULT_SETTINGS.writingPerspective
		},
		autoSave: true
	});

	const apiKey = ((await store.get('apiKey')) as string) || '';
	const vaultPath = ((await store.get('vaultPath')) as string) || '';
	const model = ((await store.get('model')) as string) || DEFAULT_SETTINGS.model;
	const extractionModel =
		((await store.get('extractionModel')) as string) || DEFAULT_SETTINGS.extractionModel;
	const writingPerspective =
		((await store.get('writingPerspective')) as WritingPerspective) || DEFAULT_SETTINGS.writingPerspective;

	const s: Settings = { apiKey, vaultPath, model, extractionModel, writingPerspective };
	settings.set(s);
	isConfigured.set(!!apiKey && !!vaultPath);
	return s;
}

/** Save a single setting. */
export async function saveSetting<K extends keyof Settings>(
	key: K,
	value: Settings[K]
): Promise<void> {
	if (!store) return;
	await store.set(key, value);

	settings.update((s) => ({ ...s, [key]: value }));

	const s = get(settings);
	isConfigured.set(!!s.apiKey && !!s.vaultPath);
}
