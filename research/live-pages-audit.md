# Planet Green inner-page content audit

Audited 14 October 2026. The live navigation at https://planetgreen.co.in/index.html links to the eleven pages below. HTML was fetched directly from these URLs with curl because the web reader and Python requests were rejected by the site's bot filter.

| Live source | New route |
| --- | --- |
| https://planetgreen.co.in/about-us.html | /about-us/ |
| https://planetgreen.co.in/philosophy.html | /philosophy/ |
| https://planetgreen.co.in/communities.html | /communities/ |
| https://planetgreen.co.in/collaborations.html | /collaborations/ |
| https://planetgreen.co.in/gallery.html | /gallery/ |
| https://planetgreen.co.in/careers.html | /careers/ |
| https://planetgreen.co.in/contact-us.html | /contact-us/ |
| https://planetgreen.co.in/singapore-expo-2023/ | /singapore-expo-2023/ |
| https://planetgreen.co.in/behrain-expo-2023/ | /behrain-expo-2023/ |
| https://planetgreen.co.in/privacy_policy.html | /privacy-policy/ |
| https://planetgreen.co.in/terms_and_conditions.html | /terms-and-conditions/ |

## Content rules

- `src/data/live-pages.json` preserves published editorial paragraphs, headings, policy wording, original gallery entries, video IDs and source URLs. Whitespace is normalized; the legacy site's wording is retained. The malformed unclosed philosophy paragraph is separated into its two original paragraphs. The nested award carousel appears once.
- About includes the original three images, founder biography, statement, seven award images, vision and mission. No extra founder achievements are invented.
- Communities keeps the four short descriptions on the live community page and links to the existing official venture sites.
- Gallery contains all 46 photographs: Dates County 12, Farm Natura 12, Green Land Capital 10, Veda Bharath 12. Image descriptions come from the original images' alt text, prefixed with the community name.
- Collaborations retains all eight source YouTube IDs and names, plus the team photograph. Player iframes are loaded on click, not at page load.
- Careers has an empty main content section on the live site. Its published phone is +91 9100666124 and its Cloudflare-obfuscated email decodes to hr@planetgreen.co.in. No roles, salary claims, benefits or application requirements are added.
- Contact's email decodes to marketing@planetgreen.co.in. Its published office address includes “Beside Heritage Fresh.” The old PHP form endpoint is not part of this static Next.js project. The new form clearly prepares an email draft instead of claiming to deliver a submission. It does not grant marketing consent automatically.
- The Bahrain page publishes 15–18 March 2023, 10am–8pm, Block 1062 Road 6204 Gulf of Bahrain Road Sakhir. Singapore has no published event date or venue in its visible HTML. None is invented. Both routes are explicitly historical 2023 pages, with their original editorial sections and visual stories. The source's misspelling `behrain` is retained in the route.
- The privacy policy includes its original effective date, 1 March 2022, and its embedded terms. Both policies are reproduced as published, not rewritten into claims about new infrastructure.

## Media and structure

`research/live-page-assets.json` maps exact live media URLs to optimized local WebP files. `node scripts/import-live-assets.mjs` imports missing files with Sharp; `--refresh` re-downloads existing ones. Images are limited to 1400px and use quality 82. Originals remain available at the recorded URLs.

`src/data/page-directory.ts` holds routes and menu labels. `src/app/[slug]/page.tsx` statically generates every page with individual metadata. `PageShell` supplies the shared navigation, light foliage background, footer and visit dialog. `PageContent` renders sourced server content; `page-media.tsx` provides the gallery viewer, keyboard tabs and deferred video playback. Inner pages never initialize the heavy home-page WebGL globe.

Explore menus, the footer and the inner-page directory expose every route while the home page keeps its existing in-page navigation.
