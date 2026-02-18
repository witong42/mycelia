<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Onboarding from '$lib/components/Onboarding.svelte';
	import { onMount } from 'svelte';
	import { initSettings, isConfigured } from '$lib/stores/settings';
	import { ensureVaultStructure } from '$lib/vault/filesystem';
	import { loadChatHistory } from '$lib/stores/chat';

	let { children } = $props();
	let ready = $state(false);
	let initError = $state('');

	onMount(async () => {
		try {
			const s = await initSettings();
			if (s.vaultPath) {
				try {
					await ensureVaultStructure(s.vaultPath);
					await loadChatHistory();
				} catch (err) {
					console.error('Vault access failed:', err);
					// Vault path is stale or inaccessible — let user reconfigure
					initError = `Can't access vault at ${s.vaultPath}. Please reconfigure.`;
				}
			}
		} catch (err) {
			console.error('Settings init failed:', err);
			initError = 'Failed to load settings.';
		}
		ready = true;
	});
</script>

<svelte:head>
	<title>Mycelia</title>
</svelte:head>

{#if !ready}
	<div class="flex items-center justify-center h-screen bg-bg">
		<div class="text-text-secondary text-sm">Loading...</div>
	</div>
{:else if initError && !$isConfigured}
	<div class="flex items-center justify-center h-screen bg-bg">
		<div class="text-center">
			<p class="text-red-400 text-sm mb-4">{initError}</p>
			<Onboarding />
		</div>
	</div>
{:else if !$isConfigured}
	<Onboarding />
{:else}
	<div class="flex h-screen bg-bg overflow-hidden">
		<Sidebar />
		<main class="flex-1 flex flex-col overflow-hidden">
			{@render children()}
		</main>
	</div>
{/if}
