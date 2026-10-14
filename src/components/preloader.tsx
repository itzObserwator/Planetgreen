"use client";

import { useEffect, useRef, useState } from "react";

const GLOBE_TRANSITION_MS = 1200;

/** A first-visit veil: wait for first-paint assets, never the whole WebGL scene. */
export function Preloader() {
  const logo = useRef<HTMLImageElement>(null);
  const globe = useRef<HTMLImageElement>(null);
  const [phase, setPhase] = useState<"loading" | "exiting" | "done">("loading");
  const [morphsToHero, setMorphsToHero] = useState(false);

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
    let globeExpansion: Animation | undefined;
    const background = Array.from(
      document.querySelectorAll<HTMLElement>("header.navigation, main, footer, .skip-link"),
    );
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => (element.inert = true));
    const restore = () => background.forEach((element, i) => (element.inert = previousInert[i]));
    const firstImage = document.querySelector<HTMLImageElement>(".earth-artwork-fallback");
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
      let transitionDuration = reducedMotion ? 0 : 600;
      // Measure the actual hero image, including its responsive size and scroll transform.
      // Both images use the same artwork, so the enlarged loader can hand it over precisely.
      if (!reducedMotion && globe.current && firstImage && hero?.dataset.scene === "opening") {
        const image = globe.current;
        const breathingTransform = getComputedStyle(image).transform;
        image.style.animation = "none";
        image.style.transform = breathingTransform;
        const from = image.getBoundingClientRect();
        const to = firstImage.getBoundingClientRect();
        if (to.width > 0 && to.height > 0) {
          setMorphsToHero(true);
          transitionDuration = GLOBE_TRANSITION_MS;
          globeExpansion = image.animate(
            [
              { transform: breathingTransform },
              {
                transform: `translate(${to.x + to.width / 2 - from.x - from.width / 2}px, ${to.y + to.height / 2 - from.y - from.height / 2}px) scale(${to.width / image.offsetWidth})`,
              },
            ],
            {
              duration: GLOBE_TRANSITION_MS,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "forwards",
            },
          );
        }
      }
      setPhase("exiting");
      exitTimer = setTimeout(() => {
        root.classList.remove("preloading");
        restore();
        setPhase("done");
      }, transitionDuration);
    });
    return () => {
      cancelled = true;
      clearTimeout(deadline);
      clearTimeout(exitTimer);
      clearTimeout(minimumTimer);
      globeExpansion?.cancel();
      restore();
    };
  }, []);

  if (phase === "done") return null;
  return (
    <div
      className="site-preloader"
      data-phase={phase}
      data-morph={morphsToHero}
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
          <img
            ref={globe}
            src="/textures/earth-india-fallback.webp"
            alt=""
            width={160}
            height={160}
            decoding="async"
          />
        </div>
        <p className="preloader-heading">
          Move to Nature<span>.</span>
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
