export enum TileType {
    Street = "STREET",
    Railroad = "RAILROAD",
    Utility = "UTILITY",
    Tax = "TAX",
    Action = "ACTION",
}

export enum ColorGroup {
    Brown = "BROWN",
    LightBlue = "LIGHT_BLUE",
    Pink = "PINK",
    Orange = "ORANGE",
    Red = "RED",
    Yellow = "YELLOW",
    Green = "GREEN",
    DarkBlue = "DARK_BLUE",
}

export interface BaseTile {
    id: number;
    name: string;
    displayName: string;
    type: TileType;
}

export interface ActionTile extends BaseTile {
    type: TileType.Action;
    actionType: "GO" | "CHANCE" | "COMMUNITY_CHEST" | "JAIL" | "FREE_PARKING" | "GO_TO_JAIL";
}

export interface TaxTile extends BaseTile {
    type: TileType.Tax;
    cost: number;
}

export interface StreetTile extends BaseTile {
    type: TileType.Street;
    color: ColorGroup;
    price: {
        base: number;
        house: number;
        mortgage: number;
    };
    rent: {
        base: number;
        monopoly: number; // Rule: Rent doubled if unimproved group is owned
        1: number;
        2: number;
        3: number;
        4: number;
        hotel: number;
    };
}

export interface RailroadTile extends BaseTile {
    type: TileType.Railroad;
    price: {
        base: number;
        mortgage: number;
    };
    rent: [number, number, number, number]; // Index matches ownership [1, 2, 3, 4 railroads]
}

export interface UtilityTile extends BaseTile {
    type: TileType.Utility;
    price: {
        base: number;
        mortgage: number;
    };
    multipliers: [number, number]; // [1 owned, 2 owned] (e.g., 4x, 10x dice)
}

/** The effect type each card can trigger */
export type CardActionType =
    | 'collect'                     // Receive money from bank
    | 'pay'                         // Pay money to bank
    | 'pay_each_player'             // Pay every other player a fixed amount
    | 'collect_each_player'         // Collect a fixed amount from every other player
    | 'move_to'                     // Move to a specific tile position
    | 'move_back'                   // Move backwards N spaces
    | 'go_to_jail'                  // Sent directly to jail
    | 'advance_to_nearest_railroad' // Advance to nearest railroad, pay 2x rent
    | 'advance_to_nearest_utility'  // Advance to nearest utility, pay 10x dice
    | 'repairs';                    // Pay per house/hotel (flat fee for now)

export interface ActionCard {
    id: number;
    deck: 'CHANCE' | 'COMMUNITY_CHEST';
    title: string;
    description: string;
    action: CardActionType;
    value?: number;       // Amount for collect/pay, or tile position for move_to
    perHouse?: number;    // For 'repairs' action (future)
    perHotel?: number;    // For 'repairs' action (future)
}

export type BoardTile = StreetTile | RailroadTile | UtilityTile | TaxTile | ActionTile;