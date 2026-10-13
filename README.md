# Planet Green — Move to Nature

A light-themed redesign of Planet Green, built with Next.js and Tailwind CSS. It recreates Fin-Erth's editorial layout, serif typography, globe introduction, scroll transitions, photograph stacks, moving marquees and pill-arrow interactions using Planet Green content.

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
    earth-scene.tsx        Realistic India-facing 3D Earth, clouds and atmosphere
    earth-background.tsx   Section-aligned Earth textures behind the full page
    sections.tsx           Philosophy, communities, experience and contact sections
    photo-stack.tsx        Interactive layered photographs
    contact-dialog.tsx     Enquiry form and email draft
    motion-provider.tsx    Lenis smooth scrolling and GSAP integration
    ui.tsx                 Shared typography, reveals and buttons
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
- **Typography:** locally hosted [Libre Caslon Display](https://fonts.google.com/specimen/Libre+Caslon+Display) and [Manrope](https://fonts.google.com/specimen/Manrope), open-source alternatives to Fin-Erth's commercial Suisse Works and PP Pangram Sans families.
- **Hero Earth:** full-world color, normal, specular and cloud maps from the Three.js Earth texture examples are hosted in `public/textures/`. The sphere starts at longitude 78°E, with a southern viewing latitude that places India above the headline. Gentle rotation keeps India visible. Natural geographic colors, terrain detail, ocean highlights and a thin atmosphere replace the earlier illustration. The light page theme and scroll timing are preserved. The matching non-WebGL fallback can be regenerated with `node scripts/generate-earth-fallback.mjs`.
- **Page Earth backgrounds:** the requested Fin-Erth foliage remains locally hosted in `public/textures/reference/`. Page backgrounds use `footer-green-events.png`, `footer-green-partners.png`, `footer-green-awards.png` and the footer texture. The old illustrated globe/cloud layers remain available but are not used by the hero.

The downloaded Fin-Erth files under `research/reference/` are reference material. They are not imported by the website.
