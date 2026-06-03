<script lang="ts">
	import { board } from '$lib/config/board';
	import { currentId, zoom } from '$lib/stores/game';
	import type { Property } from '../types/property';
	import {
		getPropertyColor,
		getPropertyRotation,
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

	function click() {
		console.log(board[property.id].name);
	}
</script>

<button
	id="s{property.id}"
	onclick={click}
	class="relative cursor-pointer scroll-m-32 border {!isCityProperty(property)
		? bgColor
		: ''} {$currentId === property.id ? 'border-8 border-red-500' : ''}"
>
	{#if isCityProperty(property)}
		{#if orientation === 'b'}
			<div class="absolute top-0 {$zoom ? 'h-15' : 'h-2'} w-full border {bgColor}"></div>
		{/if}
		{#if orientation === 't'}
			<div class="absolute bottom-0 {$zoom ? 'h-15' : 'h-2'} w-full border {bgColor}"></div>
		{/if}
		{#if orientation === 'l'}
			<div class="absolute top-0 right-0 h-full border {$zoom ? 'w-15' : 'w-2'} {bgColor}"></div>
		{/if}
		{#if orientation === 'r'}
			<div class="absolute top-0 left-0 h-full border {$zoom ? 'w-15' : 'w-2'} {bgColor}"></div>
		{/if}
	{/if}
	<div class="flex flex-col gap-16 place-self-center {rotation}">
		<p class={$zoom ? 'text-4xl font-bold' : 'text-[0.5rem] font-medium'}>{property.name}</p>
		{#if $zoom && isBuyableProperty(property)}
			<p class="text-4xl font-medium">Rp{property.price.basePrice} Juta</p>
		{/if}
	</div>
</button>
