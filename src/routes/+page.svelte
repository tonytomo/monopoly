<script lang="ts">
	import Property from '$lib/components/property.svelte';
	import { cameraTo } from '$lib/utils/camera-utils';
	import { onMount } from 'svelte';
	import { board } from '../lib/config/board';
	import { currentId, next, previous, zoom } from '$lib/stores/game';

	const bottomRow = board.slice(0, 11).toReversed();
	const leftRow = board.slice(11, 20).toReversed();
	const topRow = board.slice(20, 31);
	const rightRow = board.slice(31, 40);

	onMount(() => {
		cameraTo(0);
		$currentId = 0;
	});

	function toggleZoom() {
		$zoom = !$zoom;
		new Promise((resolve) => setTimeout(resolve, 10)).then(() => cameraTo($currentId));
	}
</script>

<div class="fixed right-8 bottom-8 z-50 bg-white p-8">
	<p>{$currentId}</p>
	<button onclick={next}>Next</button>
	<br />
	<button onclick={previous}>Prev</button>
	<br />
	<button onclick={toggleZoom}>Zoom</button>
</div>

<main class="relative h-screen w-screen overflow-auto">
	<section id="board" class="grid-board {$zoom ? 'zoom-in' : 'zoom-out'}">
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
