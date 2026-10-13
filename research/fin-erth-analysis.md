# Fin-Erth reference analysis

Reference: <https://www.fin-erth.com/>, inspected 13 October 2026. This analysis is grounded in downloaded public HTML, CSS and client JavaScript under `research/reference/`. Those files are research material, not production application source.

## Design and content structure

The homepage is a continuous, atmospheric editorial page, rather than a sequence of boxed cards. It has a fixed navigation bar, a two-stage viewport hero, generous section breathing room, restrained borders, large regular-weight serif headings, compact sans-serif body copy and glowing background textures.

Actual DOM section order:

1. **Home hero:** a globe with orbit rings and drifting cloud layers. Centered large headline. On scroll the first headline disappears and a smaller two-part introduction replaces it over the same globe.
2. **Vision and mission:** uppercase eyebrow; large full-width statement; a thin horizontal divider; three evenly spaced numbered goals beneath it.
3. **Global events:** left text half, right clickable photograph stack. Heading above paragraphs, action button below. Several actual photographs stack with different angles and opacity levels.
4. **Metrics and impact:** eyebrow and large headline above divider; three columns with short uppercase labels, 110px serif numbers and supporting descriptions.
5. **Global partners:** eyebrow and headline, followed by three diagonal moving logo strips. Each strip repeats its content three times and adjacent strips move in opposite directions.
6. **Awards:** left column of headline, text and CTA; right column a narrow vertical timeline with dots. Beneath this are 13 full-width category rows, then a three-column process, then a compact grid of partner logos.
7. **Our story / founders:** left narrative with two small circular portrait/contact rows; right a second interactive photograph stack.
8. **Testimonials:** centered serif quote and uppercase author, rotating automatically; eight progress dots beneath it.
9. **Footer/contact:** eyebrow and heading on left; long contact description on right; large action aligned right. A rule separates a lower row of two contacts and social/credit/legal links.

Planet Green adaptation can preserve the same functional sequence: hero → philosophy/three commitments → Farm Natura experience/photo stack → documented project metrics → nature/value marquee → Farm Natura overview/site-visit timeline → amenities rows → three visit steps → Planet Green story → authentic testimonial or founder statement → contact. Keep claims sourced to Planet Green; do not translate Fin-Erth climate/community facts into invented property facts.

## Exact type and spacing values

| Element | Reference desktop | Reference mobile |
| --- | --- | --- |
| Serif font | Suisse Works Regular | Same |
| Sans font | PP Pangram Sans Compact Regular, Semibold | Same |
| Hero H1 | 82px at width ≥1200px, line-height 1.15 | 26px at 375px |
| Section H2 | 64px, line-height 1.05 | 36px |
| Hero intro H3 | 48px, line-height 1.05 | 24px |
| Quote | 36px, line-height 1.1 | 24px |
| Body | 21px, line-height 1.6 | 16px |
| Larger paragraph | 24px, line-height 1.28 | 19px |
| Eyebrow | 16px semibold, uppercase, .025em tracking | 14px |
| Metric numeral | 110px, line-height 1 | 60px |
| Navigation/action | 22px | 16px |

All serif headings use regular weight and `letter-spacing: -.02em`. Typography is linearly fluid from 375px to 1200px, then capped. Body tracking is `.02em`; headings have no uppercase treatment.

- Shared content maximum width: **1600px**.
- Gutters: **16px** on mobile; **2vw** at ≥740px; **2.5vw** at ≥980px.
- Desktop columns use 2.5vw horizontal spacing, half-width editorial splits, thirds for goals/metrics/process.
- Regular major sections: **15vh** top and bottom on desktop; **8vh** tablet; often **8rem** mobile.
- Section header blocks: 15vh top / 4rem bottom desktop, then a divider.
- Section footer blocks: 4rem top / 8vh bottom desktop.
- Paragraph measure normally **580px**; standard H2 measure **12em**.
- Mission main heading measure **21em**; founder/events headings are narrower.
- Minimal rounded corners: photos use **4px**, video if present uses **1rem**, buttons use full pill rounding.
- Reference palette: background `#001019`, text white, accent `#9cd9ff`, subtle rules `rgba(156,217,255,.2)`. Atmospheric glow is a radial gradient of `#003f53` into transparent, with green/blue cloudy textures.

