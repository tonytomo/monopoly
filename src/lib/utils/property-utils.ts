import { PropertyType, type Property } from "$lib/types/property";

export function isCityProperty(property: Property) {
    return [PropertyType.PropertyA, PropertyType.PropertyB, PropertyType.PropertyC, PropertyType.PropertyD, PropertyType.PropertyE, PropertyType.PropertyF, PropertyType.PropertyG, PropertyType.PropertyH].includes(property.type);
}

export function isBuyableProperty(property: Property) {
    return [PropertyType.Station, PropertyType.Utility, PropertyType.PropertyA, PropertyType.PropertyB, PropertyType.PropertyC, PropertyType.PropertyD, PropertyType.PropertyE, PropertyType.PropertyF, PropertyType.PropertyG, PropertyType.PropertyH].includes(property.type);
}

export function getPropertyColor(property: Property) {
    switch (property.type) {
        case PropertyType.PropertyA:
            return 'bg-purple-700';
        case PropertyType.PropertyB:
            return 'bg-green-700';
        case PropertyType.PropertyC:
            return 'bg-blue-700';
        case PropertyType.PropertyD:
            return 'bg-red-700';
        case PropertyType.PropertyE:
            return 'bg-yellow-700';
        case PropertyType.PropertyF:
            return 'bg-orange-700';
        case PropertyType.PropertyG:
            return 'bg-pink-700';
        case PropertyType.PropertyH:
            return 'bg-indigo-700';
        case PropertyType.Station:
            return 'bg-white';
        case PropertyType.Utility:
            return 'bg-gray-300';
        case PropertyType.Chance:
            return 'bg-red-300';
        case PropertyType.CommunityChest:
            return 'bg-green-300';
        case PropertyType.Tax:
            return 'bg-yellow-300';
        case PropertyType.Go:
            return 'bg-blue-300';
        case PropertyType.Jail:
            return 'bg-gray-700 text-white';
        case PropertyType.FreeParking:
            return 'bg-green-300';
        case PropertyType.GoToJail:
            return 'bg-red-700 text-white';
    }
}

export function getRoundedCorner(orientation: 't' | 'b' | 'l' | 'r' | 'tl' | 'tr' | 'bl' | 'br') {
    switch (orientation) {
        case 'tl':
            return 'rounded-tl-lg';
        case 'tr':
            return 'rounded-tr-lg';
        case 'bl':
            return 'rounded-bl-lg';
        case 'br':
            return 'rounded-br-lg';
        default:
            return '';
    }
}

export function getPropertyRotation(orientation: 't' | 'b' | 'l' | 'r' | 'tl' | 'tr' | 'bl' | 'br') {
    switch (orientation) {
        case 't':
            return 'rotate-0';
        case 'b':
            return 'rotate-0';
        case 'l':
            return 'prop-left';
        case 'r':
            return 'prop-right';
        case 'tl':
            return 'rotate-45 prop-left';
        case 'tr':
            return 'rotate-45 prop-right';
        case 'bl':
            return 'rotate-45 prop-left';
        case 'br':
            return 'rotate-45 prop-right';
    }
}