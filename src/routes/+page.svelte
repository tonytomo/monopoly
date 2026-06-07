<script lang="ts">
	import { tiles } from '../lib/config/tiles';
	import type { BoardTile } from '$lib/types/tile';
	import Tile from '$lib/components/tile.svelte';
	import DicePanel from '$lib/components/dice-panel.svelte';
	import Hud from '$lib/components/hud.svelte';
	import ActionPanel from '$lib/components/action-panel.svelte';
	import CardOverlay from '$lib/components/card-overlay.svelte';
	import { playBgMusic } from '$lib/utils/sound';
	import { onMount } from 'svelte';

	onMount(() => {
		const startAudio = () => {
			playBgMusic();
			document.removeEventListener('click', startAudio);
			document.removeEventListener('keydown', startAudio);
		};
		document.addEventListener('click', startAudio);
		document.addEventListener('keydown', startAudio);
	});

	// Typed slices from the unified static board config
	const bottomRow: BoardTile[] = tiles.slice(0, 11).toReversed();
	const leftRow: BoardTile[] = tiles.slice(11, 20).toReversed();
	const topRow: BoardTile[] = tiles.slice(20, 31);
	const rightRow: BoardTile[] = tiles.slice(31, 40);
</script>

<ActionPanel />
<CardOverlay />

<DicePanel />

<Hud />

<main class="relative flex h-screen w-screen items-center justify-center bg-slate-400">
	<section
		id="board"
		class="grid-board h-[80vh] origin-center rotate-45 -skew-8 rounded-2xl border-t-2 border-r-8 border-b-8 border-l-2 border-neutral-300"
	>
		{#each Array.from({ length: 11 }, (_, i) => i) as i (i)}
			{#if i === 0}
				<!-- Top Row (Left to Right: Free Parking to Go To Jail) -->
				{#each topRow as tile (tile.id)}
					{#if tile.id === 20}
						<Tile {tile} orientation="tl" />
					{:else if tile.id === 30}
						<Tile {tile} orientation="tr" />
					{:else}
						<Tile {tile} orientation="t" />
					{/if}
				{/each}
			{:else if i === 10}
				<!-- Bottom Row (Left to Right: Jail to Mulai/GO) -->
				{#each bottomRow as tile (tile.id)}
					{#if tile.id === 0}
						<Tile {tile} orientation="br" />
					{:else if tile.id === 10}
						<Tile {tile} orientation="bl" />
					{:else}
						<Tile {tile} orientation="b" />
					{/if}
				{/each}
			{:else}
				<!-- Middle Rows: Left Column, 9 Empty Spaces, Right Column -->
				<Tile tile={leftRow[i - 1]} orientation="l" />
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{#each Array.from({ length: 9 }) as _, j (j)}
					<div class="inner-deck bg-neutral-100"></div>
				{/each}
				<Tile tile={rightRow[i - 1]} orientation="r" />
			{/if}
		{/each}
	</section>
</main>
