<script lang="ts">
	import { drawnCard, dismissCard, players, currentPlayerIndex } from '$lib/stores/game';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';

	let card = $derived($drawnCard);
	let isOpen = $derived(card !== null);
	let currentPlayer = $derived($players[$currentPlayerIndex]);

	// Deck-specific theming
	let isChance = $derived(card?.deck === 'CHANCE');
	let deckLabel = $derived(isChance ? 'KESEMPATAN' : 'DANA UMUM');
	let deckEmoji = $derived(isChance ? '❓' : '📦');

	// Format effect description for the action badge
	function getEffectLabel(c: typeof card): string {
		if (!c) return '';
		switch (c.action) {
			case 'collect':
				return `+${c.value}M`;
			case 'pay':
				return `-${c.value}M`;
			case 'pay_each_player':
				return `-${c.value}M per pemain`;
			case 'collect_each_player':
				return `+${c.value}M per pemain`;
			case 'move_to':
				return 'Pindah';
			case 'move_back':
				return `Mundur ${c.value} langkah`;
			case 'go_to_jail':
				return 'Penjara!';
			case 'advance_to_nearest_railroad':
				return 'Stasiun terdekat';
			case 'advance_to_nearest_utility':
				return 'Utilitas terdekat';
			case 'repairs':
				return `-${c.value}M`;
			default:
				return '';
		}
	}

	// Get the effect style class based on action type
	function getEffectStyle(c: typeof card): string {
		if (!c) return '';
		switch (c.action) {
			case 'collect':
			case 'collect_each_player':
				return 'effect-positive';
			case 'pay':
			case 'pay_each_player':
			case 'repairs':
				return 'effect-negative';
			case 'go_to_jail':
				return 'effect-danger';
			default:
				return 'effect-neutral';
		}
	}
</script>

