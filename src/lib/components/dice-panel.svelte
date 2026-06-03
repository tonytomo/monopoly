<script lang="ts">
	import { move } from '$lib/stores/game';

	let die1 = $state(1);
	let die2 = $state(1);
	let rolling = $state(false);
	let hasRolled = $state(false);

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
		// Add multiple full rotations for dramatic spin + land on the target face
		const xSpins = (Math.floor(Math.random() * 3) + 2) * 360;
		const ySpins = (Math.floor(Math.random() * 3) + 2) * 360;
		return `rotateX(${xSpins}deg) rotateY(${ySpins}deg)`;
	}

	let spin1 = $state(faceRotations[1]);
	let spin2 = $state(faceRotations[1]);

	async function rollDice() {
		if (rolling) return;
		rolling = true;
		hasRolled = true;

		const result1 = Math.floor(Math.random() * 6) + 1;
		const result2 = Math.floor(Math.random() * 6) + 1;

		// Set dramatic spin + final landing rotation
		spin1 = `${getRandomSpins()} ${faceRotations[result1]}`;
		spin2 = `${getRandomSpins()} ${faceRotations[result2]}`;

		// Wait for animation
		await new Promise((r) => setTimeout(r, 900));

		die1 = result1;
		die2 = result2;
		rolling = false;

		// Trigger game movement
		await move(result1 + result2);
	}
</script>

<div class="dice-panel">
	<div class="dice-tray">
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

	{#if hasRolled && !rolling}
		<div class="dice-result">
			<span class="result-total">{die1 + die2}</span>
			{#if die1 === die2}
				<span class="doubles-badge">Dadu Kembar!</span>
			{/if}
		</div>
	{/if}

	<button class="roll-btn" onclick={rollDice} disabled={rolling}>
		{#if rolling}
			<span class="roll-btn-text spinning-text">Melempar…</span>
		{:else}
			<span class="roll-btn-text">Lempar Dadu</span>
		{/if}
	</button>
</div>

<style>
	.dice-panel {
		position: fixed;
		right: 2rem;
		bottom: 2rem;
		z-index: 50;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.25rem 1.5rem;
		border-radius: 1.25rem;
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(12px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	}

	/* ---- Dice tray ---- */
	.dice-tray {
		display: flex;
		gap: 1.25rem;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		background: rgba(0, 0, 0, 0.04);
		border: 1px solid rgba(0, 0, 0, 0.06);
	}

	/* ---- 3D die ---- */
	.die-scene {
		width: 56px;
		height: 56px;
		perspective: 300px;
	}

	.die-cube {
		width: 100%;
		height: 100%;
		position: relative;
		transform-style: preserve-3d;
		transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.die-face {
		position: absolute;
		width: 56px;
		height: 56px;
		display: grid;
		grid-template-rows: repeat(3, 1fr);
		grid-template-columns: repeat(3, 1fr);
		place-items: center;
		border-radius: 10px;
		background: linear-gradient(145deg, #ffffff, #e8e8e8);
		border: 2px solid rgba(0, 0, 0, 0.08);
		box-shadow:
			inset 0 2px 4px rgba(255, 255, 255, 0.8),
			inset 0 -1px 2px rgba(0, 0, 0, 0.05);
		backface-visibility: hidden;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #4a4a4a, #1a1a1a);
		box-shadow:
			inset 0 1px 2px rgba(0, 0, 0, 0.4),
			0 1px 1px rgba(255, 255, 255, 0.3);
	}

	/* Face positioning in 3D */
	.face-1 {
		transform: rotateY(0deg) translateZ(28px);
	}
	.face-2 {
		transform: rotateX(90deg) translateZ(28px);
	}
	.face-3 {
		transform: rotateY(-90deg) translateZ(28px);
	}
	.face-4 {
		transform: rotateY(90deg) translateZ(28px);
	}
	.face-5 {
		transform: rotateX(-90deg) translateZ(28px);
	}
	.face-6 {
		transform: rotateX(180deg) translateZ(28px);
	}

	/* ---- Result display ---- */
	.dice-result {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.result-total {
		font-size: 1.5rem;
		font-weight: 800;
		color: #334155;
		letter-spacing: -0.025em;
	}

	.doubles-badge {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		padding: 0.2rem 0.5rem;
		border-radius: 999px;
		background: linear-gradient(135deg, #f59e0b, #d97706);
		color: #1c1917;
		animation: badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes badge-pop {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* ---- Roll button ---- */
	.roll-btn {
		width: 100%;
		padding: 0.6rem 1rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 0.75rem;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 700;
		background: #334155;
		color: #fff;
		letter-spacing: 0.01em;
		transition: all 0.15s ease;
	}

	.roll-btn:hover:not(:disabled) {
		background: #1e293b;
	}

	.roll-btn:active:not(:disabled) {
		background: #0f172a;
	}

	.roll-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.roll-btn-text {
		position: relative;
		z-index: 1;
	}

	.spinning-text {
		display: inline-block;
		animation: pulse-text 0.6s ease-in-out infinite alternate;
	}

	@keyframes pulse-text {
		0% {
			opacity: 0.6;
		}
		100% {
			opacity: 1;
		}
	}
</style>
