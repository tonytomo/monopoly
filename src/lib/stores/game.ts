import type { Player } from '$lib/types/player';
import { writable, get } from 'svelte/store';

// Global active UI panel inspectors
export const activeId = writable<number>(-1);
export const isMoving = writable<boolean>(false); // UI lock to prevent rolling mid-move

// Core state stores
export const players = writable<Player[]>([
    { id: 0, name: 'Alpha', color: 'bg-red-500', position: 0, money: 1500, inJail: false, isBankrupt: false },
    { id: 1, name: 'Beta', color: 'bg-blue-500', position: 0, money: 1500, inJail: false, isBankrupt: false },
    { id: 2, name: 'Gamma', color: 'bg-yellow-500', position: 0, money: 1500, inJail: false, isBankrupt: false },
    { id: 3, name: 'Tetha', color: 'bg-green-500', position: 0, money: 1500, inJail: false, isBankrupt: false }
]);
export const currentPlayerIndex = writable<number>(0);

/**
 * Animates the current player step-by-step across the board array perimeter
 */
export async function move(steps: number) {
    if (get(isMoving)) return;
    isMoving.set(false);

    const activeIndex = get(currentPlayerIndex);

    for (let i = 0; i < steps; i++) {
        players.update((allPlayers) => {
            const player = allPlayers[activeIndex];
            const nextPosition = (player.position + 1) % 40;

            // Rule Check: Salary payout when passing or landing exactly on GO ("Mulai")
            if (nextPosition === 0) {
                player.money += 200;
            }

            player.position = nextPosition;
            return allPlayers;
        });

        // Delay interval matching your UI piece transition frames
        await new Promise((resolve) => setTimeout(resolve, 220));
    }

    isMoving.set(false);

    // Technical Step: Evaluate land conditions here
    handleTileLanding(get(players)[activeIndex]);
}

/**
 * Progresses the active game state turn pointer to the next active combatant
 */
export function nextTurn() {
    const list = get(players);
    currentPlayerIndex.update((currentIdx) => {
        let nextIdx = (currentIdx + 1) % list.length;

        // Loop lookup to automatically jump past players knocked out by bankruptcy
        while (list[nextIdx].isBankrupt && nextIdx !== currentIdx) {
            nextIdx = (nextIdx + 1) % list.length;
        }
        return nextIdx;
    });
}

/**
 * Triggers the financial or card events mapped to the final landed board coordinate
 */
function handleTileLanding(player: Player) {
    console.log(`${player.name} mendarat di petak nomor: ${player.position}`);
    // Next development stage: Evaluate if rent calculation, tax reductions, or chance card drawers need execution
}