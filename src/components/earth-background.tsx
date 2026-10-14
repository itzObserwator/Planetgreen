"use client";

import { useEffect, useRef, useState } from "react";

const landscapes = [
  { id: "roots", from: "#philosophy", to: "#farm-natura", texture: "events" },
  { id: "partners", from: ".impact", to: ".brand-section", texture: "partners" },
  { id: "ventures", from: "#communities", to: "#communities", texture: "awards" },
  { id: "story", from: "#our-story", to: ".gallery-section", texture: "events" },
  { id: "footer", from: ".thought-section", to: "#contact", texture: "footer" },
];
type Placement = { top: number; height: number };

/** Section-aligned Earth textures form one continuous page background. */
export function EarthBackground() {
  const root = useRef<HTMLDivElement>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  useEffect(() => {
    const shell = root.current?.parentElement;
    if (!shell) return;
    const measure = () => {
      const origin = shell.getBoundingClientRect().top;
      const next = landscapes.map((scene) => {
        const start = shell.querySelector(scene.from)?.getBoundingClientRect();
        const end = shell.querySelector(scene.to)?.getBoundingClientRect();
        return start && end
          ? { top: start.top - origin, height: end.bottom - start.top }
          : { top: 0, height: 0 };
      });
      setPlacements((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(shell);
    landscapes.forEach((scene) => {
      const section = shell.querySelector(scene.from);
      if (section) observer.observe(section);
    });
    measure();
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div ref={root} className="earth-background" aria-hidden="true">
      {landscapes.map(
        (scene, index) =>
          placements[index] && (
            <div
              className={`earth-landscape earth-landscape-${scene.id}`}
              key={scene.id}
              style={placements[index]}
            >
              <div className="earth-landscape-glow" />
              <picture>
                <source
                  media="(max-width: 640px)"
                  srcSet={`/textures/reference/foliage-${scene.texture}-mobile.webp`}
                />
                <img
                  className="earth-landscape-image"
                  src={`/textures/reference/foliage-${scene.texture}.webp`}
                  alt=""
                  width={scene.texture === "events" ? 1080 : 1920}
                  height={scene.texture === "footer" ? 1294 : 1080}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
          ),
      )}
    </div>
  );
}