{#if isOpen && card}
	<!-- Backdrop -->
	<div transition:fade={{ duration: 250, easing: cubicOut }} class="card-overlay-backdrop"></div>

	<!-- Card Container -->
	<div class="card-overlay-container">
		<div
			in:scale={{ duration: 400, start: 0.6, easing: backOut }}
			out:fade={{ duration: 200 }}
			class="card-stage"
		>
			<!-- Player indicator -->
			<div class="card-player-tag">
				<span class="player-dot" style="background: {currentPlayer?.color ?? '#888'};"></span>
				<span>{currentPlayer?.name ?? 'Pemain'} menarik kartu</span>
			</div>

			<!-- Physical Card -->
			<div class="card-body" class:card-chance={isChance} class:card-community={!isChance}>
				<!-- Card Header Banner -->
				<div class="card-header" class:header-chance={isChance} class:header-community={!isChance}>
					<span class="card-emoji">{deckEmoji}</span>
					<span class="card-deck-label">{deckLabel}</span>
				</div>

				<!-- Card Content -->
				<div class="card-content">
					<h2 class="card-title">{card.title}</h2>
					<p class="card-description">{card.description}</p>

					<!-- Effect Badge -->
					<div class="card-effect {getEffectStyle(card)}">
						{getEffectLabel(card)}
					</div>
				</div>

				<!-- Card Footer -->
				<div class="card-footer" class:footer-chance={isChance} class:footer-community={!isChance}>
					<div class="card-footer-pattern">
						<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
						{#each Array(5) as _, i (i)}
							<span class="footer-diamond">◆</span>
						{/each}
					</div>
				</div>
			</div>

			<!-- Dismiss Button -->
			<button
				class="card-dismiss-btn"
				class:dismiss-chance={isChance}
				class:dismiss-community={!isChance}
				onclick={dismissCard}
			>
				Lanjutkan
			</button>
		</div>
	</div>
{/if}

<style>
	/* ---- Backdrop ---- */
	.card-overlay-backdrop {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(8px);
	}

	/* ---- Container ---- */
	.card-overlay-container {
		position: fixed;
		inset: 0;
		z-index: 61;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	/* ---- Stage ---- */
	.card-stage {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		max-width: 340px;
		width: 100%;
	}

	/* ---- Player Tag ---- */
	.card-player-tag {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.85rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.15);
		font-size: 0.7rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.8);
		letter-spacing: 0.02em;
		backdrop-filter: blur(4px);
	}

	.player-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* ---- Card Body ---- */
	.card-body {
		width: 100%;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.08);
		user-select: none;
		transform: rotate(-1deg);
		transition: transform 0.3s ease;
	}

	.card-body:hover {
		transform: rotate(0deg) scale(1.02);
	}

	.card-chance {
		background: #fffbeb;
	}

	.card-community {
		background: #eff6ff;
	}

	/* ---- Card Header ---- */
	.card-header {
		padding: 1.25rem 1.5rem;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.header-chance {
		background: linear-gradient(135deg, #f59e0b, #d97706, #b45309);
		color: white;
	}

	.header-community {
		background: linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8);
		color: white;
	}

	.card-emoji {
		display: block;
		font-size: 2rem;
		margin-bottom: 0.25rem;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}

	.card-deck-label {
		display: block;
		font-size: 0.6rem;
		font-weight: 900;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		opacity: 0.9;
	}

	/* ---- Card Content ---- */
	.card-content {
		padding: 1.5rem;
		text-align: center;
	}

	.card-title {
		font-size: 1.1rem;
		font-weight: 900;
		color: #0a0a0a;
		letter-spacing: -0.02em;
		margin-bottom: 0.5rem;
		line-height: 1.2;
	}

	.card-description {
		font-size: 0.8rem;
		font-weight: 500;
		color: #525252;
		line-height: 1.5;
		margin-bottom: 1rem;
	}

	/* ---- Effect Badge ---- */
	.card-effect {
		display: inline-block;
		padding: 0.4rem 1rem;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 900;
		letter-spacing: 0.02em;
	}

	.effect-positive {
		background: #dcfce7;
		color: #166534;
		border: 2px solid #86efac;
	}

	.effect-negative {
		background: #fee2e2;
		color: #991b1b;
		border: 2px solid #fca5a5;
	}

	.effect-danger {
		background: #fef2f2;
		color: #7f1d1d;
		border: 2px solid #f87171;
		animation: danger-pulse 1.5s ease-in-out infinite;
	}

	.effect-neutral {
		background: #f5f5f5;
		color: #262626;
		border: 2px solid #d4d4d4;
	}

	@keyframes danger-pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3);
		}
		50% {
			box-shadow: 0 0 12px 4px rgba(239, 68, 68, 0.2);
		}
	}

	/* ---- Card Footer ---- */
	.card-footer {
		padding: 0.75rem;
		text-align: center;
	}

	.footer-chance {
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.15));
		border-top: 2px solid rgba(245, 158, 11, 0.2);
	}

	.footer-community {
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.15));
		border-top: 2px solid rgba(59, 130, 246, 0.2);
	}

	.card-footer-pattern {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
	}

	.footer-diamond {
		font-size: 0.5rem;
		opacity: 0.3;
	}

	.footer-chance .footer-diamond {
		color: #b45309;
	}

	.footer-community .footer-diamond {
		color: #1d4ed8;
	}

	/* ---- Dismiss Button ---- */
	.card-dismiss-btn {
		width: 100%;
		padding: 0.85rem;
		border: none;
		border-radius: 0.85rem;
		font-size: 0.85rem;
		font-weight: 800;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	}

	.dismiss-chance {
		background: linear-gradient(135deg, #f59e0b, #d97706);
		color: white;
	}

	.dismiss-chance:hover {
		background: linear-gradient(135deg, #fbbf24, #f59e0b);
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
	}

	.dismiss-community {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
		color: white;
	}

	.dismiss-community:hover {
		background: linear-gradient(135deg, #60a5fa, #3b82f6);
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
	}

	.card-dismiss-btn:active {
		transform: translateY(0) scale(0.98);
	}
</style>
