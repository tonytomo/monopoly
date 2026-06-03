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
            return 'bg-purple-400';
        case PropertyType.PropertyB:
            return 'bg-green-400';
        case PropertyType.PropertyC:
            return 'bg-blue-400';
        case PropertyType.PropertyD:
            return 'bg-red-400';
        case PropertyType.PropertyE:
            return 'bg-yellow-400';
        case PropertyType.PropertyF:
            return 'bg-orange-400';
        case PropertyType.PropertyG:
            return 'bg-pink-400';
        case PropertyType.PropertyH:
            return 'bg-indigo-400';
        case PropertyType.Station:
            return 'bg-white-400';
        case PropertyType.Utility:
            return 'bg-gray-400';
        case PropertyType.Chance:
            return 'bg-red-400';
        case PropertyType.CommunityChest:
            return 'bg-green-400';
        case PropertyType.Tax:
            return 'bg-yellow-400';
        case PropertyType.Corner:
            return 'bg-gray-400';
    }
}

export function getPropertyRotation(orientation: 't' | 'b' | 'l' | 'r' | 'tl' | 'tr' | 'bl' | 'br') {
    switch (orientation) {
        case 't':
            return 'rotate-180';
        case 'b':
            return 'rotate-0';
        case 'l':
            return 'prop-left';
        case 'r':
            return 'prop-right';
        case 'tl':
            return 'rotate-45 prop-left';
        case 'tr':
            return '-rotate-45 prop-right';
        case 'bl':
            return '-rotate-45 prop-left';
        case 'br':
            return 'rotate-45 prop-right';
    }
}