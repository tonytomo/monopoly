<script lang="ts">
	import { ownership, players, tooltipTileId } from '$lib/stores/game';
	import type { BoardTile } from '$lib/types/tile';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		tile: BoardTile;
	}

	let { tile }: Props = $props();

	let isVisible = $derived($tooltipTileId === tile.id);

	let ownerId = $derived($ownership.get(tile.id));
	let owner = $derived(ownerId !== undefined ? $players.find((p) => p.id === ownerId) : undefined);

	// Map player color tokens to hex
	const playerColorHex: Record<string, string> = {
		'bg-red-500': '#ef4444',
		'bg-blue-500': '#3b82f6',
		'bg-yellow-500': '#eab308',
		'bg-green-500': '#22c55e'
	};

	function closeTooltip() {
		if ($tooltipTileId === tile.id) {
			$tooltipTileId = -1;
		}
	}
</script>

<svelte:window onclick={closeTooltip} />

{#if isVisible}
	<div
		transition:fade={{ duration: 150, easing: cubicOut }}
		class="pointer-events-none absolute top-1/2 left-0 z-50 mb-2 w-max min-w-[140px] -translate-x-1/2 -translate-y-full -rotate-45 skew-0 rounded-xl border border-neutral-700/50 bg-neutral-900/95 px-4 py-3 text-center shadow-2xl backdrop-blur-md"
	>
		<div
			class="mb-1 text-[0.7rem] font-black tracking-widest text-neutral-100 uppercase drop-shadow-sm"
		>
			{tile.name}
		</div>

		{#if owner}
			<div class="mt-1.5 flex items-center justify-center gap-2">
				<span
					class="size-2 rounded-full shadow-sm"
					style="background: {playerColorHex[owner.color] ??
						'#9ca3af'}; box-shadow: 0 0 6px {playerColorHex[owner.color] ?? '#9ca3af'};"
				></span>
				<span class="text-[0.65rem] font-bold text-neutral-300">
					Milik <span class="text-white">{owner.name}</span>
				</span>
			</div>
		{/if}

		<!-- Tooltip pointer/arrow -->
		<div
			class="absolute bottom-[-5px] left-1/2 -translate-x-1/2 border-t-[6px] border-r-[6px] border-l-[6px] border-t-neutral-900/95 border-r-transparent border-l-transparent"
		></div>
	</div>
{/if}
