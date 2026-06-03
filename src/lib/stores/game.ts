import { cameraTo } from '$lib/utils/camera-utils';
import { writable, get } from 'svelte/store';

export const currentId = writable<number>(0);

export const zoom = writable<boolean>(true);

export function next() {
    const id = get(currentId);
    currentId.set((id + 1) % 40);
    cameraTo((id + 1) % 40);
}

export function previous() {
    const id = get(currentId);
    currentId.set((id - 1 + 40) % 40);
    cameraTo((id - 1 + 40) % 40);
}