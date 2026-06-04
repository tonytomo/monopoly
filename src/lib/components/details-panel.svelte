<script lang="ts">
	import { activeId } from '$lib/stores/game';
	import { TileType, ColorGroup } from '$lib/types/tile';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { tiles } from '$lib/config/tiles';

	// Safely retrieve the currently focused tile from our stores
	let tile = $derived($activeId >= 0 ? tiles[$activeId] : null);
	let isOpen = $derived($activeId >= 0);

	function close() {
		$activeId = -1;
	}

	// Map ColorGroup to authentic, vibrant card header colors
	const headerColorMap: Record<ColorGroup, string> = {
		[ColorGroup.Brown]: 'bg-amber-800 text-white border-amber-900',
		[ColorGroup.LightBlue]: 'bg-sky-300 text-neutral-950 border-sky-400',
		[ColorGroup.Pink]: 'bg-pink-500 text-white border-pink-600',
		[ColorGroup.Orange]: 'bg-orange-500 text-neutral-950 border-orange-600',
		[ColorGroup.Red]: 'bg-red-600 text-white border-red-700',
		[ColorGroup.Yellow]: 'bg-yellow-400 text-neutral-950 border-yellow-500',
		[ColorGroup.Green]: 'bg-emerald-600 text-white border-emerald-700',
		[ColorGroup.DarkBlue]: 'bg-blue-800 text-white border-blue-900'
	};

	function getTypeName(type: TileType): string {
		switch (type) {
			case TileType.Railroad:
				return 'Stasiun';
			case TileType.Utility:
				return 'Utilitas';
			case TileType.Tax:
				return 'Pajak';
			case TileType.Action:
				return 'Kartu Aksi';
			default:
				return 'Surat Hak Milik';
		}
	}
</script>

