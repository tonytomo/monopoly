import type { Player } from '$lib/types/player';
import { TileType, type BoardTile, type StreetTile, type RailroadTile, type UtilityTile } from '$lib/types/tile';
import { tiles } from '$lib/config/tiles';
import { writable, get } from 'svelte/store';

// Global active UI panel inspectors
export const activeId = writable<number>(-1);
export const tooltipTileId = writable<number>(-1);
export const isMoving = writable<boolean>(false); // UI lock to prevent rolling mid-move

// Core state stores
export const players = writable<Player[]>([
    { id: 0, name: 'Alpha', color: '#fb2c36', position: 0, money: 1500, inJail: false, jailTurnsLeft: 0, isBankrupt: false },
    { id: 1, name: 'Beta', color: '#0277bd', position: 0, money: 1500, inJail: false, jailTurnsLeft: 0, isBankrupt: false },
    { id: 2, name: 'Gamma', color: '#fbc02d', position: 0, money: 1500, inJail: false, jailTurnsLeft: 0, isBankrupt: false },
    { id: 3, name: 'Tetha', color: '#2e7d32', position: 0, money: 1500, inJail: false, jailTurnsLeft: 0, isBankrupt: false }
]);
export const currentPlayerIndex = writable<number>(0);

// Dice rule tracking — counts consecutive doubles within a single turn
export const doublesCount = writable<number>(0);

// Property ownership — maps tile ID to owner player ID (-1 or absent = unowned)
export const ownership = writable<Map<number, number>>(new Map());

// Last dice total — needed for utility rent calculation (multiplier × dice)
export const lastDiceTotal = writable<number>(0);

// Deferred turn-end flag — set when the details panel opens mid-turn so nextTurn
// waits until the player closes the panel (after buying or declining)
export const pendingNextTurn = writable<boolean>(false);

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

    // Store dice total for utility rent calculation
    lastDiceTotal.set(die1 + die2);

    // Execute board movement
    await move(die1 + die2);

    // Non-double → end turn and advance to next player
    // But if the details panel opened (purchasable tile), defer until the panel closes
    if (!isDouble) {
        if (get(activeId) >= 0) {
            pendingNextTurn.set(true);
        } else {
            nextTurn();
        }
    }
    // Double (< 3) → player rolls again, no nextTurn call
}

/**
 * Called when the details panel closes. If a turn-end was deferred
 * (non-double landing on a purchasable tile), this fires nextTurn now.
 */
export function finishTurn() {
    if (get(pendingNextTurn)) {
        pendingNextTurn.set(false);
        nextTurn();
    }
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
 * Purchases the tile at the given position for the current player.
 * Deducts the base price from the player's money and records ownership.
 */
export function buyProperty(tileId: number) {
    const tile = tiles[tileId];
    if (!tile) return;

    // Only purchasable types
    if (tile.type !== TileType.Street && tile.type !== TileType.Railroad && tile.type !== TileType.Utility) return;

    const ownerMap = get(ownership);
    if (ownerMap.has(tileId)) return; // Already owned

    const playerIdx = get(currentPlayerIndex);
    const playerList = get(players);
    const buyer = playerList[playerIdx];

    if (buyer.money < tile.price.base) return; // Can't afford

    // Deduct cost
    players.update((all) => {
        all[playerIdx].money -= tile.price.base;
        return all;
    });

    // Record ownership
    ownership.update((map) => {
        map.set(tileId, buyer.id);
        return map;
    });
}

/**
 * Calculates the rent a player must pay when landing on an owned property.
 */
export function calculateRent(tile: BoardTile, ownerId: number): number {
    const ownerMap = get(ownership);

    if (tile.type === TileType.Street) {
        const street = tile as StreetTile;

        // Check for monopoly (owner has all tiles in this color group)
        const groupTiles = tiles.filter(
            (t) => t.type === TileType.Street && (t as StreetTile).color === street.color
        );
        const ownsAll = groupTiles.every((t) => ownerMap.get(t.id) === ownerId);

        // TODO: House/hotel upgrades — for now always base or monopoly rent
        if (ownsAll) {
            return street.rent.monopoly;
        }
        return street.rent.base;
    }

    if (tile.type === TileType.Railroad) {
        const railroad = tile as RailroadTile;
        // Count how many railroads this owner has
        const railroadIds = tiles
            .filter((t) => t.type === TileType.Railroad)
            .map((t) => t.id);
        const ownedCount = railroadIds.filter((id) => ownerMap.get(id) === ownerId).length;
        return railroad.rent[Math.max(0, ownedCount - 1)];
    }

    if (tile.type === TileType.Utility) {
        const utility = tile as UtilityTile;
        const utilityIds = tiles
            .filter((t) => t.type === TileType.Utility)
            .map((t) => t.id);
        const ownedCount = utilityIds.filter((id) => ownerMap.get(id) === ownerId).length;
        const multiplier = utility.multipliers[Math.max(0, ownedCount - 1)];
        return multiplier * get(lastDiceTotal);
    }

    return 0;
}

/**
 * Triggers the financial or card events mapped to the final landed board coordinate
 */
function handleTileLanding(player: Player) {
    const tile = tiles[player.position];
    console.log(`${player.name} mendarat di petak: ${tile?.name ?? player.position}`);

    // "Go to Jail" tile (position 30) — send player directly to jail
    if (player.position === 30) {
        const idx = get(players).findIndex((p) => p.id === player.id);
        if (idx !== -1) goToJail(idx);
        return;
    }

    // Tax tile — auto-deduct
    if (tile?.type === TileType.Tax) {
        const playerIdx = get(players).findIndex((p) => p.id === player.id);
        if (playerIdx !== -1) {
            players.update((all) => {
                all[playerIdx].money -= tile.cost;
                return all;
            });
        }
        return;
    }

    // Purchasable tiles — open details panel, handle rent if owned
    if (
        tile?.type === TileType.Street ||
        tile?.type === TileType.Railroad ||
        tile?.type === TileType.Utility
    ) {
        const ownerMap = get(ownership);
        const ownerId = ownerMap.get(tile.id);

        if (ownerId !== undefined && ownerId !== player.id) {
            // Owned by another player — pay rent
            const rent = calculateRent(tile, ownerId);
            const payerIdx = get(players).findIndex((p) => p.id === player.id);
            const receiverIdx = get(players).findIndex((p) => p.id === ownerId);

            if (payerIdx !== -1 && receiverIdx !== -1) {
                players.update((all) => {
                    all[payerIdx].money -= rent;
                    all[receiverIdx].money += rent;
                    return all;
                });
            }
        }

        // Always show the details panel when landing on a purchasable tile
        activeId.set(tile.id);
    }
}