<script lang="ts">
	import Property from '$lib/components/property.svelte';
	import { cameraTo } from '$lib/utils/camera-utils';
	import { onMount } from 'svelte';
	import { board } from '../lib/config/board';
	import { currentId, next, previous, rotate, move, toggleZoom, zoom } from '$lib/stores/game';

	const bottomRow = board.slice(0, 11).toReversed();
	const leftRow = board.slice(11, 20).toReversed();
	const topRow = board.slice(20, 31);
	const rightRow = board.slice(31, 40);

	let steps = $state(0);

	onMount(() => {
		cameraTo(0);
		$currentId = 0;
	});
</script>

<div
	class="fixed right-8 bottom-8 z-50 flex w-48 flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-2xl backdrop-blur-lg"
>
	<div class="flex items-center justify-between">
		<span class="text-sm font-bold text-slate-700">Pos: {$currentId}</span>
		<button
			class="rounded-lg bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700 transition hover:bg-slate-300"
			onclick={toggleZoom}
		>
			{$zoom ? 'Zoom Out' : 'Zoom In'}
		</button>
	</div>

	<div class="flex gap-2">
		<button
			class="flex-1 rounded-lg bg-slate-100 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
			onclick={previous}>Prev</button
		>
		<button
			class="flex-1 rounded-lg bg-slate-100 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
			onclick={next}>Next</button
		>
	</div>

	<div class="mt-1 flex gap-2 border-t border-slate-200 pt-3">
		<input
			type="number"
			min="0"
			max="100"
			bind:value={steps}
			class="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
		/>
		<button
			class="flex-1 rounded-lg bg-blue-600 py-1.5 text-sm font-bold text-white transition hover:bg-blue-700"
			onclick={() => move(steps)}
		>
			Go
		</button>
	</div>
</div>

<main class="relative h-screen w-screen overflow-hidden">
	<section id="board" class="grid-board {$rotate} {$zoom ? 'zoom-in' : 'zoom-out'}">
		{#each Array.from({ length: 11 }).map((_, i) => i) as i (i)}
			{#if i === 0}
				{#each topRow as property (property.id)}
					{#if property.id === 20}
						<Property {property} orientation="tl" />
					{:else if property.id === 30}
						<Property {property} orientation="tr" />
					{:else}
						<Property {property} orientation="t" />
					{/if}
				{/each}
			{:else if i === 10}
				{#each bottomRow as property (property.id)}
					{#if property.id === 0}
						<Property {property} orientation="br" />
					{:else if property.id === 10}
						<Property {property} orientation="bl" />
					{:else}
						<Property {property} orientation="b" />
					{/if}
				{/each}
			{:else}
				<Property property={leftRow[i - 1]} orientation="l" />
				{#each Array.from({ length: 9 }).map((_, j) => j) as j (j)}
					<div></div>
				{/each}
				<Property property={rightRow[i - 1]} orientation="r" />
			{/if}
		{/each}
	</section>
</main>