For the requested light treatment: use a warm off-white canvas, forest-green text, muted olive accent, faint green rules and pale sage atmospheric gradients. Retain type scale, column structure, spacing and motion. Exact reference font files are commercial families; use properly licensed font copies if available or close open-source alternatives for the initial implementation (e.g. a finely proportioned regular serif with a restrained sans).

## Hero composition and exact scroll mechanics

The source hero is **not a video** and does not use Three.js or GSAP. It layers `/assets/images/earth/earth.png`, ten transparent cloud PNGs and three SVG circles. The user explicitly requests GSAP/Framer Motion/Three.js, so equivalent behavior can be rebuilt with that stack while maintaining the reference movement.

- Hero section `min-height: 200vh`.
- Globe container is **fixed** at left 0/bottom 0; width 100%; height 100vh. Under 980px it is left -10vw and width 120%.
- Earth PNG fills that container with `object-fit:contain`; globe is centered. Initial whole-layer position is **translateY(6%)**.
- Earth core is a glossy photoreal illustration with an illuminated green northern rim, dark oceans, pale blue halo. Research preview: `research/reference/earth.png` (2304×2228).
- Both hero text scenes are fixed to a 100vh container, centered in the viewport.
- Hero headline measure is **14em**, in the 82px heading style. On phones the first scene shifts down 50% of its own height; tablet/desktop it is vertically centered.
- Intro heading measure is **21em**, paragraph **35em**, with a 1rem gap.
- Initial full-page overlay fades out in .6s; globe appears in a 2s opacity fade.

The public JS uses progress `p = -heroBoundingRect.top / (heroHeight - viewportHeight)` and these actual mappings:

```text
globe transform = translate3d(0, (6 + 100p)%, 0) scale(1 + p)
globe opacity = 1 - clamp((p - 1) / .4, 0, 1)
orbit opacity = 1 - min(p, 1)
first headline visible = p < .2
second heading + paragraph visible = .2 < p < 1
scroll cue visible = p < .05
cloud render range = p <= 1.5
```

This makes the globe grow and travel **downward** while the introductory text stays still. At one viewport of scroll the second scene hides and the globe begins its final fade; the following mission begins overlapping the end of the hero because its section has `margin-top:-20vh`. No long horizontal pinned carousel is present in this reference.

The orbit radii are `0.5 * min(viewportWidth, viewportHeight)`, then multiplied by 1, 1.3, 1.6. Each SVG orbit uses a 1px line at .2 opacity and a 3px satellite. Satellites start at 0°, 120°, 240° and orbit continuously in **60s, 70s, 80s**.

Cloud layers alternate between -10°→8°, 5°→-7°, -8°→10°, 10°→-5°. Each chooses a 20–40 second duration and 0–10 second delay; easing is `cubic-bezier(.445,.05,.55,.95)`, alternating infinitely.

The scroll cue is a thin 1px vertical line 56px tall, centered near 5vw from the viewport bottom. An accent segment grows upward and fades, looping every **5s**.

## Shared reveal animation

Section reveal is triggered by IntersectionObserver as soon as **some** of its observed element enters the viewport (`threshold:0`, default `once:false`). It can reset when completely outside view.

Headings are split into words, with each word nested in an overflow-hidden inline wrapper. Each word begins at **translateY(100%)**, opacity 0. On visible it slides up to 0 and fades to 1 in **1 second**, using `cubic-bezier(.645,.045,.355,1)`. The whole word sequence is spread across **.6s**: word `i` delay = `(i - 1) * (.6 / wordCount)`.

