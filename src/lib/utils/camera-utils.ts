export function cameraTo(id: number) {
    const targetElement = document.getElementById('s' + id);

    console.log('Camera moving to s' + id);

    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }
}

export function cameraRotate(id: number) {
    if (id >= 10 && id < 20)
        return '-rotate-90';
    else if (id >= 20 && id < 30)
        return '-rotate-180';
    else if (id >= 30 && id < 40)
        return '-rotate-270';
    else
        return 'rotate-0';
}