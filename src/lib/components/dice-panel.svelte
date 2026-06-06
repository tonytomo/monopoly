<script lang="ts">
	import { handleRoll, isMoving } from '$lib/stores/game';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let die1 = $state(1);
	let die2 = $state(1);
	let rolling = $state(false);
	let showMiddleResult = $state(false);
	let resultTimer: ReturnType<typeof setTimeout> | null = null;

	// Dice face dot positions (CSS grid based)
	const dotPositions: Record<number, [number, number][]> = {
		1: [[2, 2]],
		2: [
			[1, 3],
			[3, 1]
		],
		3: [
			[1, 3],
			[2, 2],
			[3, 1]
		],
		4: [
			[1, 1],
			[1, 3],
			[3, 1],
			[3, 3]
		],
		5: [
			[1, 1],
			[1, 3],
			[2, 2],
			[3, 1],
			[3, 3]
		],
		6: [
			[1, 1],
			[1, 2],
			[1, 3],
			[3, 1],
			[3, 2],
			[3, 3]
		]
	};

	// Rotation needed to show each face on top of a 3D cube
	const faceRotations: Record<number, string> = {
		1: 'rotateX(0deg)',
		2: 'rotateX(-90deg)',
		3: 'rotateY(90deg)',
		4: 'rotateY(-90deg)',
		5: 'rotateX(90deg)',
		6: 'rotateX(180deg)'
	};

	function getRandomSpins(): string {
		// High-speed smooth organic rotations
		const xSpins = (Math.floor(Math.random() * 4) + 3) * 360;
		const ySpins = (Math.floor(Math.random() * 4) + 3) * 360;
		return `rotateX(${xSpins}deg) rotateY(${ySpins}deg)`;
	}

	let spin1 = $state(faceRotations[1]);
	let spin2 = $state(faceRotations[1]);

	async function rollDice() {
		if (rolling) return;

		// Reset old middle announcement and timers if rolling again early
		showMiddleResult = false;
		if (resultTimer) clearTimeout(resultTimer);

		rolling = true;

		const result1 = Math.floor(Math.random() * 6) + 1;
		const result2 = Math.floor(Math.random() * 6) + 1;

		// Apply modern high-inertia spin physics
		spin1 = `${getRandomSpins()} ${faceRotations[result1]}`;
		spin2 = `${getRandomSpins()} ${faceRotations[result2]}`;

		// Wait for the smooth 3D transition to settle (850ms)
		await new Promise((r) => setTimeout(r, 850));

		die1 = result1;
		die2 = result2;
		rolling = false;

		// Display the middle screen overlay result
		showMiddleResult = true;

		// Auto-hide the middle overlay after 5 seconds
		resultTimer = setTimeout(() => {
			showMiddleResult = false;
		}, 2000);

		// Delegate to game rules engine (handles doubles, jail, auto-nextTurn)
		await handleRoll(result1, result2);
	}
</script>

