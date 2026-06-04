import { writable, get } from 'svelte/store';

export const currentId = writable<number>(0);
export const activeId = writable<number>(-1);

export function next() {
    const id = get(currentId);
    currentId.set((id + 1) % 40);
}

export function previous() {
    const id = get(currentId);
    currentId.set((id - 1 + 40) % 40);
}

export async function move(steps: number) {
    for (let i = 0; i < steps; i++) {
        next();
        await new Promise((resolve) => setTimeout(resolve, 200));
    }
}
