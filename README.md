# FollyNine
Node website for FollyNine.com

Run `npm start` for the local Express server or `npm run dev` for automatic restarts.

`npm run build` validates the site's asset references and copies `public/` to `dist/`.
Vercel uses the Other framework preset, runs this build, and deploys `dist/` as a
static site. The generated output is ignored by Git. Both local serving and Vercel
use `404.html` for missing pages. Vercel routing serves existing files first, then
returns the recovery page with HTTP 404 for unknown URLs.

The gallery uses committed 480px and 960px WebP previews. Original photographs
remain unchanged and load only when opened in the photo viewer. After replacing
an original photograph, install libwebp locally and run `npm run images:previews`
to regenerate previews; Vercel does not need libwebp.

Run `npm test` to check missing-page responses, image delivery, preview download
budgets, and the static build. Browser checks should also cover keyboard opening,
Escape and Close, focus restoration, backdrop clicks, and short phone screens.
After deployment, run `npm run test:live -- https://follynine.com` to verify that
the live home page and assets match the checkout and unknown URLs return HTTP 404.
