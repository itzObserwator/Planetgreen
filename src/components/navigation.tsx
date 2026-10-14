"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Action } from "./ui";
import { pageDirectory } from "@/data/page-directory";
import Link from "next/link";

const links = [
  { href: "#philosophy", label: "Our philosophy" },
  { href: "#communities", label: "Communities" },
  { href: "#farm-natura", label: "Farm Natura" },
];

export function Navigation({
  onVisit,
  interior = false,
}: {
  onVisit: () => void;
  interior?: boolean;
}) {
  const primary = interior
    ? [
        { href: "/about-us/", label: "About us" },
        { href: "/philosophy/", label: "Philosophy" },
        { href: "/communities/", label: "Communities" },
      ]
    : links;
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 45);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = document.querySelectorAll<HTMLElement>("main, footer, .brand, .skip-link");
    background.forEach((element) => (element.inert = true));
    const controls = () =>
      [
        toggle.current,
        ...document.querySelectorAll<HTMLElement>(
          "#mobile-navigation a, #mobile-navigation button",
        ),
      ].filter(Boolean) as HTMLElement[];
    controls()[1]?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") {
        const items = controls();
        const current = items.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && current <= 0) {
          e.preventDefault();
          items.at(-1)?.focus();
        }
        if (!e.shiftKey && current === items.length - 1) {
          e.preventDefault();
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
        <nav className="desktop-navigation" aria-label="Main navigation">
          {primary.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <details className="navigation-pages">
            <summary>
              Explore <span aria-hidden="true">↗</span>
            </summary>
            <div className="navigation-page-list">
              {pageDirectory.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${page.slug}/`}
                  onClick={(e) => {
                    e.currentTarget.closest("details")?.removeAttribute("open");
                  }}
                >
                  {page.label}
                </Link>
              ))}
            </div>
          </details>
          <Action onClick={onVisit}>Visit us</Action>
        </nav>
        <button
          ref={toggle}
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-navigation has-page-links"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {primary.map((link, i) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                <span>0{i + 1}</span>
                {link.label}
              </a>
            ))}
            <div className="mobile-page-links">
              {pageDirectory
                .filter((page) => !primary.some((link) => link.href === `/${page.slug}/`))
                .map((page) => (
                  <Link key={page.slug} href={`/${page.slug}/`} onClick={() => setOpen(false)}>
                    {page.label}
                  </Link>
                ))}
            </div>
            <Action
              onClick={() => {
                setOpen(false);
                onVisit();
              }}
            >
              Plan a visit
            </Action>
            <p>A little closer to nature.</p>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
