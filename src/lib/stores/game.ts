import type { Player } from '$lib/types/player';
import { TileType, type BoardTile, type StreetTile, type RailroadTile, type UtilityTile, type ActionCard, type ActionTile } from '$lib/types/tile';
import { tiles } from '$lib/config/tiles';
import { chanceCards, communityChestCards } from '$lib/config/actions';
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

// Buildings — maps tile ID to number of buildings (0 = none, 1-4 = houses, 5 = hotel)
export const buildings = writable<Map<number, number>>(new Map());

// Last dice total — needed for utility rent calculation (multiplier × dice)
export const lastDiceTotal = writable<number>(0);

// Deferred turn-end flag — set when the details panel opens mid-turn so nextTurn
// waits until the player closes the panel (after buying or declining)
export const pendingNextTurn = writable<boolean>(false);

// Card deck state — shuffled arrays of card IDs, drawn from front
export const chanceDeck = writable<number[]>([]);
export const communityChestDeck = writable<number[]>([]);
export const drawnCard = writable<ActionCard | null>(null);

/** Fisher-Yates shuffle — returns a new shuffled copy */
function shuffle(arr: number[]): number[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** Initialise both card decks with shuffled order. Call once at game start. */
export function initDecks() {
    chanceDeck.set(shuffle(chanceCards.map((c) => c.id)));
    communityChestDeck.set(shuffle(communityChestCards.map((c) => c.id)));
}

// Auto-init decks on module load
initDecks();

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
    // But if a UI overlay is open (purchasable tile or drawn card), defer until it closes
    if (!isDouble) {
        if (get(activeId) >= 0 || get(drawnCard) !== null) {
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
 * Checks whether the given owner holds all street tiles in the same color group.
 */
export function hasMonopoly(tileId: number, ownerId: number): boolean {
    const tile = tiles[tileId];
    if (!tile || tile.type !== TileType.Street) return false;

    const ownerMap = get(ownership);
    const groupTiles = tiles.filter(
        (t) => t.type === TileType.Street && (t as StreetTile).color === (tile as StreetTile).color
    );
    return groupTiles.every((t) => ownerMap.get(t.id) === ownerId);
}

/**
 * Purchases a house or hotel on the given street tile.
 * Rules enforced:
 *  - Tile must be a Street owned by the current player
 *  - Player must own the full color group (monopoly)
 *  - Max 5 buildings (4 houses → 1 hotel upgrade replaces them)
 *  - Even building rule: cannot build on a tile if another tile in the group
 *    has fewer buildings (must build evenly across the group)
 *  - Player must be able to afford the house price
 */
export function buyBuilding(tileId: number): boolean {
    const tile = tiles[tileId];
    if (!tile || tile.type !== TileType.Street) return false;

    const street = tile as StreetTile;
    const playerIdx = get(currentPlayerIndex);
    const playerList = get(players);
    const buyer = playerList[playerIdx];

    // Must own this tile
    const ownerMap = get(ownership);
    if (ownerMap.get(tileId) !== buyer.id) return false;

    // Must own full color group
    if (!hasMonopoly(tileId, buyer.id)) return false;

    const buildingMap = get(buildings);
    const currentCount = buildingMap.get(tileId) ?? 0;

    // Max 5 buildings (hotel)
    if (currentCount >= 5) return false;

    // Even building rule: this tile's count must be <= all others in the group
    const groupTiles = tiles.filter(
        (t) => t.type === TileType.Street && (t as StreetTile).color === street.color
    );
    const minInGroup = Math.min(...groupTiles.map((t) => buildingMap.get(t.id) ?? 0));
    if (currentCount > minInGroup) return false;

    // Check affordability
    if (buyer.money < street.price.house) return false;

    // Deduct cost
    players.update((all) => {
        all[playerIdx].money -= street.price.house;
        return all;
    });

    // Add building
    buildings.update((map) => {
        map.set(tileId, currentCount + 1);
        return map;
    });

    return true;
}

/**
 * Calculates the rent a player must pay when landing on an owned property.
 */
export function calculateRent(tile: BoardTile, ownerId: number): number {
    const ownerMap = get(ownership);

    if (tile.type === TileType.Street) {
        const street = tile as StreetTile;
        const buildingMap = get(buildings);
        const buildingCount = buildingMap.get(tile.id) ?? 0;

        // If there are buildings, use the building-level rent
        if (buildingCount > 0 && buildingCount <= 4) {
            return street.rent[buildingCount as 1 | 2 | 3 | 4];
        }
        if (buildingCount === 5) {
            return street.rent.hotel;
        }

        // No buildings — check for monopoly (doubled base rent)
        const ownsAll = hasMonopoly(tile.id, ownerId);
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
 * Draws a card from the specified deck, sets drawnCard for the UI overlay.
 */
export function drawCard(deckType: 'CHANCE' | 'COMMUNITY_CHEST') {
    const deckStore = deckType === 'CHANCE' ? chanceDeck : communityChestDeck;
    const cardList = deckType === 'CHANCE' ? chanceCards : communityChestCards;

    let deck = get(deckStore);

    // Reshuffle if deck is exhausted
    if (deck.length === 0) {
        deck = shuffle(cardList.map((c) => c.id));
        deckStore.set(deck);
    }

    // Draw from front
    const cardId = deck[0];
    deckStore.update((d) => d.slice(1));

    const card = cardList.find((c) => c.id === cardId);
    if (card) {
        drawnCard.set(card);
    }
}

/**
 * Executes the effect of a drawn card on the current player.
 */
export async function executeCardEffect(card: ActionCard) {
    const playerIdx = get(currentPlayerIndex);
    const playerList = get(players);
    const player = playerList[playerIdx];

    switch (card.action) {
        case 'collect':
            players.update((all) => {
                all[playerIdx].money += card.value ?? 0;
                return all;
            });
            break;

        case 'pay':
            players.update((all) => {
                all[playerIdx].money -= card.value ?? 0;
                return all;
            });
            break;

        case 'pay_each_player': {
            const amount = card.value ?? 0;
            players.update((all) => {
                for (let i = 0; i < all.length; i++) {
                    if (i === playerIdx || all[i].isBankrupt) continue;
                    all[playerIdx].money -= amount;
                    all[i].money += amount;
                }
                return all;
            });
            break;
        }

        case 'collect_each_player': {
            const amount = card.value ?? 0;
            players.update((all) => {
                for (let i = 0; i < all.length; i++) {
                    if (i === playerIdx || all[i].isBankrupt) continue;
                    all[i].money -= amount;
                    all[playerIdx].money += amount;
                }
                return all;
            });
            break;
        }

        case 'move_to': {
            const target = card.value ?? 0;
            const currentPos = player.position;

            // Calculate forward steps (wrapping around the 40-tile board)
            let steps: number;
            if (target > currentPos) {
                steps = target - currentPos;
            } else {
                steps = 40 - currentPos + target;
            }

            await move(steps);
            break;
        }

        case 'move_back': {
            const steps = card.value ?? 0;
            players.update((all) => {
                const pos = all[playerIdx].position;
                all[playerIdx].position = (pos - steps + 40) % 40;
                return all;
            });
            // Evaluate the tile we moved back to
            handleTileLanding(get(players)[playerIdx]);
            break;
        }

        case 'go_to_jail':
            goToJail(playerIdx);
            break;

        case 'advance_to_nearest_railroad': {
            const railroadPositions = [5, 15, 25, 35];
            const currentPos = player.position;
            const nearest = railroadPositions.find((p) => p > currentPos) ?? railroadPositions[0];

            let steps: number;
            if (nearest > currentPos) {
                steps = nearest - currentPos;
            } else {
                steps = 40 - currentPos + nearest;
            }

            await move(steps);

            // If owned by another player, pay 2x rent
            const rrTile = tiles[nearest];
            const ownerMap = get(ownership);
            const rrOwner = ownerMap.get(nearest);
            if (rrOwner !== undefined && rrOwner !== player.id && rrTile.type === TileType.Railroad) {
                const baseRent = calculateRent(rrTile, rrOwner);
                const doubleRent = baseRent * 2;
                const pIdx = get(players).findIndex((p) => p.id === player.id);
                const rIdx = get(players).findIndex((p) => p.id === rrOwner);
                if (pIdx !== -1 && rIdx !== -1) {
                    players.update((all) => {
                        all[pIdx].money -= doubleRent;
                        all[rIdx].money += doubleRent;
                        return all;
                    });
                }
            }
            break;
        }

        case 'advance_to_nearest_utility': {
            const utilityPositions = [12, 28];
            const currentPos = player.position;
            const nearest = utilityPositions.find((p) => p > currentPos) ?? utilityPositions[0];

            let steps: number;
            if (nearest > currentPos) {
                steps = nearest - currentPos;
            } else {
                steps = 40 - currentPos + nearest;
            }

            await move(steps);

            // If owned by another player, pay 10x dice roll
            const utilTile = tiles[nearest];
            const uOwnerMap = get(ownership);
            const uOwner = uOwnerMap.get(nearest);
            if (uOwner !== undefined && uOwner !== player.id && utilTile.type === TileType.Utility) {
                const diceTotal = get(lastDiceTotal);
                const utilityRent = 10 * diceTotal;
                const pIdx = get(players).findIndex((p) => p.id === player.id);
                const rIdx = get(players).findIndex((p) => p.id === uOwner);
                if (pIdx !== -1 && rIdx !== -1) {
                    players.update((all) => {
                        all[pIdx].money -= utilityRent;
                        all[rIdx].money += utilityRent;
                        return all;
                    });
                }
            }
            break;
        }

        case 'repairs': {
            // Charge per house and per hotel the player owns
            const buildingMap = get(buildings);
            const ownerMapR = get(ownership);
            let repairCost = 0;
            buildingMap.forEach((count, tileId) => {
                if (ownerMapR.get(tileId) === player.id) {
                    if (count === 5) {
                        repairCost += card.perHotel ?? card.value ?? 0;
                    } else {
                        repairCost += count * (card.perHouse ?? card.value ?? 0);
                    }
                }
            });
            players.update((all) => {
                all[playerIdx].money -= repairCost;
                return all;
            });
            break;
        }
    }
}

/**
 * Dismisses the drawn card overlay and resumes turn flow.
 */
export async function dismissCard() {
    const card = get(drawnCard);
    if (!card) return;

    // Clear the drawn card first so the overlay closes
    drawnCard.set(null);

    // Execute the card effect (may involve animated movement)
    await executeCardEffect(card);

    // If the card effect opened the action panel (e.g. moved player to an
    // unowned purchasable tile), keep pendingNextTurn deferred — finishTurn()
    // will handle turn advancement when the player closes that panel.
    if (get(activeId) >= 0) {
        return;
    }

    // Otherwise resume turn via the deferred-turn mechanism set by handleRoll
    if (get(pendingNextTurn)) {
        pendingNextTurn.set(false);
        nextTurn();
    }
    // If doubles, pendingNextTurn was never set — player rolls again
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

    // Chance / Community Chest tiles — draw a card
    if (tile?.type === TileType.Action) {
        const actionTile = tile as ActionTile;
        if (actionTile.actionType === 'CHANCE') {
            drawCard('CHANCE');
            return;
        }
        if (actionTile.actionType === 'COMMUNITY_CHEST') {
            drawCard('COMMUNITY_CHEST');
            return;
        }
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