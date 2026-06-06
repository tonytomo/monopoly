<script lang="ts">
	import { players, currentPlayerIndex } from '$lib/stores/game';

	// Map Tailwind bg-* tokens to raw hex for inline use
	const colorMap: Record<string, string> = {
		'bg-red-500': '#ef4444',
		'bg-blue-500': '#3b82f6',
		'bg-yellow-500': '#eab308',
		'bg-green-500': '#22c55e'
	};

	function formatMoney(amount: number): string {
		return `$${amount.toLocaleString()}`;
	}
</script>

<!-- Player HUD – Top-Right Floating Panel -->
<div class="hud-panel">
	{#each $players as player, i (player.id)}
		{@const isActive = i === $currentPlayerIndex}
		{@const dotColor = colorMap[player.color] ?? '#9ca3af'}

		<div
			class="player-row"
			class:active={isActive}
			class:bankrupt={player.isBankrupt}
			class:jailed={player.inJail}
		>
			<!-- Color indicator dot -->
			<span
				class="color-dot"
				style="background: {dotColor}; box-shadow: 0 0 {isActive ? '8px' : '0px'} {dotColor};"
			></span>

			<!-- Name -->
			<span class="player-name">{player.name}</span>

			<!-- Money -->
			<span class="player-money" class:negative={player.money < 0}>
				{formatMoney(player.money)}
			</span>

			<!-- Jail badge -->
			{#if player.inJail}
				<span class="jail-badge">⛓ {player.jailTurnsLeft}</span>
			{/if}

			<!-- Active turn indicator arrow -->
			{#if isActive}
				<span class="turn-indicator">▶</span>
			{/if}
		</div>
	{/each}
</div>

<style>
	/* ---- Floating Panel ---- */
	.hud-panel {
		position: fixed;
		top: 2rem;
		right: 2rem;
		z-index: 45;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.625rem;
		border-radius: 1.25rem;
		background: rgba(255, 255, 255, 0.8);
		border: 2px solid #d4d4d4;
		border-bottom: 6px solid #d4d4d4;
		backdrop-filter: blur(16px);
		min-width: 200px;
	}

	/* ---- Individual Player Row ---- */
	.player-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.625rem;
		border-radius: 0.75rem;
		transition: all 0.25s ease;
		position: relative;
	}

	.player-row.active {
		background: rgba(99, 102, 241, 0.08);
	}

	.player-row.bankrupt {
		opacity: 0.35;
		filter: grayscale(0.8);
	}

	.player-row.jailed {
		background: rgba(239, 68, 68, 0.06);
	}

	/* ---- Color Dot ---- */
	.color-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
		transition:
			box-shadow 0.3s ease,
			transform 0.3s ease;
	}

	.player-row.active .color-dot {
		transform: scale(1.25);
	}

	/* ---- Name ---- */
	.player-name {
		font-size: 0.8rem;
		font-weight: 700;
		color: #1f2937;
		flex: 1;
		letter-spacing: -0.01em;
	}

	/* ---- Money ---- */
	.player-money {
		font-size: 0.8rem;
		font-weight: 800;
		color: #111827;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}

	.player-money.negative {
		color: #dc2626;
	}

	/* ---- Jail Badge ---- */
	.jail-badge {
		font-size: 0.6rem;
		font-weight: 800;
		color: #dc2626;
		background: #fee2e2;
		padding: 0.1rem 0.4rem;
		border-radius: 999px;
		letter-spacing: 0.02em;
		flex-shrink: 0;
	}

	/* ---- Active Turn Arrow ---- */
	.turn-indicator {
		position: absolute;
		left: -0.25rem;
		font-size: 0.45rem;
		color: #6366f1;
		animation: pulse-arrow 1.2s ease-in-out infinite;
	}

	@keyframes pulse-arrow {
		0%,
		100% {
			opacity: 1;
			transform: translateX(0);
		}
		50% {
			opacity: 0.5;
			transform: translateX(2px);
		}
	}
</style>
