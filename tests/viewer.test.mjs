import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../public/script.js', import.meta.url), 'utf8');

function element(properties = {}) {
    const listeners = new Map();
    return {
        ...properties,
        addEventListener(type, callback) {
            if (!listeners.has(type)) listeners.set(type, []);
            listeners.get(type).push(callback);
        },
        fire(type, event = {}) {
            for (const callback of listeners.get(type) ?? []) callback(event);
        }
    };
}

function viewer() {
    const image = element();
    const caption = {};
    const counter = {};
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
            dataset: { fullSrc: `/images/${index + 1}.webp` },
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
        viewerCaption: caption, viewerCounter: counter, nextPhoto: next, previousPhoto: previous };
    const document = element({
        querySelector: selector => selector === '.site-header' ? { offsetHeight: 72 } : aboutButton,
        querySelectorAll: () => photos,
        getElementById: id => nodes[id],
        documentElement: { style: { setProperty() {} }, classList: { add() {}, remove() {} } },
        body: { style: { removeProperty() {} }, classList: { add() {}, remove() {} } }
    });
    runInNewContext(source, {
        document,
        window: { scrollY: 0, scrollTo() {} },
        ResizeObserver: class { observe() {} }
    });
    document.fire('DOMContentLoaded');
    const touch = (x, y, id = 1) => ({ identifier: id, clientX: x, clientY: y });
    return {
        image, caption, counter, photoDialog, next, previous, touch,
        open(index = 0) { photos[index].fire('click'); },
        start(x = 250, y = 300) { photoDialog.fire('touchstart', { target: image, touches: [touch(x, y)] }); },
        end(x = 80, y = 300) { image.fire('touchend', { touches: [], changedTouches: [touch(x, y)] }); },
        swipe(startX, endX) { this.start(startX); this.end(endX); }
    };
}

test('swipes navigate in both directions and wrap at the gallery ends', () => {
    const state = viewer();
    state.open();
    state.swipe(250, 80);
    assert.equal(state.image.src, '/images/2.webp');
    assert.equal(state.image.alt, 'Photo 2');
    assert.equal(state.caption.textContent, 'Photo 2');
    assert.equal(state.counter.textContent, '2 / 20');
    state.swipe(80, 250);
    assert.equal(state.image.src, '/images/1.webp');
    state.swipe(80, 250);
    assert.equal(state.counter.textContent, '20 / 20');
    state.swipe(250, 80);
    assert.equal(state.counter.textContent, '1 / 20');
    assert.equal(state.photoDialog.open, true);
});

test('taps, short drags, vertical gestures, and diagonal gestures do not change photos', () => {
    const state = viewer();
    state.open();
    for (const [x, y] of [[250, 300], [225, 300], [240, 100], [150, 200]]) {
        state.start();
        state.end(x, y);
        assert.equal(state.counter.textContent, '1 / 20');
    }
});

test('pinches and cancelled touches cannot trigger a stale swipe', () => {
    const state = viewer();
    state.open();
    state.start();
    state.photoDialog.fire('touchstart', { target: state.next, touches: [state.touch(250, 300), state.touch(200, 300, 2)] });
    state.image.fire('touchend', { touches: [state.touch(250, 300)], changedTouches: [state.touch(80, 300, 2)] });
    state.end();
    assert.equal(state.counter.textContent, '1 / 20');
    state.start();
    state.image.fire('touchcancel');
    state.end();
    assert.equal(state.counter.textContent, '1 / 20');
    state.swipe(250, 80);
    assert.equal(state.counter.textContent, '2 / 20');
});

test('closing, reopening, and using other controls discard an unfinished gesture', () => {
    const state = viewer();
    state.open();
    state.start();
    state.photoDialog.close();
    state.open(4);
    state.end();
    assert.equal(state.counter.textContent, '5 / 20');
    state.start();
    state.next.fire('click');
    state.end();
    assert.equal(state.counter.textContent, '6 / 20');
    state.previous.fire('click');
    let prevented = false;
    state.photoDialog.fire('keydown', { key: 'ArrowRight', preventDefault() { prevented = true; } });
    assert.equal(state.counter.textContent, '6 / 20');
    assert.equal(prevented, true);
});
