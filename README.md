# Planet Green — Move to Nature

A light-themed redesign of Planet Green, built with Next.js and Tailwind CSS. It recreates Fin-Erth's editorial layout, Plus Jakarta Sans headings, globe introduction, scroll transitions, photograph stacks, moving marquees and pill-arrow interactions using Planet Green content.

## Run locally

Use Node.js **20.9 or newer** and npm.

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:3000**. The lockfile records the installed dependency versions; use `npm ci` when you want to reproduce them exactly.

## Where to make changes

```text
src/
  app/
    page.tsx               Homepage entry point
    layout.tsx             Metadata, global styles and motion provider
    globals.css            Colors, fonts, spacing, layouts and responsive rules
  components/
    site.tsx               Assembles the page and manages dialogs
    navigation.tsx         Desktop navigation and mobile menu
    hero.tsx               Introductory copy and GSAP scroll timeline
    deferred-earth.tsx     Static first paint; visibility/idle loading of WebGL
    earth-scene.tsx        Realistic India-facing 3D Earth, clouds and atmosphere
    earth-background.tsx   Section-aligned Earth textures behind the full page
    sections.tsx           Philosophy, communities, experience and contact sections
    photo-stack.tsx        Interactive layered photographs
    contact-dialog.tsx     Enquiry form and email draft
    motion-provider.tsx    Lenis smooth scrolling and GSAP integration
    ui.tsx                 Shared typography, reveals and buttons
  lib/
    earth-palette.mjs       Shared land/ocean color grading for the light globe
  data/
    content.ts             Project details, gallery entries and contact information
public/
  brand/                   Planet Green and community logos
  images/                  Planet Green and Farm Natura photographs
  fonts/                   Locally hosted open-source fonts
  textures/                Earth surface, clouds, normal and specular maps
research/                  Reference analysis and source-content notes
```

Start with `src/data/content.ts` to edit communities, images, contact details or gallery captions. The opening headline lives in `hero.tsx`; section headlines and introductory paragraphs live in `sections.tsx`. Images use paths such as `/images/farm-natura.jpg`, which resolve to files in `public/images/`.

To change the visual style, edit the color variables, typography and section rules in `globals.css`. It also contains the mobile breakpoints. Tailwind utility classes can be used alongside these named styles.

For animation changes, use `hero.tsx` for the recording's scroll map, `ui.tsx` for text reveals, `photo-stack.tsx` for the photograph interaction, and `earth-scene.tsx` for the Earth’s geographic orientation, terrain, lighting and cloud movement. `earth-background.tsx` aligns the five overlapping foliage scenes to page sections and remeasures them when the layout changes. `motion-provider.tsx` connects Lenis to GSAP's ticker. Keep one smooth-scroll controller. Reduced-motion preferences and a fallback for unavailable WebGL are supported.

The hero's downward movement and zoom use the same scroll value as its text scenes: the globe scales from 1× to 2× over the first viewport of scrolling. Headings reveal individual masked words over a 0.6-second stagger, enter in one second, and exit in 0.3 seconds. Hero paragraphs enter after 0.2 seconds. Section headings and their supporting paragraphs share an observer so an extra wrapper animation does not delay the words.

## Commands

| Command             | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the local development server        |
| `npm run build`     | Build a static website into `out/`        |
| `npm run typecheck` | Check TypeScript without generating files |
| `npm run test:e2e`  | Run the Playwright browser checks         |

Run the browser checks while the development server is running. The test config uses installed macOS Chrome when available; otherwise run `npx playwright install chromium` to install Playwright's bundled browser. To use a different Chrome installation, set `PLAYWRIGHT_CHROME_PATH` to its executable path. Tests cover desktop and mobile layouts, keyboard navigation, enquiries, photograph controls, gallery boundaries and reduced motion.

`next.config.ts` enables static export. Deploy the contents of **`out/`** to a static host after building; no Next.js server is required for that output.

## Enquiries

The enquiry form validates its fields locally and opens a prefilled **email draft** through the visitor's mail application. It does not submit or deliver messages from a server. To add delivery later, connect the form to your preferred form service or backend and update the success message to reflect actual delivery.

## Stack

Versions installed for this implementation:

| Package           | Version | Role                           |
| ----------------- | ------- | ------------------------------ |
| Next.js           | 16.4.0  | Application and static export  |
| React             | 19.3.0  | Components and state           |
| Tailwind CSS      | 4.3.3   | Styling                        |
| Framer Motion     | 14.1.1  | UI motion and reveals          |
| GSAP              | 3.15.0  | Scroll-linked animation        |
| Three.js          | 0.186.1 | WebGL globe                    |
| React Three Fiber | 9.8.1   | React integration for Three.js |
| React Three Drei  | 10.7.9  | Three.js helpers               |
| Lenis             | 1.3.26  | Smooth scrolling               |
| TypeScript        | 7.0.2   | Type checking                  |
| Playwright        | 1.64.0  | Browser verification           |

`package.json` lists all packages; `package-lock.json` records exact resolutions.

## Sources and design notes

