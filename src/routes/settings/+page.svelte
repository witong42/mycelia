<!-- Settings view — manage API key, vault path, and model preferences. -->
<script lang="ts">
	import { settings, saveSetting } from '$lib/stores/settings';
	import { clearMessages } from '$lib/stores/chat';
	import { open } from '@tauri-apps/plugin-dialog';
	import { ensureVaultStructure } from '$lib/vault/filesystem';

	let showKey = $state(false);
	let saved = $state('');

	async function updateApiKey(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		await saveSetting('apiKey', value);
		flash('API key saved');
	}

	async function changeVault() {
		const selected = await open({
			directory: true,
			multiple: false,
			title: 'Choose vault directory'
		});
		if (selected) {
			await saveSetting('vaultPath', selected as string);
			await ensureVaultStructure(selected as string);
			flash('Vault directory updated');
		}
	}

	async function updateModel(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		await saveSetting('model', value);
		flash('Conversation model updated');
	}

	async function updateExtractionModel(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		await saveSetting('extractionModel', value);
		flash('Extraction model updated');
	}

	async function updatePerspective(e: Event) {
		const value = (e.target as HTMLSelectElement).value as 'first' | 'second';
		await saveSetting('writingPerspective', value);
		flash('Writing perspective updated');
	}

	function flash(msg: string) {
		saved = msg;
		setTimeout(() => (saved = ''), 2000);
	}
</script>

<div class="flex-1 overflow-y-auto px-6 py-6">
	<div class="max-w-lg mx-auto space-y-8">
		<h1 class="text-lg font-medium text-text">Settings</h1>

		<!-- API Key -->
		<div class="space-y-2">
			<label class="block text-xs text-text-secondary" for="settings-api-key">Anthropic API Key</label>
			<div class="flex gap-2">
				<input
					id="settings-api-key"
					type={showKey ? 'text' : 'password'}
					value={$settings.apiKey}
					onchange={updateApiKey}
					class="flex-1 bg-bg-tertiary text-text border border-border rounded-lg px-4 py-2.5
						text-sm focus:outline-none focus:border-accent"
				/>
				<button
					onclick={() => (showKey = !showKey)}
					class="px-3 py-2.5 bg-bg-tertiary border border-border rounded-lg text-xs text-text-secondary
						hover:text-text transition-colors"
				>
					{showKey ? 'Hide' : 'Show'}
				</button>
			</div>
		</div>

		<!-- Vault Path -->
		<div class="space-y-2">
			<label class="block text-xs text-text-secondary">Vault Directory</label>
			<div class="flex gap-2">
				<div class="flex-1 bg-bg-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text truncate">
					{$settings.vaultPath}
				</div>
				<button
					onclick={changeVault}
					class="px-4 py-2.5 bg-bg-tertiary border border-border rounded-lg text-sm text-text
						hover:border-accent transition-colors"
				>
					Change
				</button>
			</div>
		</div>

		<!-- Conversation Model -->
		<div class="space-y-2">
			<label class="block text-xs text-text-secondary" for="settings-model">Conversation Model</label>
			<select
				id="settings-model"
				value={$settings.model}
				onchange={updateModel}
				class="w-full bg-bg-tertiary text-text border border-border rounded-lg px-4 py-2.5
					text-sm focus:outline-none focus:border-accent"
			>
				<option value="claude-opus-4-6">Claude Opus 4.6</option>
				<option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
				<option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
			</select>
			<p class="text-[11px] text-text-secondary">Used for chat conversations.</p>
		</div>

		<!-- Extraction Model -->
		<div class="space-y-2">
			<label class="block text-xs text-text-secondary" for="settings-extraction-model">Extraction Model</label>
			<select
				id="settings-extraction-model"
				value={$settings.extractionModel}
				onchange={updateExtractionModel}
				class="w-full bg-bg-tertiary text-text border border-border rounded-lg px-4 py-2.5
					text-sm focus:outline-none focus:border-accent"
			>
				<option value="claude-opus-4-6">Claude Opus 4.6</option>
				<option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
				<option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
			</select>
			<p class="text-[11px] text-text-secondary">Used for knowledge extraction and journal summaries. Haiku is faster and cheaper.</p>
		</div>

		<!-- Writing Perspective -->
		<div class="space-y-2">
			<label class="block text-xs text-text-secondary" for="settings-perspective">Note Writing Style</label>
			<select
				id="settings-perspective"
				value={$settings.writingPerspective || 'second'}
				onchange={updatePerspective}
				class="w-full bg-bg-tertiary text-text border border-border rounded-lg px-4 py-2.5
					text-sm focus:outline-none focus:border-accent"
			>
				<option value="second">Second person — "You decided..."</option>
				<option value="first">First person — "I decided..."</option>
			</select>
			<p class="text-[11px] text-text-secondary">How extracted notes and journal entries are written.</p>
		</div>

		<!-- Clear Chat -->
		<div class="pt-4 border-t border-border">
			<button
				onclick={() => { if (confirm('Clear all chat history? Your vault notes will be kept.')) clearMessages(); }}
				class="px-4 py-2 bg-red-900/30 text-red-400 border border-red-900/50 rounded-lg text-sm
					hover:bg-red-900/50 transition-colors"
			>
				Clear Chat History
			</button>
			<p class="text-[11px] text-text-secondary mt-1.5">
				This only clears the conversation. Your extracted notes and journals are safe.
			</p>
		</div>

		{#if saved}
			<div class="fixed bottom-6 right-6 bg-accent/20 text-accent px-4 py-2 rounded-lg text-sm">
				{saved}
			</div>
		{/if}
	</div>
</div>