{#if isOpen && tile}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		transition:fade={{ duration: 200, easing: cubicOut }}
		class="fixed inset-0 z-40 bg-neutral-950/60 backdrop-blur-sm"
		onclick={close}
	></div>

	<!-- Panel Sidebar Container -->
	<aside
		transition:fly={{ x: 400, duration: 250, easing: cubicOut }}
		class="fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-neutral-800 bg-neutral-950 text-neutral-200 shadow-2xl"
	>
		<!-- Panel Header -->
		<div class="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
			<div>
				<span class="text-[0.65rem] font-black tracking-widest text-neutral-500 uppercase">
					{getTypeName(tile.type)}
				</span>
				<h3 class="text-sm font-bold text-neutral-100">{tile.name}</h3>
			</div>
			<button
				onclick={close}
				class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
			>
				✕
			</button>
		</div>

		<!-- Panel Body & Deed Card Presentation -->
		<div
			class="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-neutral-900/40 p-6"
		>
			<!-- PHYSICAL TITLE DEED (HAK MILIK) CARD -->
			<div
				class="relative w-full max-w-[300px] border-4 border-neutral-950 bg-white p-4 font-mono text-neutral-900 shadow-xl select-none"
			>
				<!-- STREET DEED CARD DESIGN -->
				{#if tile.type === TileType.Street}
					<!-- Color Banner -->
					<div
						class="mb-4 border-2 border-neutral-950 p-2 text-center {headerColorMap[tile.color]}"
					>
						<span class="block text-[0.55rem] font-extrabold tracking-wider uppercase"
							>SURAT HAK MILIK</span
						>
						<h2 class="mt-1 text-lg leading-none font-black tracking-tight uppercase">
							{tile.name}
						</h2>
					</div>

					<!-- Rent List -->
					<div class="space-y-1.5 text-xs font-bold">
						<div
							class="mb-2 flex items-center justify-between border-b-2 border-neutral-900 pb-1.5 text-center font-black"
						>
							<span>SEWA TANAH KOSONG</span>
							<span class="text-sm">{tile.rent.base}M</span>
						</div>
						<div class="flex items-center justify-between text-neutral-700">
							<span>Dengan 1 Rumah</span>
							<span>{tile.rent[1]}M</span>
						</div>
						<div class="flex items-center justify-between text-neutral-700">
							<span>Dengan 2 Rumah</span>
							<span>{tile.rent[2]}M</span>
						</div>
						<div class="flex items-center justify-between text-neutral-700">
							<span>Dengan 3 Rumah</span>
							<span>{tile.rent[3]}M</span>
						</div>
						<div class="flex items-center justify-between text-neutral-700">
							<span>Dengan 4 Rumah</span>
							<span>{tile.rent[4]}M</span>
						</div>
						<div
							class="mb-2 flex items-center justify-between border-b border-dashed border-neutral-400 pb-2 font-black text-red-700"
						>
							<span>DENGAN HOTEL</span>
							<span>{tile.rent.hotel}M</span>
						</div>

						<!-- Upgrades & Value Rules -->
						<div
							class="space-y-1 py-1 text-center text-[0.65rem] leading-snug font-medium text-neutral-600"
						>
							<p>
								Harga Rumah: <span class="font-bold text-neutral-900">{tile.price.house}M</span> masing-masing
							</p>
							<p>
								Harga Hotel: <span class="font-bold text-neutral-900">{tile.price.house}M</span> plus
								4 rumah
							</p>
							<p class="mt-2 border-t border-neutral-200 pt-2 text-[0.6rem] italic">
								Jika satu pemain memiliki semua kapling dari grup warna tersebut, sewa tanah kosong
								dilipatgandakan ({tile.rent.monopoly}M).
							</p>
						</div>
					</div>

					<!-- RAILROAD DEED CARD DESIGN -->
				{:else if tile.type === TileType.Railroad}
					<div class="mb-4 border-2 border-neutral-950 bg-neutral-50 p-4 text-center">
						<span class="mb-1 block text-2xl">🚂</span>
						<span
							class="block text-[0.55rem] font-extrabold tracking-wider text-neutral-500 uppercase"
							>KONSESI STASIUN</span
						>
						<h2 class="text-md mt-0.5 leading-none font-black tracking-tight uppercase">
							{tile.name}
						</h2>
					</div>

					<div class="space-y-2 text-xs font-bold">
						<div class="mb-2 border-b-2 border-neutral-900 pb-1.5 text-center font-black">
							TARIF SEWA STASIUN
						</div>
						<div class="flex justify-between text-neutral-700">
							<span>Memiliki 1 Stasiun</span>
							<span>{tile.rent[0]}M</span>
						</div>
						<div class="flex justify-between text-neutral-700">
							<span>Memiliki 2 Stasiun</span>
							<span>{tile.rent[1]}M</span>
						</div>
						<div class="flex justify-between text-neutral-700">
							<span>Memiliki 3 Stasiun</span>
							<span>{tile.rent[2]}M</span>
						</div>
						<div
							class="flex justify-between border-b border-dashed border-neutral-400 pb-2 font-black text-neutral-900"
						>
							<span>MEMILIKI 4 STASIUN</span>
							<span>{tile.rent[3]}M</span>
						</div>
					</div>

					<!-- UTILITY DEED CARD DESIGN -->
				{:else if tile.type === TileType.Utility}
					<div class="mb-4 border-2 border-neutral-950 bg-neutral-50 p-4 text-center">
						<span class="mb-1 block text-2xl">
							{tile.name.includes('PLN') ? '🔌' : '💧'}
						</span>
						<span
							class="block text-[0.55rem] font-extrabold tracking-wider text-neutral-500 uppercase"
							>KONSESI UTILITAS</span
						>
						<h2 class="text-md mt-0.5 leading-none font-black tracking-tight uppercase">
							{tile.name}
						</h2>
					</div>

					<div
						class="space-y-3 py-2 text-center text-xs leading-relaxed font-semibold text-neutral-700"
					>
						<p>
							Jika 1 utilitas dimiliki, sewa adalah sebesar <span
								class="font-extrabold text-neutral-900">{tile.multipliers[0]}x</span
							> angka yang tertera pada dadu.
						</p>
						<p class="border-t border-dashed border-neutral-400 pt-2">
							Jika kedua utilitas dimiliki, sewa adalah sebesar <span
								class="font-extrabold text-neutral-900">{tile.multipliers[1]}x</span
							> angka yang tertera pada dadu.
						</p>
					</div>

					<!-- TAX & UTILITIES DEED CARD DESIGN -->
				{:else if tile.type === TileType.Tax}
					<div class="border-2 border-dashed border-red-500 bg-red-50 p-6 text-center text-red-950">
						<span class="mb-2 block text-3xl">🧾</span>
						<span class="block text-[0.55rem] font-black tracking-wider text-red-700 uppercase"
							>SURAT TAGIHAN</span
						>
						<h2 class="mt-1 mb-2 text-lg leading-none font-black tracking-tight uppercase">
							{tile.name}
						</h2>
						<div class="mt-2 border-t-2 border-red-200 pt-2 text-2xl font-black text-rose-700">
							-{tile.cost}M
						</div>
						<p class="mt-2 text-[0.6rem] font-bold text-red-600">
							Harap segera bayar ke Bank saat mendarat.
						</p>
					</div>

					<!-- ACTION CARDS DESIGN (GO, CHANCE, JAIL, ETC.) -->
				{:else if tile.type === TileType.Action}
					<div
						class="double-border border-4 border-double border-neutral-950 bg-neutral-50 p-6 text-center"
					>
						<span class="mb-2 block text-4xl">
							{#if tile.actionType === 'GO'}🏁{:else if tile.actionType === 'JAIL'}👮{:else if tile.actionType === 'GO_TO_JAIL'}🚨{:else if tile.actionType === 'CHANCE'}❓{:else if tile.actionType === 'COMMUNITY_CHEST'}📦{:else}🚗{/if}
						</span>
						<span class="block text-[0.55rem] font-black tracking-wider text-neutral-500 uppercase"
							>RUANG KHUSUS</span
						>
						<h2 class="mt-1 text-lg leading-none font-black tracking-tight uppercase">
							{tile.name}
						</h2>
						<p class="mt-3 text-[0.65rem] leading-relaxed font-medium text-neutral-600">
							{#if tile.actionType === 'GO'}
								Terima 200M setiap melewati petak ini.
							{:else if tile.actionType === 'JAIL'}
								Berada di Penjara (Kunjungan biasa atau tahanan).
							{:else if tile.actionType === 'GO_TO_JAIL'}
								Melangkah langsung ke Penjara tanpa melewati GO.
							{:else if tile.actionType === 'CHANCE'}
								Ambil satu kartu Kesempatan di tengah papan.
							{:else if tile.actionType === 'COMMUNITY_CHEST'}
								Ambil satu kartu Dana Umum di tengah papan.
							{:else}
								Pergi kemana saja pada giliranmu selanjutnya!
							{/if}
						</p>
					</div>
				{/if}

				<!-- Mortgage Footer (For Buyable Cards) -->
				{#if tile.type === TileType.Street || tile.type === TileType.Railroad || tile.type === TileType.Utility}
					<div
						class="mt-4 border-t-2 border-neutral-900 pt-3 text-center text-[0.65rem] font-bold text-neutral-500"
					>
						NILAI GADAI : <span class="font-black text-neutral-950">{tile.price.mortgage}M</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Sidebar Actions Panel Footer -->
		{#if tile.type === TileType.Street || tile.type === TileType.Railroad || tile.type === TileType.Utility}
			<div
				class="border-t border-neutral-800 bg-neutral-900/60 p-4 text-center font-mono text-[0.7rem] text-neutral-400"
			>
				Harga Pembelian Properti: <span class="text-sm font-extrabold text-emerald-400"
					>{tile.price.base}M</span
				>
			</div>
		{/if}
	</aside>
{/if}

<style>
	/* Doubles border design using basic styling rules */
	.double-border {
		border-style: double;
		border-width: 6px;
	}
</style>
