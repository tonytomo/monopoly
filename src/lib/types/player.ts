export interface Player {
    id: number;
    name: string;
    color: string; // Tailwind color token for tokens/avatars
    position: number;
    money: number;
    inJail: boolean;
    jailTurnsLeft: number; // Turns remaining before auto-release (0 = free)
    isBankrupt: boolean;
}