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

export type BoardTile = StreetTile | RailroadTile | UtilityTile | TaxTile | ActionTile;