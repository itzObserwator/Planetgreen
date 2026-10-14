"use client";

import { useRef, useState } from "react";
import { DeferredEarth } from "./deferred-earth";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Bean, Layers3, Leaf, Sprout, TreePine, Trees, Wheat } from "lucide-react";
import { sustainabilityThemes } from "@/data/content";
import { Action, WordReveal } from "./ui";
import type { EarthMotion } from "./earth-scene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const sustainabilityIcons = {
  farming: Sprout,
  living: Trees,
  rice: Wheat,
  soil: Layers3,
  restoration: TreePine,
  seeds: Bean,
};

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const earthMotion = useRef<EarthMotion>({ progress: 0 });
  const [scene, setScene] = useState("opening");
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const globe = root.current?.querySelector<HTMLElement>(".hero-earth");
        const orbits = root.current?.querySelector<HTMLElement>(".orbit-system");
        if (!globe || !orbits) return;

        // Reference: p = scrollY / (200vh - viewportHeight). The fixed globe
        // descends by 100p%, scales by 1+p, and only fades after the intro.
        const update = () => {
          // Read the actual hero position for both transforms and text scenes.
          // This remains aligned during trackpad inertia, reversing and resizing.
          const bounds = root.current!.getBoundingClientRect();
          const p = gsap.utils.clamp(
            0,
            2,
            -bounds.top / Math.max(1, bounds.height - window.innerHeight),
          );
          earthMotion.current.progress = p;
          gsap.set(globe, {
            y: 0,
            yPercent: 6 + 100 * p,
            scale: 1 + p,
            opacity: 1 - gsap.utils.clamp(0, 1, (p - 1) / 0.4),
            visibility: p < 1.5 ? "visible" : "hidden",
          });
          gsap.set(orbits, { opacity: 1 - Math.min(p, 1) });
          // A demand-rendered canvas must be explicitly redrawn after each scroll.
          earthMotion.current.requestRender?.();
          const next = p <= 0.2 ? "opening" : p > 0.2 && p < 1 ? "introduction" : "complete";
          setScene((previous) => (previous === next ? previous : next));
          root.current?.classList.toggle("show-scroll-cue", p < 0.05);
        };
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: () => `+=${Math.max(1, (root.current!.offsetHeight - window.innerHeight) * 1.5)}`,
          invalidateOnRefresh: true,
          onUpdate: update,
          onRefresh: update,
        });
        update();
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="home"
      ref={root}
      className="hero show-scroll-cue"
      data-scene={scene}
      aria-labelledby="hero-title"
    >
      <div className="hero-stage">
        <div className="hero-haze" />
        <div className="hero-earth">
          <div className="orbit-system" aria-hidden="true">
            <div className="orbit orbit-one">
              <span />
            </div>
            <div className="orbit orbit-two">
              <span />
            </div>
            <div className="orbit orbit-three">
              <span />
            </div>
          </div>
          <DeferredEarth hero={root} motion={earthMotion} />
        </div>
        <div className="hero-opening" aria-hidden={scene !== "opening"}>
          <p className="hero-kicker">
            <Leaf className="hero-nature-icon" strokeWidth={1.8} aria-hidden="true" />
            Rooted in nature. Made for life.
          </p>
          <WordReveal
            as="h1"
            id="hero-title"
            lines={["Sustainable development.", "Rooted in nature."]}
            visible={scene === "opening"}
          />
          <p className="hero-summary">
            Natural farming and green communities that bring people closer to nature.
          </p>
          <Action href="#communities" className="hero-action">
            Explore our ventures
          </Action>
        </div>
        <div className="hero-details" aria-hidden="true">
          <svg className="hero-botanical" viewBox="0 0 260 300" fill="none">
            <path d="M30 290C80 220 108 134 182 28M77 209C7 213 8 129 21 98C70 119 103 161 77 209ZM114 147C176 158 223 98 223 60C162 56 114 91 114 147ZM150 80C112 75 104 25 116 4C147 20 169 47 150 80Z" />
            <path d="M77 209L21 98M114 147L223 60M150 80L116 4" />
          </svg>
          <div className="hero-world-note">
            <span />
            People · Land · Life
          </div>
          {sustainabilityThemes.map(({ id, label }) => {
            const Icon = sustainabilityIcons[id];
            return (
              <div key={id} className={`hero-nature-label hero-nature-${id}`}>
                <Icon className="hero-nature-icon" strokeWidth={1.8} />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
        <div className="hero-introduction" aria-hidden={scene !== "introduction"}>
          <p className="eyebrow">Move to nature</p>
          <WordReveal
            lines={["We create communities", "where sustainable", "development takes root."]}
            visible={scene === "introduction"}
          />
          <p>
            Natural farming. Green eco-habitats.
            <br />A closer connection between people and land.
          </p>
        </div>
        <div className="hero-bottom">
          <span>Hyderabad, India</span>
          <a href="#philosophy" aria-label="Scroll to our philosophy">
            <span className="scroll-line" />
            <ArrowDown size={18} strokeWidth={1.2} />
          </a>
          <span>Scroll to discover</span>
        </div>
      </div>
    </section>
  );
}
