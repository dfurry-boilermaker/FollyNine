import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../public/script.js', import.meta.url), 'utf8');

function element(properties = {}) {
    const listeners = new Map();
    const attributes = new Map();
    return {
        ...properties,
        setAttribute(name, value) { attributes.set(name, value); },
        removeAttribute(name) { attributes.delete(name); },
        getAttribute(name) { return attributes.get(name); },
        addEventListener(type, callback) {
            if (!listeners.has(type)) listeners.set(type, []);
            listeners.get(type).push(callback);
        },
        fire(type, event = {}) {
            for (const callback of listeners.get(type) ?? []) callback(event);
        }
    };
}

function viewer({ automatic = true, width = 1440, saveData = false } = {}) {
    const image = element();
    const caption = { textContent: 'Photo viewer' };
    const status = { textContent: '' };
    const counter = {};
    const requests = new Map();
    const downloads = [];
    class TestImage {
        constructor() {
            this.promise = new Promise((resolve, reject) => {
                this.succeed = resolve;
                this.fail = () => reject(new Error('Image unavailable'));
            });
        }
        set src(source) {
            this.source = source;
            requests.set(source, this);
            downloads.push(source);
            if (automatic) this.succeed();
        }
        get src() { return this.source; }
        decode() { return this.promise; }
        removeAttribute(name) {
            if (name === 'src') { this.source = ''; this.fail(); }
        }
    }
    const next = element();
    const previous = element();
    const aboutButton = element();
    function dialog() {
        const closeButton = element();
        const node = element({
            open: false,
            querySelector: () => closeButton,
            showModal() { this.open = true; },
            close() { this.open = false; this.fire('close'); }
        });
        return node;
    }
    const photoDialog = dialog();
    const aboutDialog = dialog();
    const photos = Array.from({ length: 20 }, (_, index) => {
        const preview = {
            dataset: { fullSrc: `/images/${index + 1}.webp`, viewSrc: `/images/viewer/${index + 1}.webp`,
                mobileSrc: `/images/previews/${index + 1}-960.webp` },
            src: `/images/previews/${index + 1}-480.webp`,
            alt: `Photo ${index + 1}`,
            getAttribute: name => name === 'width' ? '3000' : '4000'
        };
        return element({
            isConnected: true,
            focus() {},
            querySelector: selector => selector === 'img' ? preview : { textContent: preview.alt }
        });
    });
    const nodes = { aboutPopup: aboutDialog, photoViewer: photoDialog, viewerImage: image,
        viewerCaption: caption, viewerCounter: counter, viewerStatus: status,
        nextPhoto: next, previousPhoto: previous };
    const document = element({
        querySelector: selector => selector === '.site-header' ? { offsetHeight: 72 } : aboutButton,
        querySelectorAll: () => photos,
        getElementById: id => nodes[id],
        documentElement: { style: { setProperty() {} }, classList: { add() {}, remove() {} } },
        body: { style: { removeProperty() {} }, classList: { add() {}, remove() {} } }
    });
    runInNewContext(source, {
        document,
        window: { scrollY: 0, scrollTo() {}, innerWidth: width, navigator: { connection: { saveData } } },
        Image: TestImage,
        ResizeObserver: class { observe() {} }
    });
    document.fire('DOMContentLoaded');
    const touch = (x, y, id = 1) => ({ identifier: id, clientX: x, clientY: y });
    const flush = () => new Promise(resolve => setImmediate(resolve));
    return {
        image, caption, counter, status, photoDialog, next, previous, touch, requests, downloads, flush,
        open(index = 0) { photos[index].fire('click'); return flush(); },
        start(x = 250, y = 300) { photoDialog.fire('touchstart', { target: image, touches: [touch(x, y)] }); },
        end(x = 80, y = 300) { image.fire('touchend', { touches: [], changedTouches: [touch(x, y)] }); },
        swipe(startX, endX) { this.start(startX); this.end(endX); return flush(); }
    };
}

