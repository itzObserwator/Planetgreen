"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";

const EarthScene = dynamic(() => import("./earth-scene"), { ssr: false });
gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Hero() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".hero-heading-line", {
        yPercent: 110,
        duration: 1.5,
        stagger: 0.16,
        ease: "power3.out",
        delay: 0.2,
      });
      gsap.from(".hero-kicker, .hero-bottom", { opacity: 0, duration: 1.5, delay: 0.65 });
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });
      timeline
        .to(".hero-opening", { opacity: 0, y: -55, duration: 0.2 }, 0.02)
        .to(".hero-bottom", { opacity: 0, duration: 0.15 }, 0)
        .fromTo(
          ".hero-introduction",
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.25 },
          0.23,
        )
        .to(".hero-introduction", { opacity: 0, y: -50, duration: 0.15 }, 0.83)
        .to(".hero-earth", { yPercent: 43, scale: 1.45, duration: 1, ease: "none" }, 0)
        .to(".hero-earth", { opacity: 0, duration: 0.45 }, 0.5)
        .to(
          ".orbit-system",
          { rotation: 22, scale: 1.15, opacity: 0, duration: 1, ease: "none" },
          0,
        );
    },
    { scope: root },
  );

  return (
    <section id="home" ref={root} className="hero" aria-labelledby="hero-title">
      <div className="hero-stage">
        <div className="hero-haze" />
        <div className="orbit-system" aria-hidden="true">
          <div className="orbit orbit-one">
            <span />
          </div>
          <div className="orbit orbit-two">
            <span />
          </div>
          <div className="orbit orbit-three" />
        </div>
        <div className="hero-earth">
          <EarthScene />
        </div>
        <div className="hero-opening">
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
        <div className="hero-introduction">
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
