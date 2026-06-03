<script lang="ts">
	import { currentId, next, previous, move, toggleZoom, zoom } from '$lib/stores/game';

	let steps = $state(0);
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