- **Design reference:** [Fin-Erth](https://www.fin-erth.com/). Its layout and motion were analyzed in [research/fin-erth-analysis.md](research/fin-erth-analysis.md). The implementation uses a light palette and original application code.
- **Content, photographs and brand marks:** the supplied [Planet Green website](https://planetgreen.co.in/index.html) and its official project sites: [Farm Natura](https://www.farmnatura.in/), [Dates County](https://www.thedatescounty.in/), [Green Land Capital](https://greenlandcapital.in/) and [Veda Bharath](https://vedabharath.com/). Exact asset URLs and verified content notes are in [research/planet-content.json](research/planet-content.json). Dates County imagery includes promotional visualizations. Project facts should be checked against these sources when updated.
- **Typography:** locally hosted [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) for all headings and [Manrope](https://fonts.google.com/specimen/Manrope) for body copy. The Plus Jakarta Sans variable font and its OFL license are in `public/fonts/`. Plus Jakarta Sans also styles quotations, decorative numerals, the mobile menu and footer wordmark. Libre Caslon Display is no longer loaded or used. The opening title and supporting copy render visibly before JavaScript initializes; hero copy has a feathered light backdrop to retain contrast over the globe.
- **Hero Earth:** full-world color, normal, specular and cloud maps from the Three.js Earth texture examples are hosted in `public/textures/`. The sphere starts at longitude 78°E, with a southern viewing latitude that places India above the headline. The opening faces India. Scrolling adds up to 82° of rotation using the same progress as the downward movement and zoom; scrolling back restores the opening orientation. The globe stops rotating when scrolling stops, while clouds drift independently. A daylight palette with pale sage seas, greener vegetation, preserved deserts and snow, terrain detail and soft ocean highlights remain clear below a cloud bank made from the original Fin-Erth cloud textures. Their source white and gray colors are preserved. Transparent cloud planes follow the top arc, with a feathered blue sky glow behind them. Each cloud drifts independently along the curved top edge, with a gentle rise, sway and billowing motion. Cloud movement pauses offscreen and under reduced-motion preferences. The cloud bank stays at the visual top while the geographic surface rotates, leaving India and the front face clear. The light page theme and scroll timing are preserved. The palette logic lives in `src/lib/earth-palette.mjs`. Regenerate the daylight surface with `node scripts/generate-earth-palette.mjs`, then regenerate the matching non-WebGL globe with `node scripts/generate-earth-fallback.mjs`. Original geographic maps remain unchanged.
- **Page Earth backgrounds:** the requested Fin-Erth foliage remains locally hosted in `public/textures/reference/`. Page backgrounds use `footer-green-events.png`, `footer-green-partners.png`, `footer-green-awards.png` and the footer texture. The old illustrated globe/cloud layers remain available but are not used by the hero.

The downloaded Fin-Erth files under `research/reference/` are reference material. They are not imported by the website.

## Performance verification

The globe retains the same compact static preview image while fading WebGL over it, avoiding a late LCP replacement. It loads WebGL when the hero is visible and the browser is idle. Opening `#farm-natura` does not initialize offscreen WebGL. Reduced-motion visitors retain the static globe, cloud and sky preview. Active clouds and scroll rotation run at a capped 30 fps and pause offscreen. Cloud textures are physically cropped instead of uploading large transparent canvases; Three.js loads them directly without the Drei texture helper.

Photographs and foliage have WebP delivery variants, with smaller mobile foliage and lazy loading for offscreen images. The first Farm Natura photo paints without waiting for nested reveal animations; subsequent photograph transitions remain animated. The first background texture is preloaded for each viewport. Fonts use local WOFF2 files. Original source assets are retained.

To regenerate delivery images, run `npm run optimize-assets`. Run `npm run build`, then `npm run preview` to serve the production export with gzip at **http://127.0.0.1:3002**. Restart the preview after rebuilding. Use production preview for Lighthouse; `npm run dev` includes development tooling and is not a production performance benchmark.

Example audit (Chrome must be installed):

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx lighthouse 'http://127.0.0.1:3002/#farm-natura' --preset=desktop --only-categories=performance --chrome-flags='--headless --no-sandbox'
```

Omit `--preset=desktop` for the default mobile profile. Results vary with hardware and browser conditions.

Latest recorded audits are in `research/performance-results.json`: the Farm Natura deep link scored 100 desktop and 87 mobile in the final run; the animated homepage scored 79 under mobile throttling. The remaining mobile homepage cost is WebGL initialization/animation. These are estimates from the production preview, not development-server scores.

### Inner pages

The eleven live Planet Green pages are rebuilt in the landing page theme. Routes and labels live in `src/data/page-directory.ts`; original editorial copy lives in `src/data/live-pages.json`. The [content audit](research/live-pages-audit.md) documents every source URL and handling of the empty Careers page and historical 2023 events. Edit copy separately from `page-content.tsx` and shared `page-shell.tsx`.

Gallery images and video IDs are the originals from the live site. Run `node scripts/import-live-assets.mjs` to restore missing optimized media, or append `--refresh` to re-download. The contact form prepares an email draft; this static build has no PHP mail endpoint. Inner-page QA: `npm run test:e2e -- tests/pages.spec.ts`.

### Preloader

`src/components/preloader.tsx` provides the first-page loading veil, sharing the logo, light Earth artwork and existing typography. It waits for the logo, globe and first-paint fonts with a 1.2s asset timeout, stays visible for at least 3s, then fades away in 600ms. It never waits for WebGL or adds a fake progress percentage. The root layout persists it across internal navigation, so the loader does not replay for every link. A no-JavaScript style and independent 5s CSS escape prevent the veil from blocking a page if initialization fails. Reduced motion disables the orbit/breathing animation and removes the exit transition. Verification: `npm run test:e2e -- tests/preloader.spec.ts`.
