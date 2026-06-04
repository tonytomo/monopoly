<script lang="ts">
	import Property from '$lib/components/property.svelte';
	import { onMount } from 'svelte';
	import { boardProperties } from '../lib/config/board';
	import { currentId } from '$lib/stores/game';
	import DicePanel from '$lib/components/dice-panel.svelte';
	import DetailsPanel from '$lib/components/details-panel.svelte';

	const bottomRow = boardProperties.slice(0, 11).toReversed();
	const leftRow = boardProperties.slice(11, 20).toReversed();
	const topRow = boardProperties.slice(20, 31);
	const rightRow = boardProperties.slice(31, 40);

	onMount(() => {
		$currentId = 0;
	});
</script>

<DetailsPanel />

<DicePanel />

<main class="relative h-screen w-screen overflow-hidden">
	<section
		id="board"
		class="grid-board h-[80vh] origin-center translate-y-18 rotate-45 -skew-8 rounded-2xl border-t-2 border-r-8 border-b-8 border-l-2 border-neutral-300"
	>
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
