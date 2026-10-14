"use client";
import { useState, type ReactNode } from "react";
import { Navigation } from "./navigation";
import { Footer } from "./sections";
import { ContactDialog } from "./contact-dialog";
import { EarthBackground } from "./earth-background";

/** Shared chrome for the editorial pages. The 3D hero stays on the home page. */
export function PageShell({ children }: { children: ReactNode }) {
  const [visitOpen, setVisitOpen] = useState(false);
  return (
    <div className="site-shell inner-page-shell" id="home">
      <EarthBackground interior />
      <a className="skip-link" href="#page-content">
        Skip to content
      </a>
      <Navigation interior onVisit={() => setVisitOpen(true)} />
      <main id="page-content">{children}</main>
      <Footer onVisit={() => setVisitOpen(true)} />
      <ContactDialog
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        initialCommunity="Planet Green"
      />
    </div>
  );
}
