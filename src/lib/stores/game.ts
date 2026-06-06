import type { Player } from '$lib/types/player';
import { writable, get } from 'svelte/store';

// Global active UI panel inspectors
export const activeId = writable<number>(-1);
export const isMoving = writable<boolean>(false); // UI lock to prevent rolling mid-move

// Core state stores
export const players = writable<Player[]>([
    { id: 0, name: 'Alpha', color: 'bg-red-500', position: 0, money: 1500, inJail: false, jailTurnsLeft: 0, isBankrupt: false },
    { id: 1, name: 'Beta', color: 'bg-blue-500', position: 0, money: 1500, inJail: false, jailTurnsLeft: 0, isBankrupt: false },
    { id: 2, name: 'Gamma', color: 'bg-yellow-500', position: 0, money: 1500, inJail: false, jailTurnsLeft: 0, isBankrupt: false },
    { id: 3, name: 'Tetha', color: 'bg-green-500', position: 0, money: 1500, inJail: false, jailTurnsLeft: 0, isBankrupt: false }
]);
export const currentPlayerIndex = writable<number>(0);

// Dice rule tracking — counts consecutive doubles within a single turn
export const doublesCount = writable<number>(0);

/**
 * Core dice roll handler — enforces doubles, triple-doubles-to-jail, and auto-advance rules.
 * Called by the dice panel after the animation settles.
 */
export async function handleRoll(die1: number, die2: number) {
    const isDouble = die1 === die2;

    if (isDouble) {
        doublesCount.update((n) => n + 1);

        // 3 consecutive doubles in one turn → straight to jail, turn ends immediately
        if (get(doublesCount) >= 3) {
            goToJail(get(currentPlayerIndex));
            nextTurn();
            return;
        }
    }

    // Execute board movement
    await move(die1 + die2);

    // Non-double → end turn and advance to next player
    if (!isDouble) {
        nextTurn();
    }
    // Double (< 3) → player rolls again, no nextTurn call
}

/**
 * Sends a player directly to jail (tile 10).
 * Used by triple-doubles rule and "Go to Jail" tile landing.
 */
export function goToJail(playerIndex: number) {
    players.update((all) => {
        all[playerIndex].position = 10;
        all[playerIndex].inJail = true;
        all[playerIndex].jailTurnsLeft = 3;
        return all;
    });
}

/**
 * Animates the current player step-by-step across the board array perimeter
 */
export async function move(steps: number) {
    if (get(isMoving)) return;
    isMoving.set(true);

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
 * Progresses the active game state turn pointer to the next active player.
 * Automatically skips jailed players (decrementing their jail counter each pass)
 * and bankrupt players.
 */
export function nextTurn() {
    doublesCount.set(0);
    const totalPlayers = get(players).length;
    let nextIdx = get(currentPlayerIndex);

    for (let i = 0; i < totalPlayers; i++) {
        nextIdx = (nextIdx + 1) % totalPlayers;

        const candidate = get(players)[nextIdx];

        // Skip bankrupt players entirely
        if (candidate.isBankrupt) continue;

        // Handle jailed players — decrement counter, skip if still locked up
        if (candidate.inJail) {
            players.update((all) => {
                all[nextIdx].jailTurnsLeft--;
                if (all[nextIdx].jailTurnsLeft <= 0) {
                    all[nextIdx].inJail = false;
                    all[nextIdx].jailTurnsLeft = 0;
                }
                return all;
            });

            // Re-check after decrement — if still jailed, skip to next player
            if (get(players)[nextIdx].inJail) continue;
            // Otherwise they've been released and it's their turn
        }

        currentPlayerIndex.set(nextIdx);
        return;
    }

    // Fallback: advance anyway (all players jailed/bankrupt edge case)
    currentPlayerIndex.set((get(currentPlayerIndex) + 1) % totalPlayers);
}

/**
 * Triggers the financial or card events mapped to the final landed board coordinate
 */
function handleTileLanding(player: Player) {
    console.log(`${player.name} mendarat di petak nomor: ${player.position}`);

    // "Go to Jail" tile (position 30) — send player directly to jail
    if (player.position === 30) {
        const idx = get(players).findIndex((p) => p.id === player.id);
        if (idx !== -1) goToJail(idx);
    }

    // Next development stage: Evaluate if rent calculation, tax reductions, or chance card drawers need execution
}