<!-- 1. The Floating Dice Panel HUD (Bottom-Left) -->
{#if !$isMoving}
	<div
		class="dice-panel"
		in:fly={{ y: 50, duration: 200, easing: cubicOut }}
		out:fly={{ y: 50, duration: 200, easing: cubicOut }}
	>
		<!-- Minimalist Smooth Dice Tray -->
		<button
			disabled={rolling}
			onclick={rollDice}
			class={rolling ? 'cursor-not-allowed' : 'cursor-pointer'}
		>
			<div class="dice-tray" class:rolling>
				<div class="die-scene">
					<div class="die-cube" style="transform: {spin1}">
						{#each [1, 2, 3, 4, 5, 6] as face, i (i)}
							<div class="die-face face-{face}">
								{#each dotPositions[face] as [row, col], j (j)}
									<span class="dot" style="grid-row: {row}; grid-column: {col};"></span>
								{/each}
							</div>
						{/each}
					</div>
				</div>

				<div class="die-scene">
					<div class="die-cube" style="transform: {spin2}">
						{#each [1, 2, 3, 4, 5, 6] as face, i (i)}
							<div class="die-face face-{face}">
								{#each dotPositions[face] as [row, col], j (j)}
									<span class="dot" style="grid-row: {row}; grid-column: {col};"></span>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</button>
	</div>
{/if}

<!-- 2. Cinematic Center-Screen Roll Result Announcement -->
{#if showMiddleResult}
	<!-- Full-screen click-through wrapper -->
	<div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
		<div
			transition:scale={{ start: 0.85, duration: 350, easing: cubicOut }}
			class="middle-result-card pointer-events-auto"
		>
			{#if die1 === die2}
				<div transition:fade={{ delay: 150, duration: 200 }} class="double-badge">DADU KEMBAR</div>
			{/if}
			<div class="number-display">
				{die1 + die2}
			</div>
			<span class="step-label">Langkah</span>
		</div>
	</div>
{/if}

<style>
	/* ---- Base Panel container ---- */
	.dice-panel {
		position: fixed;
		left: 2rem;
		bottom: 2rem;
		z-index: 30;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem;
		border-radius: 1.5rem;
		background: rgba(255, 255, 255, 0.8);
		border: 2px solid #d4d4d4;
		border-bottom: 8px solid #d4d4d4;
		backdrop-filter: blur(16px);
		transition: all 0.3s ease;
	}

	/* ---- Minimalist Modern Tray ---- */
	.dice-tray {
		display: flex;
		gap: 1.25rem;
		padding: 1rem 1.25rem;
		border-radius: 1.125rem;
		background: rgba(243, 244, 246, 0.6);
		border: 1px solid rgba(229, 231, 235, 0.8);
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.dice-tray.rolling {
		transform: scale(0.95);
		background: rgba(243, 244, 246, 0.3);
	}

	/* ---- Dice scenes ---- */
	.die-scene {
		width: 46px;
		height: 46px;
		perspective: 250px;
	}

	.die-cube {
		width: 100%;
		height: 100%;
		position: relative;
		transform-style: preserve-3d;
		transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.die-face {
		position: absolute;
		width: 46px;
		height: 46px;
		display: grid;
		grid-template-rows: repeat(3, 1fr);
		grid-template-columns: repeat(3, 1fr);
		place-items: center;
		border-radius: 12px;
		background: #ffffff;
		border: 1px solid rgba(229, 231, 235, 0.8);
		box-shadow:
			inset 0 -2px 4px rgba(0, 0, 0, 0.02),
			0 3px 6px rgba(0, 0, 0, 0.03);
		backface-visibility: hidden;
	}

	/* High elegance minimalist circular dots */
	.dot {
		width: 7.5px;
		height: 7.5px;
		border-radius: 50%;
		background: #1f2937; /* Clean Charcoal Gray */
	}

	/* Center dot of face 1 gets an elegant corporate blue/indigo focus */
	.face-1 .dot {
		background: #4f46e5;
		width: 9px;
		height: 9px;
	}

	/* Precise Z-Offset mappings (Z = size/2 = 23px) */
	.face-1 {
		transform: rotateY(0deg) translateZ(23px);
	}
	.face-2 {
		transform: rotateX(90deg) translateZ(23px);
	}
	.face-3 {
		transform: rotateY(-90deg) translateZ(23px);
	}
	.face-4 {
		transform: rotateY(90deg) translateZ(23px);
	}
	.face-5 {
		transform: rotateX(-90deg) translateZ(23px);
	}
	.face-6 {
		transform: rotateX(180deg) translateZ(23px);
	}

	/* ---- Center-Screen Overlay ---- */
	.middle-result-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		padding: 1.75rem 2.5rem;
		border-radius: 2rem;
		background: white;
		border: 2px solid #d4d4d4;
		border-bottom: 8px solid #d4d4d4;
		text-align: center;
		min-width: 220px;
	}

	.step-label {
		font-size: 0.65rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #6366f1;
	}

	.number-display {
		font-size: 5rem;
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.05em;
		background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		min-width: 100%;
		text-align: center;
	}

	.double-badge {
		margin-top: 0.5rem;
		font-size: 0.6rem;
		font-weight: 800;
		color: #4f46e5;
		background: #e0e7ff;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		letter-spacing: 0.05em;
	}
</style>