test('swipes navigate in both directions and wrap at the gallery ends', async () => {
    const state = viewer();
    await state.open();
    await state.swipe(250, 80);
    assert.equal(state.image.src, '/images/viewer/2.webp');
    assert.equal(state.image.alt, 'Photo 2');
    assert.equal(state.caption.textContent, 'Photo 2');
    assert.equal(state.counter.textContent, '2 / 20');
    await state.swipe(80, 250);
    assert.equal(state.image.src, '/images/viewer/1.webp');
    await state.swipe(80, 250);
    assert.equal(state.counter.textContent, '20 / 20');
    await state.swipe(250, 80);
    assert.equal(state.counter.textContent, '1 / 20');
    assert.equal(state.photoDialog.open, true);
});

test('taps, short drags, vertical gestures, and diagonal gestures do not change photos', async () => {
    const state = viewer();
    await state.open();
    for (const [x, y] of [[250, 300], [225, 300], [240, 100], [150, 200]]) {
        state.start();
        state.end(x, y);
        assert.equal(state.counter.textContent, '1 / 20');
    }
});

test('pinches and cancelled touches cannot trigger a stale swipe', async () => {
    const state = viewer();
    await state.open();
    state.start();
    state.photoDialog.fire('touchstart', { target: state.next, touches: [state.touch(250, 300), state.touch(200, 300, 2)] });
    state.image.fire('touchend', { touches: [state.touch(250, 300)], changedTouches: [state.touch(80, 300, 2)] });
    state.end();
    assert.equal(state.counter.textContent, '1 / 20');
    state.start();
    state.image.fire('touchcancel');
    state.end();
    assert.equal(state.counter.textContent, '1 / 20');
    await state.swipe(250, 80);
    assert.equal(state.counter.textContent, '2 / 20');
});

test('closing, reopening, and using other controls discard an unfinished gesture', async () => {
    const state = viewer();
    await state.open();
    state.start();
    state.photoDialog.close();
    await state.open(4);
    state.end();
    assert.equal(state.counter.textContent, '5 / 20');
    state.start();
    state.next.fire('click');
    state.end();
    await state.flush();
    assert.equal(state.counter.textContent, '6 / 20');
    state.previous.fire('click');
    let prevented = false;
    state.photoDialog.fire('keydown', { key: 'ArrowRight', preventDefault() { prevented = true; } });
    await state.flush();
    assert.equal(state.counter.textContent, '6 / 20');
    assert.equal(prevented, true);
});

test('a preview appears with its caption before the fullscreen download finishes', async () => {
    const state = viewer({ automatic: false });
    assert.equal(state.downloads.length, 0, 'opening the page should not download viewer images');
    await state.open();
    assert.equal(state.requests.size, 2, 'only the selected photo and its preview load initially');
    assert.equal(state.status.textContent, 'Loading photo…');
    state.requests.get('/images/previews/1-480.webp').succeed();
    await state.flush();
    assert.equal(state.image.src, '/images/previews/1-480.webp');
    assert.equal(state.caption.textContent, 'Photo 1');
    assert.equal(state.counter.textContent, '1 / 20');
    assert.equal(state.status.textContent, '');
    state.requests.get('/images/viewer/1.webp').succeed();
    await state.flush();
    assert.equal(state.image.src, '/images/viewer/1.webp');
    assert.equal(state.caption.textContent, 'Photo 1');
    assert.equal(state.requests.get('/images/viewer/2.webp').fetchPriority, 'low');
    assert.equal(state.requests.get('/images/viewer/20.webp').fetchPriority, 'low');
    assert.equal(state.requests.size, 4, 'only adjacent photos are prefetched');
});

