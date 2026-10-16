"use client";

import { ArrowUpRight, SiteIcon } from "./icons";
import { motion, useInView } from "framer-motion";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useRef,
  type CSSProperties,
  type ReactElement,
  type RefObject,
} from "react";

const RevealVisibility = createContext<boolean | null>(null);

export function Action({
  children,
  href,
  onClick,
  className = "",
  external = false,
  style,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  external?: boolean;
  style?: CSSProperties;
}) {
  const content = (
    <>
      <span className="action-arrow action-arrow-left" aria-hidden="true">
        <SiteIcon name="ArrowRight" activeName="ArrowRight" size={20} strokeWidth={1.3} />
      </span>
      <span className="action-label">{children}</span>
      <span className="action-arrow" aria-hidden="true">
        <SiteIcon name="ArrowRight" activeName="ArrowRight" size={20} strokeWidth={1.3} />
      </span>
    </>
  );
  return href ? (
    <a
      href={href}
      className={`action ${className}`}
      style={style}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {content}
    </a>
  ) : (
    <button onClick={onClick} className={`action ${className}`} style={style}>
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

// One shared word animation for the hero and page headings. The reference starts
// its first word with a negative delay, spans 0.6s, enters in 1s and exits in 0.3s.
export function WordReveal({
  as: Tag = "h2",
  lines,
  visible,
  className = "",
  id,
  elementRef,
}: {
  as?: "h1" | "h2";
  lines: string[];
  visible: boolean;
  className?: string;
  id?: string;
  elementRef?: RefObject<HTMLHeadingElement | null>;
}) {
  const count = lines.join(" ").split(" ").length;
  let sequence = -1;
  return (
    <Tag
      ref={elementRef}
      id={id}
      aria-label={lines.join(" ")}
      className={`word-reveal ${visible ? "is-visible" : ""} ${className}`}
    >
      {lines.map((line, lineIndex) => (
        <span className="heading-line" key={lineIndex} aria-hidden="true">
          {line.split(" ").map((word, wordIndex) => (
            <span key={wordIndex}>
              {wordIndex > 0 && " "}
              <span className="reveal-word">
                <span
                  className="reveal-word-inner"
                  style={{ "--word-delay": `${sequence++ * (0.6 / count)}s` } as CSSProperties}
                >
                  {word}
                </span>
              </span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

export function Heading({
  lines,
  className = "",
  id,
}: {
  lines: string[];
  className?: string;
  id?: string;
}) {
  const element = useRef<HTMLHeadingElement>(null);
  const inherited = useContext(RevealVisibility);
  const visible = useInView(element, { amount: 0, once: false });
  return (
    <WordReveal
      lines={lines}
      className={className}
      id={id}
      elementRef={element}
      visible={inherited ?? visible}
    />
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
  const element = useRef<HTMLDivElement>(null);
  const visible = useInView(element, { amount: 0, once: false });
  const nodes = Children.toArray(children);
  const containsHeading = nodes.some((child) => isValidElement(child) && child.type === Heading);
  // Headings and supporting copy share an observer, without moving or fading
  // the entire heading container a second time.
  if (containsHeading) {
    return (
      <RevealVisibility.Provider value={visible}>
        <div ref={element} className={`reveal-group ${visible ? "is-revealed" : ""} ${className}`}>
          {nodes.map((child, index) => {
            if (!isValidElement(child) || child.type === Heading) return child;
            const node = child as ReactElement<{ className?: string; style?: CSSProperties }>;
            return cloneElement(node, {
              className: `${node.props.className ?? ""} ${child.type === Eyebrow ? "reveal-overline" : "reveal-copy"}`,
              style: {
                ...node.props.style,
                "--copy-delay": `${delay + index * 0.15}s`,
              } as CSSProperties,
            });
          })}
        </div>
      </RevealVisibility.Provider>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.215, 0.61, 0.355, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ExternalIcon() {
  return <ArrowUpRight size={21} strokeWidth={1.2} aria-hidden="true" />;
}
