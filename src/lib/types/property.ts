export interface Property {
    id: number;
    name: string;
    type: PropertyType;
    price: PropertyPrice;
    rent: PropertyRent;
}

export enum PropertyType {
    PropertyA,
    PropertyB,
    PropertyC,
    PropertyD,
    PropertyE,
    PropertyF,
    PropertyG,
    PropertyH,
    Station,
    Utility,
    Chance,
    CommunityChest,
    Tax,
    Corner,
}

export interface PropertyPrice {
    basePrice: number;
    housePrice: number;
    mortgagePrice: number;
}

export interface PropertyRent {
    baseRent: number;
    house1: number;
    house2: number;
    house3: number;
    house4: number;
    hotel: number;
}