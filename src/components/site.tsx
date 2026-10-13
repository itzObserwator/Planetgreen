"use client";

import { useState } from "react";
import { Navigation } from "./navigation";
import { Hero } from "./hero";
import { EarthBackground } from "./earth-background";
import {
  Philosophy,
  FarmExperience,
  Impact,
  BrandMarquee,
  Communities,
  OurStory,
  Gallery,
  PhilosophyCarousel,
  Conversations,
  Footer,
} from "./sections";
import { CommunityDialog, ContactDialog } from "./contact-dialog";
import type { Community } from "@/data/content";

export function Site() {
  const [visitOpen, setVisitOpen] = useState(false);
  const [initialCommunity, setInitialCommunity] = useState("Farm Natura");
  const [community, setCommunity] = useState<Community | null>(null);
  const openVisit = (name = "Farm Natura") => {
    setInitialCommunity(name);
    setVisitOpen(true);
  };
  return (
    <div className="site-shell">
      <EarthBackground />
      <a className="skip-link" href="#philosophy">
        Skip to content
      </a>
      <Navigation onVisit={() => openVisit()} />
      <main>
        <Hero />
        <Philosophy />
        <FarmExperience onVisit={() => openVisit()} />
        <Impact />
        <BrandMarquee />
        <Communities onExplore={setCommunity} onVisit={() => openVisit("Planet Green")} />
        <OurStory />
        <Gallery />
        <PhilosophyCarousel />
        <Conversations />
      </main>
      <Footer onVisit={() => openVisit("Planet Green")} />
      <ContactDialog
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        initialCommunity={initialCommunity}
      />
      <CommunityDialog
        community={community}
        onClose={() => setCommunity(null)}
        onVisit={openVisit}
      />
    </div>
  );
}
