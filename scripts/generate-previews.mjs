import { mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Install libwebp locally to regenerate previews. Vercel uses the committed files.
const images = fileURLToPath(new URL('../public/images/', import.meta.url));
const previews = join(images, 'previews');
const viewer = join(images, 'viewer');
await mkdir(previews, { recursive: true });
await mkdir(viewer, { recursive: true });

for (let photo = 1; photo <= 20; photo++) {
    for (const width of [480, 960]) {
        execFileSync('cwebp', [
            '-quiet', '-q', '80', '-resize', String(width), '0',
            join(images, `${photo}.webp`), '-o', join(previews, `${photo}-${width}.webp`)
        ]);
    }
    const information = execFileSync('webpinfo', [join(images, `${photo}.webp`)], { encoding: 'utf8' });
    const dimensions = information.match(/Width:\s*(\d+)\s+Height:\s*(\d+)/);
    if (!dimensions) throw new Error(`Could not read the dimensions of photo ${photo}`);
    const width = Number(dimensions[1]);
    const height = Number(dimensions[2]);
    const longestEdge = String(Math.min(2048, Math.max(width, height)));
    execFileSync('cwebp', [
        '-quiet', '-q', '85', '-m', '6', '-metadata', 'icc', '-resize',
        width >= height ? longestEdge : '0', width >= height ? '0' : longestEdge,
        join(images, `${photo}.webp`), '-o', join(viewer, `${photo}.webp`)
    ]);
}
console.log('Generated 480px and 960px previews and 2048px fullscreen WebPs for all 20 photographs.');
