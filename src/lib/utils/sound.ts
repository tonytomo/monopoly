import bgMusic from '$lib/assets/sounds/bg-music.mp3';
import diceRolling from '$lib/assets/sounds/dice-rolling.mp3';
import notificationSound from '$lib/assets/sounds/notification.mp3';
import stepSound from '$lib/assets/sounds/step.mp3';

let bgMusicAudio: HTMLAudioElement | null = null;
let diceAudio: HTMLAudioElement | null = null;
let notificationAudio: HTMLAudioElement | null = null;
let stepAudio: HTMLAudioElement | null = null;

function getAudio(src: string, loop = false) {
    if (typeof window === 'undefined') return null;
    const audio = new window.Audio(src);
    audio.loop = loop;
    return audio;
}

export function playBgMusic() {
    if (!bgMusicAudio) {
        bgMusicAudio = getAudio(bgMusic, true);
        if (bgMusicAudio) {
            bgMusicAudio.volume = 0.5; // lower volume for bg music
        }
    }
    if (bgMusicAudio && bgMusicAudio.paused) {
        bgMusicAudio.play().catch(e => console.warn('Audio play failed:', e));
    }
}

export function playDiceRolling() {
    if (!diceAudio) diceAudio = getAudio(diceRolling);
    if (diceAudio) {
        diceAudio.currentTime = 0;
        diceAudio.play().catch(e => console.warn('Audio play failed:', e));
    }
}

export function playNotification() {
    if (!notificationAudio) notificationAudio = getAudio(notificationSound);
    if (notificationAudio) {
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(e => console.warn('Audio play failed:', e));
    }
}

export function playStep() {
    if (!stepAudio) stepAudio = getAudio(stepSound);
    if (stepAudio) {
        stepAudio.currentTime = 0;
        stepAudio.play().catch(e => console.warn('Audio play failed:', e));
    }
}