Supporting copy starts at **translateY(3rem)** and opacity 0; it becomes visible in **.6s**, transform easing `cubic-bezier(.215,.61,.355,1)` and opacity easing `cubic-bezier(.645,.045,.355,1)`. Numbered children use **.15s** successive delays. Eyebrows simply fade in .6s. Hero intro paragraph is different: it starts at **translateY(-.5em)**, reveals in .6s with **.2s delay**.

## Photo-stack interaction

- Photo region is half width on desktop; within it each photograph occupies **80%** of the available stack width.
- Every image is centered. Each image receives a stable random rotation **-10° to 10°** and x/y offset **-25px to 25px**.
- Position in the stack determines opacity `depth/(count-1)` and scale `.7 + .3*depth/(count-1)`.
- Clicking the front photo advances the stack index backwards with wraparound.
- Outgoing front image is raised to z-index 20, fades out and scales to **1.1**.
- All stack transforms/opacity transition in **.6s** with `cubic-bezier(.645,.045,.355,1)`.
- Front image desktop hover scale **1.05**.
- Shadows are `2px 4px 8px rgba(0,16,25,.5)`; use a lower-opacity green shadow in light mode.
- Whole stack aspect ratio is 1:1 mobile, 1:.6 tablet, 1:1 desktop and is centered vertically in its text half-height.

## Marquee, timeline, testimonials and button motion

**Marquee:** each row is rotated **-5°**; horizontal fade mask is transparent at edges / opaque at 25–75%. Logo cell is 300×100px desktop and 150×50px mobile. Horizontal speed is **50px/s** using elapsed performance time. Runs only while in view. Alternating rows move opposite ways.

**Timeline:** 1px vertical line; 9px dots 2rem left of content. The current date's dot has a 25px ring that pulses over **2s** indefinitely. Non-current items are .7 opacity.

**Testimonials:** centered text up to 27em, author 32em; container matches tallest quote. Auto advances every **5s only while in view**. New quote enters from translateX(20%); previous exits translateX(-20%); opacity/transform transition **.3s** using `cubic-bezier(.215,.61,.355,1)`. Dots are 8px circles; active dot expands to **3rem** in .6s; its fill progresses across the pill during the 5s reading period. Supports left/right swipes.

**CTA:** pill label and a separate adjacent round arrow disc. Base height **3rem**, large **4.5rem**. Label side padding 1.25rem or 1.75rem. Arrow disc at back is initially full size; an identical disc at front starts at height 0. On hover front disc grows to full height and back disc shrinks to 0, **.3s** `cubic-bezier(.215,.61,.355,1)`. This creates a distinctive migrating arrow, not just a color hover.

**Navigation:** fixed top; desktop logo 125px, mobile 96px. Desktop padding 2.5vw all around. Sans nav text 22px with 1.5rem gap; a 4px accent dot appears on active/hover, positioned .75rem left. Background gradient fades in .6s after scroll. Under 980px links turn into a 48px circular hamburger; overlay fills 100dvh and fades .3s.

**Smooth scroll:** Lenis `{ duration:1.2 }`, raf-driven. Anchor navigation uses duration **2 seconds**, lerp .05. For the user's stack integrate Lenis with GSAP's ticker and ScrollTrigger updates; avoid multiple simultaneous scroll-smoothing engines.

## Implementation priorities

The most important reference signature is the serif globe hero with its two scroll-linked text scenes, generous editorial rhythm, photograph stacks, thin rules and moving pill-arrow CTA. Reproducing those details will be more faithful than introducing an unrelated video hero, a grid of generic project cards or a horizontal pinned slideshow.

Preserve a working mobile experience, keyboard-operable stacks/carousels, visible focus, real Planet Green destination links, reduced-motion variants and a non-WebGL fallback. Use WebGL deliberately for the globe/nature atmosphere and keep the text and sections in accessible HTML.
