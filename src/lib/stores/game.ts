import { cameraRotate, cameraTo } from '$lib/utils/camera-utils';
import { writable, get } from 'svelte/store';

export const currentId = writable<number>(0);

export const zoom = writable<boolean>(false);

export const rotate = writable<string>('rotate-0');

export function next() {
    const id = get(currentId);
    currentId.set((id + 1) % 40);
    if ((id + 1) % 10 === 0) {
        rotate.set(cameraRotate((id + 1) % 40));
        new Promise((resolve) => setTimeout(resolve, 200)).then(() => cameraTo((id + 1) % 40));
    } else {
        cameraTo((id + 1) % 40);
    }
}

export function previous() {
    const id = get(currentId);
    currentId.set((id - 1 + 40) % 40);
    if (id % 10 === 0) {
        rotate.set(cameraRotate((id - 1 + 40) % 40));
        new Promise((resolve) => setTimeout(resolve, 200)).then(() => cameraTo((id - 1 + 40) % 40));
    } else {
        cameraTo((id - 1 + 40) % 40);
    }
}