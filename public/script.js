document.addEventListener('DOMContentLoaded', () => {
    const aboutButton = document.querySelector('.about-button');
    const aboutDialog = document.getElementById('aboutPopup');
    const photoDialog = document.getElementById('photoViewer');
    const viewerImage = document.getElementById('viewerImage');
    const viewerCaption = document.getElementById('viewerCaption');
    const viewerCounter = document.getElementById('viewerCounter');
    const photos = [...document.querySelectorAll('button.image-container')];
    let currentPhoto = 0;
    let openingControl = null;
    let scrollPosition = 0;

    function openDialog(dialog, trigger) {
        if (dialog.open) return;
        openingControl = trigger;
        scrollPosition = window.scrollY;
        document.body.style.top = `-${scrollPosition}px`;
        document.body.classList.add('popup-active');
        document.documentElement.classList.add('modal-open');
        dialog.showModal();
    }

    // Native modal dialogs contain keyboard focus and make the page behind them inert.
    for (const dialog of [aboutDialog, photoDialog]) {
        dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', event => {
            if (event.target === dialog) dialog.close();
        });
        dialog.addEventListener('close', () => {
            document.body.classList.remove('popup-active');
            document.documentElement.classList.remove('modal-open');
            document.body.style.removeProperty('top');
            window.scrollTo(0, scrollPosition);
            if (openingControl?.isConnected) openingControl.focus({ preventScroll: true });
            openingControl = null;
        });
    }

    aboutButton.addEventListener('click', () => openDialog(aboutDialog, aboutButton));

    function showPhoto(index) {
        currentPhoto = (index + photos.length) % photos.length;
        const photo = photos[currentPhoto];
        const preview = photo.querySelector('img');
        viewerImage.src = preview.dataset.fullSrc;
        viewerImage.alt = preview.alt;
        viewerImage.width = Number(preview.getAttribute('width'));
        viewerImage.height = Number(preview.getAttribute('height'));
        viewerCaption.textContent = photo.querySelector('.image-caption').textContent;
        viewerCounter.textContent = `${currentPhoto + 1} / ${photos.length}`;
    }

    photos.forEach((photo, index) => {
        photo.addEventListener('click', () => {
            showPhoto(index);
            openDialog(photoDialog, photo);
        });
    });

    document.getElementById('previousPhoto').addEventListener('click', () => showPhoto(currentPhoto - 1));
    document.getElementById('nextPhoto').addEventListener('click', () => showPhoto(currentPhoto + 1));
    photoDialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            showPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });
});
