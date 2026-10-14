"use client";

import { useRef, useState, type CSSProperties } from "react";
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

// Fixed irregular angles avoid hydration mismatches while keeping the topics mixed.
const sustainabilityOrbits = [
  {
    circle: "two",
    members: [
      { id: "restoration", angle: 24 },
      { id: "farming", angle: 171 },
      { id: "seeds", angle: 282 },
    ],
  },
  {
    circle: "three",
    members: [
      { id: "soil", angle: 61 },
      { id: "rice", angle: 207 },
      { id: "living", angle: 329 },
    ],
  },
] as const;

function positionBadgeLabel(button: HTMLButtonElement) {
  const bounds = button.getBoundingClientRect();
  button.dataset.labelSide =
    bounds.left + bounds.width / 2 > window.innerWidth / 2 ? "left" : "right";
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const earthMotion = useRef<EarthMotion>({ progress: 0 });
  const [scene, setScene] = useState("opening");
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const globe = root.current?.querySelector<HTMLElement>(".hero-earth");
        const orbits = root.current?.querySelector<HTMLElement>(".orbit-system");
        if (!globe || !orbits) return;
        const movingLayers = root.current!.querySelectorAll(".hero-earth, .hero-badge-orbit-frame");

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
          gsap.set(movingLayers, {
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
        <div className="hero-copy-veil" aria-hidden="true" />
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
        <div className="hero-details" aria-hidden={scene !== "opening"} inert={scene !== "opening"}>
          <div className="hero-world-note" aria-hidden="true">
            People · Land · Life
          </div>
          <div className="hero-badge-orbit-frame">
            {sustainabilityOrbits.map(({ circle, members }) => (
              <div key={circle} className={`hero-badge-orbit hero-badge-orbit-${circle}`}>
                {members.map(({ id, angle }) => {
                  const Icon = sustainabilityIcons[id];
                  const label = sustainabilityThemes.find((theme) => theme.id === id)!.label;
                  return (
                    <div
                      key={id}
                      className="hero-badge-slot"
                      style={{ "--badge-angle": `${angle}deg` } as CSSProperties}
                    >
                      <div className="hero-badge-counter">
                        <button
                          type="button"
                          className={`hero-nature-label hero-nature-${id}`}
                          aria-label={label}
                          data-expanded={activeBadge === id}
                          onPointerEnter={(event) => positionBadgeLabel(event.currentTarget)}
                          onFocus={(event) => positionBadgeLabel(event.currentTarget)}
                          onClick={(event) => {
                            positionBadgeLabel(event.currentTarget);
                            setActiveBadge((current) => (current === id ? null : id));
                          }}
                          onBlur={() => setActiveBadge(null)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              setActiveBadge(null);
                              event.currentTarget.blur();
                            }
                          }}
                        >
                          <Icon className="hero-nature-icon" strokeWidth={1.8} aria-hidden="true" />
                          <span aria-hidden="true">{label}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
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
          <a
            href="#philosophy"
            className="hero-scroll-control"
            aria-label="Scroll to our philosophy"
          >
            <span className="hero-scroll-stem" aria-hidden="true" />
            <span className="hero-scroll-disc" aria-hidden="true">
              <ArrowDown size={23} strokeWidth={1.5} />
            </span>
          </a>
          <span>Scroll to discover</span>
        </div>
      </div>
    </section>
  );
}
