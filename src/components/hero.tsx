"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";

const EarthScene = dynamic(() => import("./earth-scene"), { ssr: false });
gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [scene, setScene] = useState("opening");
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-heading-line", {
          yPercent: 110,
          opacity: 0,
          duration: 1,
          stagger: 0.16,
          ease: "power3.inOut",
          delay: 0.2,
        });
        const globe = root.current?.querySelector<HTMLElement>(".hero-earth");
        const orbits = root.current?.querySelector<HTMLElement>(".orbit-system");
        if (!globe || !orbits) return;

        // Reference: p = scrollY / (200vh - viewportHeight). The fixed globe
        // descends by 100p%, scales by 1+p, and only fades after the intro.
        const update = (progress: number) => {
          const p = progress * 1.5;
          gsap.set(globe, {
            y: 0,
            yPercent: 6 + 100 * p,
            scale: 1 + p,
            opacity: 1 - gsap.utils.clamp(0, 1, (p - 1) / 0.4),
            visibility: p < 1.5 ? "visible" : "hidden",
          });
          gsap.set(orbits, { opacity: 1 - Math.min(p, 1) });
          const next = p < 0.2 ? "opening" : p < 1 ? "introduction" : "complete";
          setScene((previous) => (previous === next ? previous : next));
          root.current?.classList.toggle("show-scroll-cue", p < 0.05);
        };
        const trigger = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: () => `+=${Math.max(1, (root.current!.offsetHeight - window.innerHeight) * 1.5)}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => update(self.progress),
          onRefresh: (self) => update(self.progress),
        });
        update(trigger.progress);
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
          <EarthScene />
        </div>
        <div className="hero-opening" aria-hidden={scene !== "opening"}>
          <p className="hero-kicker">Rooted in nature. Made for life.</p>
          <h1 id="hero-title">
            <span className="line-mask">
              <span className="hero-heading-line">A little closer to nature.</span>
            </span>
            <span className="line-mask">
              <span className="hero-heading-line">A better way to live.</span>
            </span>
          </h1>
        </div>
        <div className="hero-introduction" aria-hidden={scene !== "introduction"}>
          <p className="eyebrow">Move to nature</p>
          <h2>
            We create communities
            <br className="desktop-break" /> where people and
            <br className="desktop-break" /> nature grow together.
          </h2>
          <p>
            Thoughtfully imagined places. Deeply rooted values.
            <br />A life connected to what really matters.
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
