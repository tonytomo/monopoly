<script lang="ts">
	import {
		currentPlayerIndex,
		players,
		tooltipTileId,
		ownership,
		calculateRent,
		lastDiceTotal
	} from '$lib/stores/game';
	import { ColorGroup, TileType, type BoardTile } from '$lib/types/tile';
	import TileTooltip from './tile-tooltip.svelte';

	interface Props {
		tile: BoardTile;
		orientation: 't' | 'b' | 'l' | 'r' | 'tl' | 'tr' | 'bl' | 'br';
	}

	let { tile, orientation }: Props = $props();

	// Player color tokens
	let localTokens = $derived($players.filter((p) => p.position === tile.id && !p.isBankrupt));

	// Map ColorGroup to modern, premium Tailwind colors
	const colorMap: Record<ColorGroup, string> = {
		[ColorGroup.Brown]: 'bg-amber-800 text-amber-100',
		[ColorGroup.LightBlue]: 'bg-sky-400 text-sky-950',
		[ColorGroup.Pink]: 'bg-pink-500 text-pink-50',
		[ColorGroup.Orange]: 'bg-orange-500 text-orange-950',
		[ColorGroup.Red]: 'bg-red-600 text-red-50',
		[ColorGroup.Yellow]: 'bg-yellow-400 text-yellow-950',
		[ColorGroup.Green]: 'bg-emerald-600 text-emerald-50',
		[ColorGroup.DarkBlue]: 'bg-blue-800 text-blue-50'
	};

	// Derived type checking & data accessors
	const isStreet = $derived(tile.type === TileType.Street);
	const isBuyable = $derived(
		tile.type === TileType.Street ||
			tile.type === TileType.Railroad ||
			tile.type === TileType.Utility
	);

	const basePrice = $derived(
		tile.type === TileType.Street ||
			tile.type === TileType.Railroad ||
			tile.type === TileType.Utility
			? tile.price.base
			: null
	);

	// Inline-optimized presentation helpers
	const streetColor = $derived(tile.type === TileType.Street ? colorMap[tile.color] : '');

	const ownerId = $derived($ownership.get(tile.id));
	const isOwned = $derived(ownerId !== undefined);
	const owner = $derived(isOwned ? $players.find((p) => p.id === ownerId) : undefined);
	const ownerTextColor = $derived(owner ? owner.color : '#000000');
	const currentRent = $derived(
		isOwned && ownerId !== undefined ? calculateRent(tile, ownerId) + $lastDiceTotal * 0 : basePrice
	);

	// Handle background coloring for non-street action/tax spaces
	const tileBgColor = $derived(() => {
		if (isStreet) return 'bg-white hover:bg-neutral-50/90';
		if (tile.type === TileType.Tax) return 'bg-red-50 hover:bg-red-100/80 text-rose-950';
		if (tile.type === TileType.Action) {
			switch (tile.actionType) {
				case 'GO':
					return 'bg-emerald-500 text-white font-black';
				case 'JAIL':
					return 'bg-orange-100 text-orange-950';
				case 'GO_TO_JAIL':
					return 'bg-red-50 text-red-950';
				case 'CHANCE':
					return 'bg-amber-500 text-white';
				case 'COMMUNITY_CHEST':
					return 'bg-blue-500 text-white';
				case 'FREE_PARKING':
					return 'bg-sky-50 text-sky-950';
				default:
					return 'bg-neutral-100 text-neutral-800';
			}
		}
		return 'bg-neutral-50 hover:bg-neutral-100 text-neutral-900';
	});

	// Orientation rotations to face texts outward beautifully
	const rotations = {
		t: 'rotate-0',
		b: 'rotate-0',
		l: '-rotate-90',
		r: '-rotate-90',
		tl: '-rotate-45',
		tr: '-rotate-45',
		bl: '-rotate-45',
		br: '-rotate-45'
	};
	const rotation = $derived(rotations[orientation] || 'rotate-0');

	// Rounded corners for the outer edges of the grid board
	const roundedCorners = {
		tl: 'rounded-tl-lg',
		tr: 'rounded-tr-lg',
		bl: 'rounded-bl-lg',
		br: 'rounded-br-lg',
		t: '',
		b: '',
		l: '',
		r: ''
	};
	const rounded = $derived(roundedCorners[orientation] || '');

	function click(e: MouseEvent) {
		console.log('Tile clicked:', tile);
		e.stopPropagation();
		if ($tooltipTileId === tile.id) {
			$tooltipTileId = -1;
		} else {
			$tooltipTileId = tile.id;
		}
	}
