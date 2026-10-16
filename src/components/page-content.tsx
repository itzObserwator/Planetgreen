import { ArrowDown, ArrowUpRight } from "./icons";
import Link from "next/link";
import { AboutPage } from "./about-page";
import live from "@/data/live-pages.json";
import { communities, contact } from "@/data/content";
import { pageDirectory, type PageEntry } from "@/data/page-directory";
import { Eyebrow, Heading, Action } from "./ui";
import { PhotoCollection, GalleryCollection, VideoCollection } from "./page-media";
import { PageEnquiry } from "./page-enquiry";
import { bahrainPhotos } from "@/data/event-gallery";

type Block = { tag: string; text: string };
type EditorialSection = { blocks: Block[]; images: string[] };
function Blocks({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, i) =>
    block.tag === "p" ? <p key={i}>{block.text}</p> : <Heading key={i} lines={[block.text]} />,
  );
}
function Editorial({
  section,
  index,
  legal = false,
}: {
  section: EditorialSection;
  index: number;
  legal?: boolean;
}) {
  return (
    <section
      className={`page-editorial ${section.images.length ? "with-media" : ""} ${index % 2 ? "is-reversed" : ""} ${legal ? "legal-copy" : ""}`}
    >
      <div className="page-editorial-copy">
        <Blocks blocks={section.blocks} />
      </div>
      {section.images.length > 0 && (
        <PhotoCollection
          photos={section.images.map((src, i) => ({
            src,
            alt: `${section.blocks.find((b) => b.tag !== "p")?.text ?? "Planet Green"} · ${i + 1}`,
          }))}
          label={section.blocks.find((b) => b.tag !== "p")?.text ?? "Planet Green"}
        />
      )}
    </section>
  );
}

function CommunityList({ section }: { section: EditorialSection }) {
  const titles = section.blocks.filter((b) => b.tag === "h3");
  const descriptions = section.blocks.filter((b) => b.tag === "p").slice(-4);
  // Reorder complete entries so their original editorial copy stays with the project.
  const orderedCommunities = communities
    .map((community, index) => ({
      community,
      title: titles[index].text,
      description: descriptions[index].text,
    }))
    .sort(
      (a, b) =>
        Number(a.community.id === "green-land-capital") -
        Number(b.community.id === "green-land-capital"),
    );
  return (
    <>
      <div className="page-introduction">
        <Heading lines={[section.blocks[0].text]} />
        {section.blocks.filter((b) => b.tag === "p").length > 4 && <p>{section.blocks[1].text}</p>}
      </div>
      <div className="page-community-list">
        {orderedCommunities.map(({ community, title, description }, i) => (
          <article key={community.id} id={community.id}>
            <div className="page-community-image">
              <img
                src={community.image}
                alt={
                  community.id === "ecoworld"
                    ? "Ecoworld park visualization with gardens, pathways and a footbridge"
                    : community.name
                }
                width={1000}
                height={700}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div>
              <Eyebrow>{String(i + 1).padStart(2, "0")}</Eyebrow>
              <Heading lines={[title]} />
              <p>{description}</p>
              <Action href={community.url} external>
                More detail
              </Action>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function PageContent({ entry }: { entry: PageEntry }) {
  if (entry.slug === "about-us") return <AboutPage />;
  const page = live[entry.sourceKey];
  const legal = entry.slug === "privacy-policy" || entry.slug === "terms-and-conditions";
  return (
    <>
      <header className={`inner-hero container ${legal ? "is-legal" : ""}`}>
        <div className="page-breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{entry.label}</span>
        </div>
        <Eyebrow>Building a serene ecosystem</Eyebrow>
        <h1>
          {entry.title}
          <span className="page-title-dot" aria-hidden="true">
            .
          </span>
        </h1>
        <div className="inner-hero-foot">
          <span>Planet Green · Move to Nature</span>
          <ArrowDown size={24} aria-hidden="true" />
        </div>
      </header>
      <div className="container inner-content">
        {entry.slug === "gallery" ? (
          <>
            <section className="page-gallery" aria-labelledby="community-gallery-title">
              <Heading id="community-gallery-title" lines={["Visual Stories of Planet Green"]} />
              <GalleryCollection groups={live.galleryGroups} />
            </section>
            <section
              className="page-gallery event-gallery"
              id="bahrain-visuals"
              aria-labelledby="event-gallery-title"
            >
              <Eyebrow>Bahrain · 2023 archive</Eyebrow>
              <Heading id="event-gallery-title" lines={["Visuals from Bahrain"]} />
              <PhotoCollection photos={bahrainPhotos} label="Bahrain" />
            </section>
          </>
        ) : entry.slug === "communities" ? (
          <CommunityList section={page.sections[0]} />
        ) : entry.slug === "collaborations" ? (
          <>
            <Editorial section={page.sections[0]} index={0} />
            <VideoCollection videos={live.videos} />
            <figure className="collaboration-photo">
              <img
                src={live.collaborationImage}
                alt="Planet Green team with Samantha"
                width={1400}
                height={800}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </>
        ) : entry.slug === "careers" ? (
          <section className="page-editorial with-media">
            <div className="page-editorial-copy">
              <Eyebrow>Careers</Eyebrow>
              <Heading lines={["Talk to our team."]} />
              <p>For More Information Call</p>
              <a className="page-contact-number" href="tel:+919100666124">
                +91 9100666124
              </a>
              <Action href="mailto:hr@planetgreen.co.in">hr@planetgreen.co.in</Action>
            </div>
            <img
              className="page-feature-image"
              src={live["careersImage"]}
              alt="Planet Green landscape"
              width={1200}
              height={800}
              decoding="async"
            />
          </section>
        ) : entry.slug === "contact-us" ? (
          <>
            <section className="page-contact-grid">
              <div>
                <Eyebrow>Have a question?</Eyebrow>
                <a href={contact.phoneHref}>+91 9555 700 900</a>
              </div>
              <div>
                <Eyebrow>Write to us</Eyebrow>
                <a href="mailto:marketing@planetgreen.co.in">marketing@planetgreen.co.in</a>
              </div>
              <div>
                <Eyebrow>Visit our office</Eyebrow>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Planet Green, 2nd Floor, Regent Square Building, Q-City Road, Beside Heritage
                  Fresh, Gowlidoddi, Hyderabad - 500075
                </a>
              </div>
            </section>
            <section className="page-editorial with-media">
              <div>
                <Heading lines={["Get in Touch"]} />
                <PageEnquiry />
              </div>
              <img
                className="page-feature-image"
                src={live["contact-usImage"]}
                alt="Planet Green"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
              />
            </section>
          </>
        ) : (
          <>
            {page.sections.map((section, i) => (
              <Editorial key={i} section={section} index={i} legal={legal} />
            ))}
          </>
        )}
        <nav className="page-directory" aria-label="Explore Planet Green">
          <Eyebrow>Explore Planet Green</Eyebrow>
          {pageDirectory
            .filter(
              (page) =>
                !page.slug.includes("policy") &&
                !page.slug.includes("conditions") &&
                page.slug !== entry.slug,
            )
            .map((page) => (
              <Link key={page.slug} href={`/${page.slug}/`}>
                {page.label}
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            ))}
        </nav>
      </div>
    </>
  );
}
