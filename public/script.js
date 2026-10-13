document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const updateHeaderHeight = () => {
        document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
    };
    updateHeaderHeight();
    new ResizeObserver(updateHeaderHeight).observe(header);

    const aboutButton = document.querySelector('.about-button');
    const aboutDialog = document.getElementById('aboutPopup');
    const photoDialog = document.getElementById('photoViewer');
    const viewerImage = document.getElementById('viewerImage');
    const viewerCaption = document.getElementById('viewerCaption');
    const viewerCounter = document.getElementById('viewerCounter');
    const viewerStatus = document.getElementById('viewerStatus');
    const photos = [...document.querySelectorAll('button.image-container')];
    let currentPhoto = 0;
    let openingControl = null;
    let scrollPosition = 0;
    let swipeStart = null;
    let photoRequest = 0;
    const imageCache = new Map();

    function loadImage(source, priority = 'high') {
        if (imageCache.has(source)) {
            const entry = imageCache.get(source);
            imageCache.delete(source);
            imageCache.set(source, entry);
            if (priority === 'high') entry.image.fetchPriority = 'high';
            return entry;
        }
        const image = new Image();
        image.decoding = 'async';
        image.fetchPriority = priority;
        image.src = source;
        const entry = { image, ready: false };
        entry.promise = image.decode().then(() => {
            entry.ready = true;
            return image;
        }).catch(error => {
            if (imageCache.get(source) === entry) imageCache.delete(source);
            throw error;
        });
        imageCache.set(source, entry);
        // Retain a small working set instead of every decoded photo on mobile.
        if (imageCache.size > 6) {
            const oldest = imageCache.keys().next().value;
            const evicted = imageCache.get(oldest);
            imageCache.delete(oldest);
            if (!evicted.ready) evicted.image.removeAttribute('src');
        }
        return entry;
    }

    function viewerSource(index) {
        const preview = photos[index].querySelector('img');
        return window.innerWidth <= 768 ? preview.dataset.mobileSrc : preview.dataset.viewSrc;
    }

    function preloadNeighbors(index) {
        if (window.navigator?.connection?.saveData) return;
        for (const offset of [-1, 1]) {
            const neighbor = (index + offset + photos.length) % photos.length;
            loadImage(viewerSource(neighbor), 'low').promise.catch(() => {});
        }
    }

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

    function displayPhoto(index, source) {
        const photo = photos[index];
        const preview = photo.querySelector('img');
        viewerImage.src = source;
        viewerImage.alt = preview.alt;
        viewerImage.width = Number(preview.getAttribute('width'));
        viewerImage.height = Number(preview.getAttribute('height'));
        const caption = photo.querySelector('.image-caption').textContent;
        const counter = `${index + 1} / ${photos.length}`;
        if (viewerCaption.textContent !== caption) viewerCaption.textContent = caption;
        if (viewerCounter.textContent !== counter) viewerCounter.textContent = counter;
        photoDialog.removeAttribute('aria-busy');
        viewerStatus.textContent = '';
    }

    function showPhoto(index) {
        swipeStart = null;
        currentPhoto = (index + photos.length) % photos.length;
        const target = currentPhoto;
        const request = ++photoRequest;
        const preview = photos[target].querySelector('img');
        const full = loadImage(viewerSource(target));
        let fullDisplayed = false;
        viewerStatus.textContent = 'Loading photo…';
        photoDialog.setAttribute('aria-busy', 'true');

        // Only replace the photo and its caption once the replacement is decoded.
        const displayFull = () => {
            if (request !== photoRequest || !photoDialog.open) return;
            fullDisplayed = true;
            displayPhoto(target, full.image.src);
            preloadNeighbors(target);
        };
        if (full.ready) {
            displayFull();
            return;
        }
        const small = loadImage(preview.currentSrc || preview.src);
        small.promise.then(image => {
            if (request === photoRequest && photoDialog.open && !fullDisplayed) displayPhoto(target, image.src);
        }).catch(() => {});
        full.promise.then(displayFull).catch(() => {});
        Promise.allSettled([small.promise, full.promise]).then(results => {
            if (request !== photoRequest || !photoDialog.open) return;
            if (results.every(result => result.status === 'rejected')) {
                photoDialog.removeAttribute('aria-busy');
                viewerStatus.textContent = 'This photo could not load. Try Previous or Next.';
            }
        });
    }

    photos.forEach((photo, index) => {
        photo.addEventListener('click', () => {
            openDialog(photoDialog, photo);
            showPhoto(index);
        });
    });

    document.getElementById('previousPhoto').addEventListener('click', () => showPhoto(currentPhoto - 1));
    document.getElementById('nextPhoto').addEventListener('click', () => showPhoto(currentPhoto + 1));

    photoDialog.addEventListener('touchstart', event => {
        swipeStart = null;
        if (!photoDialog.open || event.target !== viewerImage || event.touches.length !== 1) return;
        const touch = event.touches[0];
        swipeStart = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    viewerImage.addEventListener('touchend', event => {
        const start = swipeStart;
        swipeStart = null;
        if (!start || !photoDialog.open || event.touches.length !== 0) return;
        const touch = [...event.changedTouches].find(item => item.identifier === start.id);
        if (!touch) return;
        const distanceX = touch.clientX - start.x;
        const distanceY = touch.clientY - start.y;
        // Require a deliberate horizontal swipe; taps, vertical movement, and pinches stay native.
        if (Math.abs(distanceX) < 50 || Math.abs(distanceX) < Math.abs(distanceY) * 1.5) return;
        showPhoto(currentPhoto + (distanceX < 0 ? 1 : -1));
    }, { passive: true });

    viewerImage.addEventListener('touchcancel', () => { swipeStart = null; }, { passive: true });
    photoDialog.addEventListener('close', () => {
        swipeStart = null;
        photoRequest++;
        photoDialog.removeAttribute('aria-busy');
        viewerStatus.textContent = '';
    });

    photoDialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            showPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });
});
