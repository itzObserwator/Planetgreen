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
    const observer = new IntersectionObserver(([entry]) => {
      cancel();
      if (!entry.isIntersecting) return;
      timer = setTimeout(() => {
        const load = () => {
          setEnhanced(true);
          observer.disconnect();
        };
        if ("requestIdleCallback" in window)
          idle = window.requestIdleCallback(load, { timeout: 1500 });
        else load();
      }, 750);
    });
    observer.observe(element);
    return () => {
      cancel();
      observer.disconnect();
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
