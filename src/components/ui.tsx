"use client";

import { ArrowUpRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function Action({
  children,
  href,
  onClick,
  className = "",
  external = false,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span className="action-label">{children}</span>
      <span className="action-arrow" aria-hidden="true">
        <ArrowRight size={20} strokeWidth={1.3} />
      </span>
    </>
  );
  return href ? (
    <a
      href={href}
      className={`action ${className}`}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {content}
    </a>
  ) : (
    <button onClick={onClick} className={`action ${className}`}>
      {content}
    </button>
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

// Words slide out of individual masks, with the reference's 0.6-second sequence.
export function Heading({ lines, className = "" }: { lines: string[]; className?: string }) {
  const count = lines.join(" ").split(" ").length;
  return (
    <motion.h2
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.6 / count } } }}
    >
      {lines.map((line, lineIndex) => (
        <span className="heading-line" key={lineIndex}>
          {line.split(" ").map((word, wordIndex) => (
            <span key={wordIndex}>
              {wordIndex > 0 && " "}
              <span className="heading-word">
                <motion.span
                  variants={{ hidden: { y: "110%", opacity: 0 }, visible: { y: "0%", opacity: 1 } }}
                  transition={{ duration: 1, ease: [0.645, 0.045, 0.355, 1] }}
                >
                  {word}
                </motion.span>
              </span>
            </span>
          ))}
        </span>
      ))}
    </motion.h2>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 38 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ExternalIcon() {
  return <ArrowUpRight size={21} strokeWidth={1.2} aria-hidden="true" />;
}
