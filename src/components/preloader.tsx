"use client";

import { useEffect, useRef, useState } from "react";

const GLOBE_TRANSITION_MS = 1800;
const PRELOADER_FADE_MS = 600;
const CLOUD_ENTRANCE_MS = 900;

/** A first-visit veil: wait for first-paint assets, never the whole WebGL scene. */
export function Preloader() {
  const logo = useRef<HTMLImageElement>(null);
  const globe = useRef<HTMLImageElement>(null);
  const globeContainer = useRef<HTMLDivElement>(null);
  const globeVeil = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<"loading" | "exiting" | "done">("loading");
  const [globeHandoff, setGlobeHandoff] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("preloading")) {
      setPhase("done");
      return;
    }
    let cancelled = false;
    let exitTimer: ReturnType<typeof setTimeout>;
    let deadline: ReturnType<typeof setTimeout>;
    let minimumTimer: ReturnType<typeof setTimeout>;
    let entranceTimer: ReturnType<typeof setTimeout>;
    let globeExpansion: Animation | undefined;
    let heroReveal: Animation | undefined;
    const background = Array.from(
      document.querySelectorAll<HTMLElement>("header.navigation, main, footer, .skip-link"),
    );
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => (element.inert = true));
    const restore = () => background.forEach((element, i) => (element.inert = previousInert[i]));
    const firstImage = document.querySelector<HTMLImageElement>(".earth-artwork-fallback");
    const syncGlobeVeil = () => {
      const heroVeil = document.querySelector<HTMLElement>(".hero-copy-veil");
      if (!firstImage || !heroVeil || !globeContainer.current || !globeVeil.current) return;
      const target = firstImage.getBoundingClientRect();
      const veil = heroVeil.getBoundingClientRect();
      if (!target.width) return;
      const ratio = globeContainer.current.offsetWidth / target.width;
      // Express the hero's exact contrast layer in the small globe's coordinates.
      Object.assign(globeVeil.current.style, {
        left: `${(veil.x - target.x) * ratio}px`,
        top: `${(veil.y - target.y) * ratio}px`,
        width: `${veil.width * ratio}px`,
        height: `${veil.height * ratio}px`,
        backgroundImage: getComputedStyle(heroVeil).backgroundImage,
      });
    };
    syncGlobeVeil();
    window.addEventListener("resize", syncGlobeVeil);
    const assets = [
      document.fonts.ready,
      logo.current?.decode(),
      globe.current?.decode(),
      firstImage?.decode(),
    ].filter(Boolean);
    const ready = Promise.allSettled(assets);
    const bounded = new Promise<void>((resolve) => {
      deadline = setTimeout(resolve, 1200);
    });
    // Let the branding breathe even when assets are already cached.
    const minimumDisplay = new Promise<void>((resolve) => {
      minimumTimer = setTimeout(resolve, 6000);
    });
    Promise.all([Promise.race([ready, bounded]), minimumDisplay]).then(() => {
      if (cancelled) return;
      clearTimeout(deadline);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const hero = firstImage?.closest<HTMLElement>(".hero");
      const heroArtwork = firstImage?.closest<HTMLElement>(".earth-artwork");
      const canHandoff =
        !reducedMotion &&
        !!globeContainer.current &&
        !!firstImage &&
        !!heroArtwork &&
        hero?.dataset.scene === "opening";
      const finish = () => {
        if (canHandoff) {
          root.dataset.heroEntrance = "clouds";
          entranceTimer = setTimeout(() => {
            root.dataset.heroEntrance = "orbits";
          }, CLOUD_ENTRANCE_MS);
        }
        root.classList.remove("preloading");
        restore();
        setPhase("done");
      };
      setGlobeHandoff(canHandoff);
      setPhase("exiting");
      if (reducedMotion) {
        finish();
        return;
      }
      // Fade the branding first, keeping the globe visible throughout the handoff.
      exitTimer = setTimeout(() => {
        if (cancelled) return;
        if (!canHandoff || !globeContainer.current || !firstImage || !heroArtwork) {
          finish();
          return;
        }
        syncGlobeVeil();
        const image = globeContainer.current;
        const fromTransform = getComputedStyle(image).transform;
        image.style.animation = "none";
        image.style.transform = fromTransform;
        const from = image.getBoundingClientRect();
        const to = firstImage.getBoundingClientRect();
        globeExpansion = image.animate(
          [
            {
              transform: fromTransform,
              opacity: 1,
              offset: 0,
              easing: "cubic-bezier(0.45, 0, 0.2, 1)",
            },
            { opacity: 1, offset: 0.8 },
            {
              transform: `translate(${to.x + to.width / 2 - from.x - from.width / 2}px, ${to.y + to.height / 2 - from.y - from.height / 2}px) scale(${to.width / image.offsetWidth})`,
              opacity: 0,
              offset: 1,
            },
          ],
          {
            duration: GLOBE_TRANSITION_MS,
            easing: "linear",
            fill: "forwards",
          },
        );
        heroReveal = heroArtwork.animate([{ opacity: 0 }, { opacity: 1 }], {
          delay: GLOBE_TRANSITION_MS * 0.8,
          duration: GLOBE_TRANSITION_MS * 0.2,
          fill: "forwards",
        });
        exitTimer = setTimeout(finish, GLOBE_TRANSITION_MS);
      }, PRELOADER_FADE_MS);
    });
    return () => {
      cancelled = true;
      clearTimeout(deadline);
      clearTimeout(exitTimer);
      clearTimeout(minimumTimer);
      clearTimeout(entranceTimer);
      delete root.dataset.heroEntrance;
      globeExpansion?.cancel();
      heroReveal?.cancel();
      window.removeEventListener("resize", syncGlobeVeil);
      restore();
    };
  }, []);

  if (phase === "done") return null;
  return (
    <div
      className="site-preloader"
      data-phase={phase}
      data-globe-handoff={globeHandoff}
      role="status"
      aria-live="polite"
      aria-label="Loading Planet Green"
      aria-hidden={phase === "exiting"}
    >
      <div className="preloader-inner">
        <img
          ref={logo}
          className="preloader-logo"
          src="/brand/planet-green.svg"
          alt="Planet Green"
          width={230}
          height={83}
          decoding="async"
        />
        <div className="preloader-planet" aria-hidden="true">
          <div className="preloader-orbit preloader-orbit-one">
            <span />
          </div>
          <div className="preloader-orbit preloader-orbit-two">
            <span />
          </div>
          <div ref={globeContainer} className="preloader-globe">
            <img
              ref={globe}
              src="/textures/earth-india-fallback.webp"
              alt=""
              width={160}
              height={160}
              decoding="async"
            />
            <span ref={globeVeil} className="preloader-globe-veil" />
          </div>
        </div>
        <p className="preloader-heading">
          Built with nature.{" "}
          <br />
          For people<span>.</span>
        </p>
        <p className="preloader-caption">Rooted in nature. Made for life.</p>
        <div className="preloader-track" aria-hidden="true">
          <span />
        </div>
      </div>
      <span className="preloader-footnote" aria-hidden="true">
        A little closer to nature.
      </span>
    </div>
  );
}