</script>

<button
	id="s{tile.id}"
	onclick={click}
	class="relative flex cursor-pointer flex-col border border-neutral-200 p-1 transition-all duration-200 select-none {rounded} {tileBgColor()}"
>
	<!-- 1. Header Bar for Street/City Properties -->
	{#if isStreet}
		{#if orientation === 'b'}
			<div
				class="absolute top-0 left-0 flex h-1/2 w-full flex-col items-center border-b border-neutral-200/60 {streetColor}"
			>
				<p
					class="flex w-min flex-1 items-center text-[0.55rem] leading-none font-black tracking-wider uppercase {rotation}"
				>
					{tile.displayName}
				</p>
			</div>
		{/if}
		{#if orientation === 't'}
			<div
				class="absolute bottom-0 left-0 flex h-1/2 w-full flex-col items-center border-t border-neutral-200/60 {streetColor}"
			>
				<p
					class="flex w-min flex-1 items-center text-[0.55rem] leading-none font-black tracking-wider uppercase {rotation}"
				>
					{tile.displayName}
				</p>
			</div>
		{/if}
		{#if orientation === 'l'}
			<div
				class="absolute top-0 right-0 flex h-full w-1/2 items-center border-l border-neutral-200/60 {streetColor}"
			>
				<p
					class="flex w-min flex-1 justify-center text-[0.55rem] leading-none font-black tracking-wider uppercase {rotation}"
				>
					{tile.displayName}
				</p>
			</div>
		{/if}
		{#if orientation === 'r'}
			<div
				class="absolute top-0 left-0 flex h-full w-1/2 items-center border-r border-neutral-200/60 {streetColor}"
			>
				<p
					class="flex w-min flex-1 justify-center text-[0.55rem] leading-none font-black tracking-wider uppercase {rotation}"
				>
					{tile.displayName}
				</p>
			</div>
		{/if}
	{/if}

	<!-- 2. Main Content & Pricing Layout -->
	<div
		class="flex size-full items-center {rotation} {isBuyable
			? 'justify-between'
			: 'justify-center'} {['l', 't'].includes(orientation) ? 'flex-col-reverse' : 'flex-col'}"
	>
		{#if !isStreet}
			<!-- Non-street descriptive title / iconic graphic -->
			<div class="flex flex-1 items-center">
				<span
					class="w-min text-center leading-none font-extrabold tracking-wide uppercase {tile
						.displayName.length > 4
						? 'text-[0.55rem]'
						: 'text-xs'}"
				>
					{tile.displayName}
				</span>
			</div>
		{:else}
			<!-- Empty placeholder to push the base price of Streets down -->
			<div class="min-h-7"></div>
		{/if}

		<!-- Price displays -->
		{#if isBuyable && basePrice !== null}
			<p
				class="text-[0.65rem] font-black tracking-tight"
				style={isOwned ? `color: ${ownerTextColor}` : ''}
			>
				{isOwned ? currentRent : basePrice}M
			</p>
		{:else if tile.type === TileType.Tax}
			<p class="text-[0.65rem] font-black tracking-tight text-rose-700/50">
				{tile.cost}M
			</p>
		{/if}
	</div>

	<!-- 3. Player Tokens Overlay -->
	{#if localTokens.length > 0}
		<div class="pointer-events-none absolute inset-0 z-20 grid grid-cols-2 p-3">
			{#each localTokens as token (token.id)}
				<div class="relative size-1">
					<div
						class="absolute h-2 w-4 translate-x-2 translate-y-3 -rotate-45 skew-0 rounded-[100%] bg-neutral-900/50"
					></div>
					<div
						class="absolute h-8 w-4 -translate-y-2 -rotate-45 skew-0 animate-bounce rounded-full border-2 border-b-4 border-neutral-100"
						style={`background-color: ${token.color}; opacity: ${$currentPlayerIndex === token.id ? '1' : '0.5'}`}
					></div>
				</div>
			{/each}
		</div>
	{/if}

	<TileTooltip {tile} />
</button>
