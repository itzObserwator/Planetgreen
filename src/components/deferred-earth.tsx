"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type RefObject } from "react";
import type { EarthMotion } from "./earth-scene";

const EarthScene = dynamic(() => import("./earth-scene"), { ssr: false });

/** Paint a small static globe first; never initialize WebGL for an offscreen hero. */
export function DeferredEarth({
  hero,
  motion,
}: {
  hero: RefObject<HTMLElement | null>;
  motion: RefObject<EarthMotion>;
}) {
  const [enhanced, setEnhanced] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = hero.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let idle: number | undefined;
    const cancel = () => {
      clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
    };
    let loaded = false;
    let entranceObserver: MutationObserver | undefined;
    const load = () => {
      if (loaded || document.documentElement.classList.contains("preloading")) return;
      loaded = true;
      cancel();
      setEnhanced(true);
      observer.disconnect();
      entranceObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      const bounds = element.getBoundingClientRect();
      // Do not initialize an offscreen globe when opening a lower hash section.
      // Once the user starts the hero animation, prioritize 3D over idle loading.
      if (bounds.top < -1 && bounds.bottom > 0 && -bounds.top < window.innerHeight * 1.4) load();
    };
    const observer = new IntersectionObserver(([entry]) => {
      cancel();
      if (!entry.isIntersecting) return;
      timer = setTimeout(() => {
        if ("requestIdleCallback" in window)
          idle = window.requestIdleCallback(load, { timeout: 1500 });
        else load();
      }, 750);
    });
    observer.observe(element);
    // Keep WebGL clouds out of the globe-growth handoff. Enhance only afterwards.
    entranceObserver = new MutationObserver(() => {
      const bounds = element.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) load();
    });
    entranceObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancel();
      observer.disconnect();
      entranceObserver.disconnect();
    };
  }, [hero]);
  return (
    <div className="earth-artwork" aria-hidden="true" data-ready={ready}>
      <div className="earth-preview-sky" />
      <img
        className="earth-preview-cloud"
        src="/textures/cloud-bank/cloud-04.webp"
        alt=""
        width={541}
        height={154}
        loading="lazy"
        decoding="async"
      />
      <img
        className="earth-artwork-fallback"
        fetchPriority="high"
        src="/textures/earth-india-fallback.webp"
        alt=""
        width={768}
        height={768}
        loading="eager"
        decoding="async"
      />
      {enhanced && <EarthScene motion={motion} embedded onStatus={setReady} />}
    </div>
  );
}
