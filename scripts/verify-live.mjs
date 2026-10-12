import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const origin = process.argv[2];
if (!origin) throw new Error('Usage: npm run test:live -- https://follynine.com');
const source = fileURLToPath(new URL('../public/', import.meta.url));

for (const [path, file] of [
    ['/', 'index.html'],
    ['/script.js', 'script.js'],
    ['/style.css', 'style.css'],
    ['/speckles.js', 'speckles.js'],
    ['/images/F9.jpeg', 'images/F9.jpeg'],
    ['/images/previews/1-480.webp', 'images/previews/1-480.webp'],
    ['/images/previews/20-960.webp', 'images/previews/20-960.webp']
]) {
    const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(20_000) });
    assert.equal(response.status, 200, `${path} should be available`);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(join(source, file)), `${path} should match this checkout`);
    console.log(`PASS ${path}: matches deployed source`);
}

for (const path of ['/missing-page-for-verification', '/images/missing-photo.webp']) {
    const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(20_000) });
    assert.equal(response.status, 404, `${path} should return HTTP 404`);
    assert.match(await response.text(), /Back to Folly Nine/);
    console.log(`PASS ${path}: custom HTTP 404`);
}
