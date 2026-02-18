<!-- Onboarding — first-run setup for API key and vault directory. -->
<script lang="ts">
	import { saveSetting, isConfigured, settings } from '$lib/stores/settings';
	import { ensureVaultStructure } from '$lib/vault/filesystem';
	import { open } from '@tauri-apps/plugin-dialog';
	import { get } from 'svelte/store';

	// Pre-fill from existing settings if available (e.g. reconfiguring after error)
	const existing = get(settings);
	let apiKey = $state(existing.apiKey || '');
	let vaultPath = $state(existing.vaultPath || '');
	let error = $state('');
	let step = $state(existing.apiKey ? 2 : 1);

	async function selectVault() {
		const selected = await open({
			directory: true,
			multiple: false,
			title: 'Choose your Mycelia vault folder'
		});
		if (selected) {
			vaultPath = selected as string;
		}
	}

	async function finish() {
		if (!apiKey.trim()) {
			error = 'Please enter your Anthropic API key.';
			return;
		}
		if (!vaultPath) {
			error = 'Please select a vault directory.';
			return;
		}

		error = '';
		await saveSetting('apiKey', apiKey.trim());
		await saveSetting('vaultPath', vaultPath);
		await ensureVaultStructure(vaultPath);
	}
</script>

<div class="flex items-center justify-center h-screen bg-bg">
	<div class="max-w-md w-full px-8">
		<div class="text-center mb-8">
			<div class="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold mx-auto mb-4">
				M
			</div>
			<h1 class="text-2xl font-semibold text-text mb-2">Welcome to Mycelia</h1>
			<p class="text-text-secondary text-sm">
				Your conversation-first knowledge base. Just talk — Mycelia organizes everything into markdown, automatically.
			</p>
		</div>

		{#if step === 1}
			<div class="space-y-4">
				<div>
					<label class="block text-xs text-text-secondary mb-1.5" for="api-key">
						Anthropic API Key
					</label>
					<input
						id="api-key"
						type="password"
						bind:value={apiKey}
						placeholder="sk-ant-..."
						class="w-full bg-bg-tertiary text-text border border-border rounded-lg px-4 py-2.5
							text-sm placeholder-text-secondary focus:outline-none focus:border-accent"
					/>
					<p class="text-[11px] text-text-secondary mt-1.5">
						Your key stays on your machine. Never sent anywhere except Anthropic's API.
					</p>
				</div>
				<button
					onclick={() => { if (apiKey.trim()) step = 2; else error = 'Please enter your API key.'; }}
					class="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-medium
						hover:bg-accent-hover transition-colors"
				>
					Next
				</button>
			</div>
		{:else}
			<div class="space-y-4">
				<div>
					<label class="block text-xs text-text-secondary mb-1.5">
						Vault Directory
					</label>
					<div class="flex gap-2">
						<div class="flex-1 bg-bg-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-secondary truncate">
							{vaultPath || 'No folder selected'}
						</div>
						<button
							onclick={selectVault}
							class="px-4 py-2.5 bg-bg-tertiary border border-border rounded-lg text-sm text-text
								hover:border-accent transition-colors"
						>
							Browse
						</button>
					</div>
					<p class="text-[11px] text-text-secondary mt-1.5">
						Mycelia will create markdown files here. Works with Obsidian.
					</p>
				</div>
				<button
					onclick={finish}
					disabled={!vaultPath}
					class="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-medium
						hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
				>
					Start Talking
				</button>
				<button
					onclick={() => step = 1}
					class="w-full py-2 text-text-secondary text-xs hover:text-text transition-colors"
				>
					Back
				</button>
			</div>
		{/if}

		{#if error}
			<p class="text-red-400 text-xs mt-3 text-center">{error}</p>
		{/if}
	</div>
</div>
