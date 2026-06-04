<script lang="ts">
	import { activeId, currentId } from '$lib/stores/game';
	import { type Property } from '../types/property';
	import {
		getPropertyColor,
		getPropertyRotation,
		getRoundedCorner,
		isBuyableProperty,
		isCityProperty
	} from '$lib/utils/property-utils';

	interface Props {
		property: Property;
		orientation: 't' | 'b' | 'l' | 'r' | 'tl' | 'tr' | 'bl' | 'br';
	}

	let { property, orientation }: Props = $props();

	let bgColor = $derived(getPropertyColor(property));
	let rotation = $derived(getPropertyRotation(orientation));
	let rounded = $derived(getRoundedCorner(orientation));

	function click() {
		$activeId = property.id;
	}
</script>

<button
	id="s{property.id}"
	onclick={click}
	class="relative cursor-pointer border border-neutral-300 {rounded} {!isCityProperty(property)
		? bgColor
		: ''} {$currentId === property.id ? 'ring-4 ring-red-500' : ''}"
>
	{#if isCityProperty(property)}
		{#if orientation === 'b'}
			<div
				class="absolute top-0 grid min-h-8 w-full place-items-center border-b border-neutral-200 py-1 {bgColor}"
			>
				<p class="text-[0.6rem] font-bold tracking-wide text-white uppercase {rotation}">
					{property.displayName}
				</p>
			</div>
		{/if}
		{#if orientation === 't'}
			<div
				class="absolute bottom-0 grid min-h-8 w-full place-items-center border-t border-neutral-200 py-1 {bgColor}"
			>
				<p class="text-[0.6rem] font-bold tracking-wide text-white uppercase {rotation}">
					{property.displayName}
				</p>
			</div>
		{/if}
		{#if orientation === 'l'}
			<div
				class="absolute top-0 right-0 grid h-full min-w-8 place-items-center border-l border-neutral-200 px-1 {bgColor}"
			>
				<p class="text-[0.6rem] font-bold tracking-wide text-white uppercase {rotation}">
					{property.displayName}
				</p>
			</div>
		{/if}
		{#if orientation === 'r'}
			<div
				class="absolute top-0 left-0 grid h-full min-w-8 place-items-center border-r border-neutral-200 px-1 {bgColor}"
			>
				<p class="text-[0.6rem] font-bold tracking-wide text-white uppercase {rotation}">
					{property.displayName}
				</p>
			</div>
		{/if}
	{/if}
	<div
		class="flex size-full {rotation} {isBuyableProperty(property)
			? 'justify-between'
			: 'justify-center'} {['l', 't'].includes(orientation) ? 'flex-col-reverse' : 'flex-col'}"
	>
		{#if !isCityProperty(property)}
			<p
				class="font-bold tracking-wide uppercase {property.displayName.length > 1
					? 'text-[0.6rem]'
					: 'text-2xl'}"
			>
				{property.displayName}
			</p>
		{:else}
			<div></div>
		{/if}
		{#if isBuyableProperty(property)}
			<p class="text-[0.75rem] font-medium">
				{property.price.basePrice}M
			</p>
		{/if}
	</div>
</button>
