"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { Action } from "./ui";
import { communities } from "@/data/content";
import { pageDirectory } from "@/data/page-directory";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primary = [
  { href: "/philosophy/", label: "Our philosophy" },
  { href: "/communities/", label: "Communities" },
];
const morePages = pageDirectory.filter(
  (page) => page.slug !== "philosophy" && page.slug !== "communities",
);
const projects = communities.map((project) => ({
  label: project.name,
  href: `/communities/#${project.id}`,
}));

export function Navigation({
  onVisit,
  interior = false,
}: {
  onVisit: () => void;
  interior?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const projectDropdown = useRef<HTMLDetailsElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 45);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!projectDropdown.current?.contains(event.target as Node))
        projectDropdown.current?.removeAttribute("open");
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && projectDropdown.current?.open) {
        projectDropdown.current.removeAttribute("open");
        projectDropdown.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = document.querySelectorAll<HTMLElement>(
      "main, footer, .brand, .skip-link, .desktop-navigation",
    );
    background.forEach((element) => (element.inert = true));
    const controls = () =>
      [
        toggle.current,
        ...document.querySelectorAll<HTMLElement>(
          "#website-navigation a, #website-navigation button",
        ),
      ].filter(
        (element): element is HTMLElement => !!element && element.getClientRects().length > 0,
      );
    controls()[1]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        const items = controls();
        const current = items.indexOf(document.activeElement as HTMLElement);
        if (event.shiftKey && current <= 0) {
          event.preventDefault();
          items.at(-1)?.focus();
        }
        if (!event.shiftKey && current === items.length - 1) {
          event.preventDefault();
          items[0]?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      background.forEach((element) => (element.inert = false));
      toggle.current?.focus();
    };
  }, [open]);

  return (
    <>
      <header className={`navigation ${scrolled ? "is-scrolled" : ""}`}>
        <a className="brand" href={interior ? "/" : "#home"} aria-label="Planet Green home">
          <img src="/brand/planet-green.svg" alt="Planet Green" width="167" height="60" />
        </a>
        <div className="navigation-controls">
          <nav className="desktop-navigation" aria-label="Main navigation">
            {primary.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={
                  pathname.replace(/\/$/, "") === link.href.replace(/\/$/, "") ? "page" : undefined
                }
              >
                {link.label}
              </Link>
            ))}
            <details ref={projectDropdown} className="navigation-pages project-dropdown">
              <summary>
                Projects <ChevronDown size={15} aria-hidden="true" />
              </summary>
              <div className="navigation-page-list">
                {projects.map((project) => (
                  <Link
                    key={project.href}
                    href={project.href}
                    onClick={() => projectDropdown.current?.removeAttribute("open")}
                  >
                    {project.label}
                  </Link>
                ))}
              </div>
            </details>
            <Action onClick={onVisit}>Visit us</Action>
          </nav>
          <button
            ref={toggle}
            className="menu-toggle"
            onClick={() => {
              projectDropdown.current?.removeAttribute("open");
              setOpen(!open);
            }}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="website-navigation"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="website-navigation"
            className="site-navigation-panel"
            aria-label="More navigation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="menu-intro">
              <p className="eyebrow">Explore Planet Green</p>
              <p>
                A little closer
                <br />
                to nature.
              </p>
            </div>
            <div className="menu-links">
              <div className="menu-primary">
                {primary.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                <p className="eyebrow">Projects</p>
                <div className="menu-projects">
                  {projects.map((project) => (
                    <Link key={project.href} href={project.href} onClick={() => setOpen(false)}>
                      {project.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="menu-rest-pages">
                {morePages.map((page, i) => (
                  <Link key={page.slug} href={`/${page.slug}/`} onClick={() => setOpen(false)}>
                    <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    {page.label}
                    <span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
              <Action
                onClick={() => {
                  setOpen(false);
                  onVisit();
                }}
              >
                Visit us
              </Action>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
