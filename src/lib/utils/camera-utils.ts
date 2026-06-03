export function cameraTo(id: number) {
    const targetElement = document.getElementById('s' + id);

    console.log('Camera moving to s' + id);

    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}