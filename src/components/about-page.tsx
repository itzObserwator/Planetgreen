import Link from "next/link";
import { ArrowDown, Leaf, Sprout, Trees } from "./icons";
import live from "@/data/live-pages.json";
import { Action, Eyebrow, Heading } from "./ui";
import { PhotoCollection } from "./page-media";

// Keep the About page's source content in the shared editorial data.
export function AboutPage() {
  const [introduction, people, awards, purpose] = live["about-us"].sections;
  const paragraphs = introduction.blocks.filter((block) => block.tag === "p");
  return (
    <div className="about-page">
      <header className="about-hero container">
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>About us</span>
        </nav>
        <div className="about-hero-layout">
          <div className="about-hero-copy">
            <Eyebrow>People · Land · Life</Eyebrow>
            <h1>
              About
              <br />
              Planet Green<span>.</span>
            </h1>
            <p className="about-hero-tagline">{introduction.blocks[0].text}</p>
            <a className="about-story-link" href="#our-story">
              <span>Our story</span>
              <ArrowDown size={20} aria-hidden="true" />
            </a>
          </div>
          <figure className="about-hero-landscape">
            <div className="about-photo-orbit" aria-hidden="true">
              <Leaf strokeWidth={1.3} />
            </div>
            <img
              src="/images/farmnatura-collection-01.webp"
              alt="Aerial view of Farm Natura's cultivated fields and farm community"
              width={1673}
              height={940}
              fetchPriority="high"
            />
            <figcaption>
              <span>Farm Natura</span>
              <span>A closer connection to nature</span>
            </figcaption>
          </figure>
        </div>
        <div className="about-hero-baseline">
          <span>Planet Green · Move to Nature</span>
          <Leaf size={18} aria-hidden="true" />
          <span>Sustainable development</span>
        </div>
      </header>

      <section id="our-story" className="about-story container" aria-labelledby="about-story-title">
        <div className="about-section-label">
          <span>01 / Our story</span>
          <span className="about-label-line" />
        </div>
        <div className="about-story-layout">
          <Heading id="about-story-title" lines={["Rooted in nature.", "Made for life."]} />
          <div className="about-story-copy">
            {paragraphs.map((block) => (
              <p key={block.text}>{block.text}</p>
            ))}
            <Action href="/communities/">Explore our communities</Action>
          </div>
        </div>
        <div className="about-photo-journal">
          <PhotoCollection
            label="Life at Planet Green"
            photos={introduction.images.map((src, i) => ({
              src,
              alt: [
                "A farm home under the moonlight",
                "Life in a nature-led community",
                "Nature at Planet Green",
              ][i],
            }))}
          />
        </div>
      </section>

      <section className="about-purpose container" aria-labelledby="about-purpose-title">
        <div className="about-section-label">
          <span>02 / Our purpose</span>
          <span className="about-label-line" />
        </div>
        <Heading id="about-purpose-title" lines={["A shared future.", "A natural beginning."]} />
        <div className="about-purpose-grid">
          {[
            { icon: Trees, index: 0 },
            { icon: Sprout, index: 2 },
          ].map(({ icon: Icon, index }) => (
            <article key={index}>
              <div className="about-purpose-top">
                <Icon size={30} strokeWidth={1.4} aria-hidden="true" />
                <span>0{index / 2 + 1}</span>
              </div>
              <h3>{purpose.blocks[index].text}</h3>
              <p>{purpose.blocks[index + 1].text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-founder container" aria-labelledby="about-founder-title">
        <div className="about-section-label">
          <span>03 / {people.blocks[0].text}</span>
          <span className="about-label-line" />
        </div>
        <div className="about-founder-layout">
          <div>
            <Eyebrow>People behind Planet Green</Eyebrow>
            <h2 id="about-founder-title">
              Vinay Ram<span>Managing Director</span>
            </h2>
            <p>{people.blocks[1].text}</p>
          </div>
          <figure className="about-founder-quote">
            <span className="about-quote-mark" aria-hidden="true">
              “
            </span>
            <blockquote>{people.blocks[2].text}</blockquote>
            <figcaption>
              <span className="about-signature-line" />
              {people.blocks[3].text}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="about-awards container" aria-labelledby="about-awards-title">
        <div className="about-section-label">
          <span>04 / Recognition</span>
          <span className="about-label-line" />
        </div>
        <div className="about-awards-heading">
          <Heading id="about-awards-title" lines={[awards.blocks[0].text]} />
          <span>
            View the moments <ArrowDown size={16} aria-hidden="true" />
          </span>
        </div>
        <PhotoCollection
          label="Indian Achievers Award"
          photos={awards.images.map((src, i) => ({
            src,
            alt: `Indian Achievers Award · photograph ${i + 1}`,
          }))}
        />
      </section>
      <section className="about-invitation container">
        <Leaf size={28} strokeWidth={1.4} aria-hidden="true" />
        <Eyebrow>Move to nature</Eyebrow>
        <Heading lines={["Find your place", "closer to nature."]} />
        <Action href="/contact-us/">Get in touch</Action>
      </section>
    </div>
  );
}
