import { mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Install libwebp locally to regenerate previews. Vercel uses the committed files.
const images = fileURLToPath(new URL('../public/images/', import.meta.url));
const previews = join(images, 'previews');
await mkdir(previews, { recursive: true });

for (let photo = 1; photo <= 20; photo++) {
    for (const width of [480, 960]) {
        execFileSync('cwebp', [
            '-quiet', '-q', '80', '-resize', String(width), '0',
            join(images, `${photo}.webp`), '-o', join(previews, `${photo}-${width}.webp`)
        ]);
    }
}
console.log('Generated 480px and 960px WebP previews for all 20 original photographs.');
