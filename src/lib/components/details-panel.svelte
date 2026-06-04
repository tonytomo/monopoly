<script lang="ts">
	import { activeId } from '$lib/stores/game';
	import { boardProperties } from '$lib/config/board';
	import { getPropertyColor, isBuyableProperty, isCityProperty } from '$lib/utils/property-utils';
	import { PropertyType } from '$lib/types/property';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let property = $derived(boardProperties[$activeId]);
	let bgColor = $derived(getPropertyColor(property));
	let isOpen = $derived($activeId >= 0);

	function close() {
		$activeId = -1;
	}

	function getTypeName(type: PropertyType): string {
		switch (type) {
			case PropertyType.Station:
				return 'Stasiun';
			case PropertyType.Utility:
				return 'Utilitas';
			case PropertyType.Chance:
				return 'Kesempatan';
			case PropertyType.CommunityChest:
				return 'Dana Umum';
			case PropertyType.Tax:
				return 'Pajak';
			case PropertyType.Go:
				return 'Mulai';
			case PropertyType.Jail:
				return 'Penjara';
			case PropertyType.FreeParking:
				return 'Parkir Gratis';
			case PropertyType.GoToJail:
				return 'Masuk Penjara';
			default:
				return 'Properti';
		}
	}
</script>

{#if isOpen && property}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		transition:fade={{ duration: 250, easing: cubicOut }}
		class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
		onclick={close}
	></div>

	<!-- Panel -->
	<aside
		transition:fly={{ x: 384, duration: 300, easing: cubicOut }}
		class="fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-neutral-700 bg-neutral-900 text-white shadow-2xl"
	>
		<!-- Color header -->
		<div class="relative {isCityProperty(property) ? bgColor : 'bg-neutral-800'} px-6 py-8">
			<button
				onclick={close}
				class="absolute top-3 right-3 grid size-8 cursor-pointer place-items-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50"
			>
				✕
			</button>
			<p class="mb-1 text-xs font-semibold tracking-widest text-white/60 uppercase">
				{getTypeName(property.type)}
			</p>
			<h2 class="text-2xl font-bold">{property.name}</h2>
		</div>

		<!-- Body -->
		<div class="flex flex-1 flex-col gap-6 px-6 py-6">
			{#if isBuyableProperty(property)}
				<!-- Price section -->
				<section>
					<h3 class="mb-3 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
						Harga
					</h3>
					<div class="grid grid-cols-2 gap-3">
						<div class="rounded-lg bg-neutral-800 px-4 py-3">
							<p class="text-xs text-neutral-400">Beli</p>
							<p class="text-lg font-bold text-emerald-400">{property.price.basePrice}M</p>
						</div>
						{#if property.price.housePrice > 0}
							<div class="rounded-lg bg-neutral-800 px-4 py-3">
								<p class="text-xs text-neutral-400">Peningkatan</p>
								<p class="text-lg font-bold text-amber-400">{property.price.housePrice}M</p>
							</div>
						{/if}
						<div class="rounded-lg bg-neutral-800 px-4 py-3">
							<p class="text-xs text-neutral-400">Gadai</p>
							<p class="text-lg font-bold text-red-400">{property.price.mortgagePrice}M</p>
						</div>
					</div>
				</section>
			{/if}

			{#if isCityProperty(property)}
				<!-- Rent section -->
				<section>
					<h3 class="mb-3 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
						Sewa
					</h3>
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between rounded-lg bg-neutral-800 px-4 py-2.5">
							<span class="text-sm text-neutral-300">Tanah kosong</span>
							<span class="font-semibold text-white">{property.rent.baseRent}M</span>
						</div>
						<div class="flex items-center justify-between rounded-lg bg-neutral-800 px-4 py-2.5">
							<span class="text-sm text-neutral-300">🏠 × 1</span>
							<span class="font-semibold text-white">{property.rent.house1}M</span>
						</div>
						<div class="flex items-center justify-between rounded-lg bg-neutral-800 px-4 py-2.5">
							<span class="text-sm text-neutral-300">🏠 × 2</span>
							<span class="font-semibold text-white">{property.rent.house2}M</span>
						</div>
						<div class="flex items-center justify-between rounded-lg bg-neutral-800 px-4 py-2.5">
							<span class="text-sm text-neutral-300">🏠 × 3</span>
							<span class="font-semibold text-white">{property.rent.house3}M</span>
						</div>
						<div class="flex items-center justify-between rounded-lg bg-neutral-800 px-4 py-2.5">
							<span class="text-sm text-neutral-300">🏠 × 4</span>
							<span class="font-semibold text-white">{property.rent.house4}M</span>
						</div>
						<div class="flex items-center justify-between rounded-lg bg-neutral-800 px-4 py-2.5">
							<span class="text-sm text-neutral-300">🏨 Hotel</span>
							<span class="font-semibold text-emerald-400">{property.rent.hotel}M</span>
						</div>
					</div>
				</section>
			{:else if property.type === PropertyType.Station}
				<section>
					<h3 class="mb-3 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
						Sewa
					</h3>
					<div class="rounded-lg bg-neutral-800 px-4 py-3">
						<p class="text-xs text-neutral-400">Sewa dasar</p>
						<p class="text-lg font-bold text-white">{property.rent.baseRent}M</p>
					</div>
				</section>
			{:else if property.type === PropertyType.Tax}
				<section>
					<h3 class="mb-3 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
						Pajak
					</h3>
					<div class="rounded-lg bg-neutral-800 px-4 py-3">
						<p class="text-xs text-neutral-400">Bayar</p>
						<p class="text-lg font-bold text-red-400">{property.rent.baseRent}M</p>
					</div>
				</section>
			{/if}
		</div>
	</aside>
{/if}
