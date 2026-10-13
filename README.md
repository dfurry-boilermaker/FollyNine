# FollyNine
Node website for FollyNine.com

Run `npm start` for the local Express server or `npm run dev` for automatic restarts.

`npm run build` validates the site's asset references and copies `public/` to `dist/`.
Vercel uses the Other framework preset, runs this build, and deploys `dist/` as a
static site. The generated output is ignored by Git. Both local serving and Vercel
use `404.html` for missing pages. Vercel routing serves existing files first, then
returns the recovery page with HTTP 404 for unknown URLs.

The gallery uses committed 480px and 960px WebP previews. The fullscreen viewer
shows a decoded preview while a larger version loads, then upgrades to 960px on
phones or a WebP with a longest edge of 2048px on desktop. It preloads only the
two neighboring photos and keeps at most six images in its decoded cache.
Preloading is disabled when the browser requests data savings. Photo changes
keep captions synchronized and discard results from older navigation requests.
Original photographs remain unchanged and available at their existing URLs.
After replacing an original photograph, install libwebp locally and run
`npm run images:previews` to regenerate previews and fullscreen versions;
Vercel does not need libwebp.

Run `npm test` to check missing-page responses, image delivery, preview download
budgets, and the static build. Browser checks should also cover keyboard opening,
Escape and Close, focus restoration, backdrop clicks, and short phone screens.
After deployment, run `npm run test:live -- https://follynine.com` to verify that
the live home page and assets match the checkout and unknown URLs return HTTP 404.

The responsive layout lives in `public/style.css`. Navigation anchors use the
measured header height to keep section headings visible below the sticky menu.
The background uses one canvas with 60 particles on phones and 180 on wider
screens, draws at up to 30 fps, pauses in hidden tabs, and stays static when the
visitor enables reduced motion. Search and social metadata use the existing
biography and F9 image.
