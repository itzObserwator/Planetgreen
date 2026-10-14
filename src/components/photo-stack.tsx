"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Photo = { src: string; alt: string };
const rotations = [-7, 6, -3, 4];

export function PhotoStack({
  photos,
  label = "A glimpse of Farm Natura",
}: {
  photos: Photo[];
  label?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  return (
    <div className="photo-stack-area">
      <button
        className="photo-stack"
        onClick={() => setIndex((index + 1) % photos.length)}
        aria-label={`Next photograph: ${label}`}
      >
        {[2, 1].map((depth) => {
          const p = photos[(index + depth) % photos.length];
          return (
            <img
              key={`back-${depth}`}
              className={`stack-back stack-back-${depth}`}
              src={p.src}
              alt=""
              loading="lazy"
              style={{
                transform: `rotate(${rotations[(index + depth) % rotations.length]}deg) scale(${1 - depth * 0.065})`,
              }}
            />
          );
        })}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            className="stack-front"
            key={index}
            src={photos[index].src}
            alt={photos[index].alt}
            loading="lazy"
            decoding="async"
            fetchPriority="high"
            initial={{
              opacity: 0,
              scale: 0.92,
              rotate: rotations[index % rotations.length],
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: rotations[index % rotations.length],
            }}
            exit={{ opacity: 0, scale: 1.1, y: -10 }}
            transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
          />
        </AnimatePresence>
      </button>
      <div className="stack-caption">
        <span>{label}</span>
        <button
          onClick={() => setIndex((index + 1) % photos.length)}
          aria-label="View next farm photograph"
        >
          <span>
            {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </span>
          <ArrowRight size={19} strokeWidth={1.3} />
        </button>
      </div>
    </div>
  );
}