test('a late preview cannot replace a sharp image and a prefetched photo switches immediately', async () => {
    const state = viewer({ automatic: false });
    await state.open();
    state.requests.get('/images/viewer/1.webp').succeed();
    await state.flush();
    state.requests.get('/images/previews/1-480.webp').succeed();
    state.requests.get('/images/viewer/2.webp').succeed();
    await state.flush();
    assert.equal(state.image.src, '/images/viewer/1.webp');
    state.next.fire('click');
    assert.equal(state.image.src, '/images/viewer/2.webp');
    assert.equal(state.caption.textContent, 'Photo 2');
    assert.equal(state.requests.has('/images/previews/2-480.webp'), false);
});

test('rapid navigation discards earlier downloads instead of changing the visible photo', async () => {
    const state = viewer({ automatic: false });
    await state.open();
    state.requests.get('/images/previews/1-480.webp').succeed();
    await state.flush();
    state.next.fire('click');
    assert.equal(state.caption.textContent, 'Photo 1', 'caption stays with the displayed photo while loading');
    state.next.fire('click');
    state.requests.get('/images/viewer/3.webp').succeed();
    await state.flush();
    for (const source of ['/images/viewer/1.webp', '/images/viewer/2.webp', '/images/previews/2-480.webp', '/images/previews/3-480.webp']) {
        state.requests.get(source).succeed();
    }
    await state.flush();
    assert.equal(state.image.src, '/images/viewer/3.webp');
    assert.equal(state.caption.textContent, 'Photo 3');
    assert.equal(state.counter.textContent, '3 / 20');
});

test('closing the viewer prevents a pending download from displaying or prefetching photos', async () => {
    const state = viewer({ automatic: false });
    await state.open();
    state.photoDialog.close();
    state.requests.get('/images/viewer/1.webp').succeed();
    state.requests.get('/images/previews/1-480.webp').succeed();
    await state.flush();
    assert.equal(state.image.src, undefined);
    assert.equal(state.caption.textContent, 'Photo viewer');
    assert.equal(state.status.textContent, '');
    assert.equal(state.downloads.length, 2);
});

test('failed fullscreen downloads retain the preview, and total failures allow recovery', async () => {
    const state = viewer({ automatic: false });
    await state.open();
    state.requests.get('/images/previews/1-480.webp').succeed();
    state.requests.get('/images/viewer/1.webp').fail();
    await state.flush();
    assert.equal(state.image.src, '/images/previews/1-480.webp');
    assert.equal(state.status.textContent, '');
    state.next.fire('click');
    state.requests.get('/images/previews/2-480.webp').fail();
    state.requests.get('/images/viewer/2.webp').fail();
    await state.flush();
    assert.equal(state.image.src, '/images/previews/1-480.webp');
    assert.equal(state.caption.textContent, 'Photo 1');
    assert.match(state.status.textContent, /could not load/);
    assert.equal(state.photoDialog.getAttribute('aria-busy'), undefined);
    state.previous.fire('click');
    state.requests.get('/images/viewer/1.webp').succeed();
    await state.flush();
    assert.equal(state.image.src, '/images/viewer/1.webp');
    assert.equal(state.status.textContent, '');
});

test('mobile uses the smaller version and data saving disables speculative downloads', async () => {
    const state = viewer({ width: 390, saveData: true });
    await state.open();
    assert.equal(state.image.src, '/images/previews/1-960.webp');
    assert.deepEqual(state.downloads, ['/images/previews/1-960.webp', '/images/previews/1-480.webp']);
    assert.equal(state.downloads.some(source => source === '/images/1.webp'), false);
});

test('old decoded photos are evicted rather than retained for the entire gallery', async () => {
    const state = viewer();
    await state.open();
    for (let photo = 0; photo < 10; photo++) {
        state.next.fire('click');
        await state.flush();
    }
    await state.open(0);
    assert.equal(state.downloads.filter(source => source === '/images/viewer/1.webp').length, 2);
    assert.equal(state.caption.textContent, 'Photo 1');
});
