import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import app from '../app.js';

const root = fileURLToPath(new URL('../', import.meta.url));
let server;
let base;

before(async () => {
    server = await new Promise(resolve => {
        const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

test('unknown pages return a useful 404 without exposing a server error', async () => {
    const response = await fetch(`${base}/missing-page`);
    const html = await response.text();
    assert.equal(response.status, 404);
    assert.match(html, /Back to Folly Nine/);
    assert.match(html, /href="\/"/);
    assert.doesNotMatch(html, /ENOENT|<pre>|\/Users\//);
});

test('gallery previews fit the download budget; originals stay available separately', async () => {
    let smallTotal = 0;
    let largeTotal = 0;
    let originalTotal = 0;
    for (let photo = 1; photo <= 20; photo++) {
        smallTotal += (await stat(join(root, `public/images/previews/${photo}-480.webp`))).size;
        largeTotal += (await stat(join(root, `public/images/previews/${photo}-960.webp`))).size;
        originalTotal += (await stat(join(root, `public/images/${photo}.webp`))).size;
    }
    assert.ok(smallTotal < 2_000_000, `480px gallery is ${smallTotal} bytes`);
    assert.ok(largeTotal < 4_000_000, `960px gallery is ${largeTotal} bytes`);
    assert.ok(largeTotal < originalTotal / 10, 'previews should save at least 90%');

    const response = await fetch(`${base}/`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.equal([...html.matchAll(/data-full-src="\/images\/\d+\.webp"/g)].length, 20);
    assert.doesNotMatch(html, /<img\b[^>]*\ssrc="\/images\/\d+\.webp"/);
    assert.equal([...html.matchAll(/<img src="\/images\/previews\//g)].length, 20);
    assert.equal([...html.matchAll(/loading="lazy"/g)].length, 16);
});

test('preview and original image URLs both serve usable WebP files', async () => {
    for (const path of ['/images/previews/1-480.webp', '/images/previews/20-960.webp', '/images/1.webp']) {
        const response = await fetch(`${base}${path}`);
        assert.equal(response.status, 200);
        assert.match(response.headers.get('content-type'), /image\/webp/);
        const bytes = Buffer.from(await response.arrayBuffer());
        assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
        assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    }
});

test('static build includes the home page, recovery page, and every preview', async () => {
    execFileSync(process.execPath, [join(root, 'scripts/build.mjs')], { cwd: root });
    for (const page of ['index.html', '404.html']) {
        assert.equal(await readFile(join(root, 'dist', page), 'utf8'), await readFile(join(root, 'public', page), 'utf8'));
    }
    for (let photo = 1; photo <= 20; photo++) {
        for (const width of [480, 960]) {
            await stat(join(root, `dist/images/previews/${photo}-${width}.webp`));
        }
    }
    const config = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'));
    assert.equal(config.framework, null);
    assert.equal(config.outputDirectory, 'dist');
    assert.equal(config.buildCommand, 'npm run build');
});
