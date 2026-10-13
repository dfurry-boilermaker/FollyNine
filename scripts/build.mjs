import { access, cp, mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'public');
const output = join(root, 'dist');

// Catch missing assets before shipping a static deployment.
for (const page of ['index.html', '404.html']) {
    const html = await readFile(join(source, page), 'utf8');
    const assets = [...html.matchAll(/(?:src|href|data-full-src|data-view-src|data-mobile-src)="([^"#]+)"/g)]
        .map(match => match[1]);
    for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
        assets.push(...match[1].split(',').map(candidate => candidate.trim().split(/\s+/)[0]));
    }
    for (const asset of new Set(assets)) {
        if (asset === '/' || /^(?:https?:|mailto:)/.test(asset)) continue;
        await access(join(source, asset.replace(/^\//, '')));
    }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, {
    recursive: true,
    filter: path => !path.endsWith('.DS_Store')
});
console.log('Static site built in dist/; all referenced assets are present.');
