"use client";
import { pageDirectory } from "@/data/page-directory";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Plus, Play } from "lucide-react";
import { communities, contact, gallery, pillars, type Community } from "@/data/content";
import { Action, Eyebrow, Heading, Reveal } from "./ui";
import { PhotoStack } from "./photo-stack";

export function Philosophy() {
  return (
    <section id="philosophy" className="section philosophy section-glow">
      <div className="container">
        <Reveal>
          <Eyebrow>Our vision and philosophy</Eyebrow>
          <Heading
            className="statement"
            lines={["Nature and people.", "A relationship to renew."]}
          />
          <p className="section-lead">
            Planet Green promotes sustainable development through natural farming and green living
            communities. Our aim is to help families reconnect with nature and care for the land.
          </p>
        </Reveal>
        <div className="three-columns pillars">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.number} delay={i * 0.15}>
              <Eyebrow>{pillar.number}</Eyebrow>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FarmExperience({ onVisit }: { onVisit: () => void }) {
  return (
    <section id="farm-natura" className="section farm-experience">
      <div className="container editorial-grid">
        <Reveal className="editorial-copy">
          <Eyebrow>Life at Farm Natura</Eyebrow>
          <Heading lines={["Natural farming.", "Managed with care."]} />
          <p className="large-copy">
            Farm Natura is Planet Green’s managed natural-farming estate near Kandukur, on the
            Srisailam Highway.
          </p>
          <p>
            Families can own farmland and take part in growing seasonal produce, while dedicated
            agronomy staff manage everyday farming operations.
          </p>
          <p>
            The project’s approach centres on natural farming, soil revitalisation and indigenous
            seeds, bringing farm living and care for the land together.
          </p>
          <Action onClick={onVisit}>Experience Farm Natura</Action>
        </Reveal>
        <div>
          <PhotoStack
            label="Natural farming at Farm Natura."
            photos={[
              {
                src: "/images/farm-natura-01.webp",
                alt: "Farm Natura circular clubhouse surrounded by green farmland",
              },
              { src: "/images/farm-natura-07.webp", alt: "Fresh gourds growing on the farm" },
              { src: "/images/farm-natura-03.webp", alt: "A pavilion on the Farm Natura estate" },
              { src: "/images/farm-natura-building.webp", alt: "A Farm Natura farmhouse at dusk" },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

export function Impact() {
  const metrics = [
    {
      label: "Ecoworld",
      value: "300",
      suffix: "+",
      text: "acres in the Ecoworld residential villa plot community.",
    },
    {
      label: "Farm Natura",
      value: "110",
      suffix: "+",
      text: "acres of managed farmland at Farm Natura.",
    },
    {
      label: "Soil revitalisation",
      value: "6",
      suffix: "+",
      text: "years of soil revitalisation reported by Farm Natura.",
    },
  ];
  return (
    <section className="section impact">
      <div className="container">
        <Reveal>
          <Eyebrow>Our projects, in context</Eyebrow>
          <Heading lines={["Grounded in land.", "Focused on nature."]} />
          <p>Figures published by our project websites.</p>
        </Reveal>
        <div className="three-columns metrics">
          {metrics.map((metric, i) => (
            <Reveal key={metric.value} delay={i * 0.15}>
              <Eyebrow>{metric.label}</Eyebrow>
              <p className="metric-number">
                {metric.value}
                <span>{metric.suffix}</span>
              </p>
              <p>{metric.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandMarquee() {
  return (
    <section className="brand-section" aria-label="The Planet Green family">
      <div className="container">
        <Reveal>
          <Eyebrow>Four ventures. One shared purpose.</Eyebrow>
          <Heading lines={["Sustainable development,", "in different forms."]} />
        </Reveal>
      </div>
      <div className="brand-marquees" aria-hidden="true">
        {[0, 1].map((row) => (
          <div key={row} className={`marquee-row ${row ? "marquee-reverse" : ""}`}>
            <div className="marquee-track">
              {Array.from({ length: 4 }, (_, set) =>
                communities.map((c) => (
                  <div className={`marquee-logo marquee-logo-${c.id}`} key={`${set}-${c.id}`}>
                    <img
                      src={c.logo}
                      alt=""
                      width={180}
                      height={75}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                )),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Communities({
  onExplore,
  onVisit,
}: {
  onExplore: (community: Community) => void;
  onVisit: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <section id="communities" className="section communities">
      <div className="container">
        <div className="editorial-grid community-intro">
          <Reveal>
            <Eyebrow>The Planet Green world</Eyebrow>
            <Heading lines={["Different paths.", "Sustainable development."]} />
            <p>
              Residential communities, managed natural farming, farmland restoration and traditional
              rice cultivation. Explore four ventures shaped by a shared connection with nature.
            </p>
            <p>Our approach brings land, farming and community life together.</p>
            <Action onClick={onVisit}>Find your connection</Action>
          </Reveal>
          <Reveal className="visit-timeline" delay={0.15}>
            <Eyebrow>Your journey starts here</Eyebrow>
            {[
              {
                title: "Discover",
                text: "Explore the four ventures and their approach to living and farming with nature.",
              },
              {
                title: "Experience",
                text: "Speak with our team to learn about a project and arrange a site visit.",
              },
              {
                title: "Belong",
                text: "Understand the project, its location and the farming or living experience it offers.",
              },
            ].map((step, i) => (
              <div className={`timeline-item ${i === 0 ? "is-current" : ""}`} key={step.title}>
                <span className="timeline-dot" />
                <span className="timeline-number">0{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
        <Eyebrow className="ventures-label">Explore our four ventures</Eyebrow>
      </div>
      <div className="community-list">
        {communities.map((c) => (
          <div className={`community-row ${expanded === c.id ? "is-open" : ""}`} key={c.id}>
            <div className="container">
              <button
                className="community-row-button"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                aria-expanded={expanded === c.id}
                aria-controls={`details-${c.id}`}
              >
                <span className="community-row-main">
                  <span className="community-index">{c.number}</span>
                  <img src={c.image} alt="" loading="lazy" />
                  <span>
                    <span className="community-name">{c.name}</span>
                    <span className="community-category">{c.category}</span>
                  </span>
                </span>
                <span className="community-row-description">{c.description}</span>
                <span className="community-plus">
                  <Plus strokeWidth={1} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {expanded === c.id && (
                  <motion.div
                    id={`details-${c.id}`}
                    className="community-expanded"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.645, 0.045, 0.355, 1] }}
                  >
                    <div className="community-expanded-inner">
                      <div className="expanded-image">
                        <img
                          src={c.detailImage}
                          alt={`${c.name} ${c.id === "ecoworld" ? "project visualization" : "landscape"}`}
                          loading="lazy"
                        />
                        {c.id === "ecoworld" && <span>Project visualization</span>}
                      </div>
                      <div>
                        <p>{c.detail}</p>
                        <ul>
                          {c.facts.map((fact) => (
                            <li key={fact}>{fact}</li>
                          ))}
                        </ul>
                        <Action onClick={() => onExplore(c)}>Explore {c.name}</Action>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OurStory() {
  return (
    <section id="our-story" className="section our-story section-glow">
      <div className="container editorial-grid">
        <Reveal className="editorial-copy">
          <Eyebrow>Our story</Eyebrow>
          <Heading lines={["Natural farming.", "A shared vision."]} />
          <p className="large-copy">
            Planet Green brings natural farming and green eco-habitats together to help urban
            families reconnect with nature.
          </p>
          <p>
            Vinay Ram’s experience in natural farming led to the idea of combining farming and
            living through Planet Green. This connection between land and everyday life continues to
            shape our work.
          </p>
          <p>
            Our vision of sustainable development is expressed through nature-led communities,
            managed farmlands and the preservation of traditional farming knowledge.
          </p>
          <div className="story-signature">
            <img src="/brand/planet-green.svg" alt="Planet Green" loading="lazy" />
            <span>Move to Nature</span>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <PhotoStack
            label="Farming and community life."
            photos={[
              { src: "/images/farm-natura-08.webp", alt: "Botanical life flourishing on the farm" },
              {
                src: "/images/farm-natura-12.webp",
                alt: "Aerial photograph of Farm Natura agricultural fields",
              },
              { src: "/images/farm-natura-02.webp", alt: "Food and fresh produce at Farm Natura" },
              {
                src: "/images/veda-bharath-farming.webp",
                alt: "A Veda Bharath farmer working in a green rice field",
              },
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}

export function Gallery() {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    const firstPhoto = element.children[0] as HTMLElement;
    element.scrollBy({
      left: direction * (firstPhoto.offsetWidth + 24),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  return (
    <section className="section gallery-section">
      <div className="container gallery-header">
        <Reveal>
          <Eyebrow>Visual stories of Planet Green</Eyebrow>
          <Heading lines={["Farming. Places. People."]} />
        </Reveal>
        <div className="gallery-controls">
          <button
            onClick={() => move(-1)}
            disabled={current === 0}
            aria-label="Previous gallery photograph"
          >
            <ArrowLeft size={22} strokeWidth={1.2} />
          </button>
          <button
            onClick={() => move(1)}
            disabled={current === gallery.length - 1}
            aria-label="Next gallery photograph"
          >
            <ArrowRight size={22} strokeWidth={1.2} />
          </button>
        </div>
      </div>
      <div
        ref={track}
        className="gallery-track"
        onScroll={() => {
          const el = track.current;
          if (el) {
            const item = el.children[0] as HTMLElement;
            const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 3;
            setCurrent(
              atEnd
                ? gallery.length - 1
                : Math.min(gallery.length - 1, Math.round(el.scrollLeft / (item.offsetWidth + 24))),
            );
          }
        }}
      >
        {gallery.map((photo, i) => (
          <figure className="gallery-photo" key={photo.image}>
            <img src={photo.image} alt={photo.caption} loading="lazy" />
            <figcaption>
              <span>
                {photo.tag} <span className="gallery-number">0{i + 1}</span>
              </span>
              <h3>{photo.caption}</h3>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

const thoughts = [
  {
    text: "Bring people closer to nature through natural farming and green living communities.",
    label: "Our purpose",
  },
  {
    text: "Help people relearn how to grow food, cultivate produce and replenish soil.",
    label: "Our mission",
  },
  {
    text: "Create farming ecosystems and living communities where people can indulge, involve and impact nature in a positive way.",
    label: "Our approach",
  },
];

export function PhilosophyCarousel() {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!visible || reduced || paused) return;
    const interval = window.setInterval(() => setIndex((i) => (i + 1) % thoughts.length), 5000);
    return () => window.clearInterval(interval);
  }, [visible, reduced, paused, index]);
  return (
    <section
      ref={ref}
      className="section thought-section"
      aria-roledescription="carousel"
      aria-label="Planet Green philosophy"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Eyebrow>The Planet Green philosophy</Eyebrow>
      <div className="thought-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduced ? 0 : -40 }}
            transition={{ duration: 0.3 }}
          >
            <p className="thought-text">{thoughts[index].text}</p>
            <p className="thought-label">{thoughts[index].label}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="thought-dots">
        {thoughts.map((thought, i) => (
          <button
            key={thought.label}
            className={i === index ? "is-active" : ""}
            aria-label={`Show philosophy ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => setIndex(i)}
          >
            <span />
          </button>
        ))}
      </div>
    </section>
  );
}

export function Conversations() {
  return (
    <section className="section conversations">
      <div className="container">
        <Reveal>
          <Eyebrow>Sustainable Living with Shilpa Reddy</Eyebrow>
          <Heading lines={["Conversations about", "sustainable living."]} />
          <p>
            Planet Green’s collaboration with Shilpa Reddy explores personal choices, sustainable
            living and our relationship with nature.
          </p>
        </Reveal>
        <div className="conversation-grid">
          {[
            {
              name: "Dia Mirza",
              url: "https://www.youtube.com/watch?v=qDiovuw6kxc",
              image: "https://i.ytimg.com/vi/qDiovuw6kxc/hqdefault.jpg",
            },
            {
              name: "Samantha",
              url: "https://www.youtube.com/watch?v=N_iSKzS9c2E",
              image: "https://i.ytimg.com/vi/N_iSKzS9c2E/hqdefault.jpg",
            },
          ].map((video, i) => (
            <Reveal key={video.name} delay={i * 0.1}>
              <a href={video.url} target="_blank" rel="noreferrer" className="conversation-link">
                <div className="conversation-image">
                  <img
                    src={video.image}
                    alt={`${video.name} on Sustainable Living`}
                    loading="lazy"
                  />
                  <span className="play-button">
                    <Play size={23} strokeWidth={1.2} />
                  </span>
                </div>
                <div>
                  <span>In conversation with {video.name}</span>
                  <ArrowUpRight strokeWidth={1.2} />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer({ onVisit }: { onVisit: () => void }) {
  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer-top editorial-grid">
          <Reveal>
            <Eyebrow>Connect with Planet Green</Eyebrow>
            <Heading lines={["Let’s build a", "greener future."]} />
          </Reveal>
          <Reveal className="footer-copy" delay={0.1}>
            <p>
              Explore our communities, natural farming and heritage rice ventures. We also welcome
              conversations with people and organisations who share our commitment to sustainable
              development.
            </p>
            <p>
              Get in touch to learn about our projects, arrange a visit or discuss a collaboration.
            </p>
            <Action onClick={onVisit}>Let’s get in touch</Action>
          </Reveal>
        </div>
        <div className="footer-contacts">
          <div>
            <Eyebrow>Say hello</Eyebrow>
            <a href={`mailto:${contact.email}`}>
              {contact.email}
              <ArrowUpRight size={18} />
            </a>
            <a href={contact.phoneHref}>
              {contact.phone}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="footer-address">
            <Eyebrow>Find us</Eyebrow>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              {contact.address}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div>
            <Eyebrow>Follow the journey</Eyebrow>
            <a
              href="https://www.instagram.com/planetgreeneco_official/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
              <ArrowUpRight size={18} />
            </a>
            <a
              href="https://www.youtube.com/channel/UCoClvBsQCNd5kgbN12dMYDA"
              target="_blank"
              rel="noreferrer"
            >
              YouTube
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <nav className="footer-page-links" aria-label="Website pages">
          {pageDirectory.map((page) => (
            <a key={page.slug} href={`/${page.slug}/`}>
              {page.label}
            </a>
          ))}
        </nav>
        <div className="footer-wordmark" aria-hidden="true">
          Move to Nature.
        </div>
        <div className="footer-bottom">
          <a href="/" aria-label="Return to Planet Green home">
            <img
              src="/brand/planet-green.svg"
              alt="Planet Green"
              width={130}
              height={47}
              loading="lazy"
            />
          </a>
          <span>© {new Date().getFullYear()} Planet Green Infra Pvt Ltd</span>
          <a href="#home" className="back-to-top">
            Back to the top <ArrowUpRight size={17} strokeWidth={1.2} />
          </a>
        </div>
      </div>
    </footer>
  );
}
