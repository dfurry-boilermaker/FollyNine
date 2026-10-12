import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../public/speckles.js', import.meta.url), 'utf8');

function background({ reduced = false, width = 1440 } = {}) {
    const documentEvents = new Map();
    const windowEvents = new Map();
    const frames = new Map();
    const nodes = [];
    const arcs = [];
    let id = 0;
    let preferenceChanged;
    const context = {
        clearRect() { arcs.length = 0; },
        setTransform() {}, beginPath() {}, fill() {},
        arc(...args) { arcs.push(args); }
    };
    const canvas = { getContext: () => context, setAttribute() {} };
    const preference = { matches: reduced, addEventListener(type, callback) { preferenceChanged = callback; } };
    const document = {
        hidden: false,
        createElement: () => canvas,
        body: { appendChild(node) { nodes.push(node); } },
        addEventListener(type, callback) { documentEvents.set(type, callback); }
    };
    const window = {
        innerWidth: width, innerHeight: 900, devicePixelRatio: 3,
        matchMedia: () => preference,
        addEventListener(type, callback) { windowEvents.set(type, callback); }
    };
    runInNewContext(source, {
        document, window,
        requestAnimationFrame(callback) { frames.set(++id, callback); return id; },
        cancelAnimationFrame(key) { frames.delete(key); }
    });
    documentEvents.get('DOMContentLoaded')();
    return {
        nodes, canvas, arcs, frames, window,
        hidden(value) { document.hidden = value; documentEvents.get('visibilitychange')(); },
        reduced(value) { preference.matches = value; preferenceChanged(); },
        resize() { windowEvents.get('resize')(); },
        tick(time) { const [key, callback] = frames.entries().next().value; frames.delete(key); callback(time); }
    };
}

test('reduced motion draws a static background without scheduling animation', () => {
    const state = background({ reduced: true });
    assert.equal(state.nodes.length, 1);
    assert.equal(state.frames.size, 0);
    assert.ok(state.arcs.length > 0 && state.arcs.length <= 180);
    const positions = state.arcs.map(arc => [...arc]);
    state.hidden(true);
    state.hidden(false);
    assert.deepEqual(state.arcs, positions);
    assert.equal(state.frames.size, 0);
});

test('animation stops in hidden tabs and when the motion preference changes', () => {
    const state = background();
    assert.equal(state.frames.size, 1);
    state.tick(40);
    assert.equal(state.frames.size, 1);
    state.hidden(true);
    assert.equal(state.frames.size, 0);
    state.hidden(false);
    assert.equal(state.frames.size, 1);
    state.reduced(true);
    assert.equal(state.frames.size, 0);
    state.reduced(false);
    assert.equal(state.frames.size, 1);
});

test('phone background stays within budget and repeated resize keeps one animation loop', () => {
    const state = background({ width: 390 });
    assert.ok(state.arcs.length > 0 && state.arcs.length <= 60);
    assert.equal(state.canvas.width, 780, 'canvas resolution is capped at 2x');
    state.resize();
    state.resize();
    assert.equal(state.nodes.length, 1);
    assert.equal(state.frames.size, 1);
});
