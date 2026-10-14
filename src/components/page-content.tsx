import Link from "next/link";
import live from "@/data/live-pages.json";
import { communities, contact } from "@/data/content";
import { pageDirectory, type PageEntry } from "@/data/page-directory";
import { Eyebrow, Heading, Action } from "./ui";
import { PhotoCollection, GalleryCollection, VideoCollection } from "./page-media";
import { PageEnquiry } from "./page-enquiry";

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
  return (
    <>
      <div className="page-introduction">
        <Heading lines={[section.blocks[0].text]} />
        {section.blocks.filter((b) => b.tag === "p").length > 4 && <p>{section.blocks[1].text}</p>}
      </div>
      <div className="page-community-list">
        {communities.map((community, i) => (
          <article key={community.id} id={community.id}>
            <div className="page-community-image">
              <img
                src={community.image}
                alt={community.name}
                width={1000}
                height={700}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div>
              <Eyebrow>{String(i + 1).padStart(2, "0")}</Eyebrow>
              <Heading lines={[titles[i].text]} />
              <p>{descriptions[i].text}</p>
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
  const page = live[entry.sourceKey];
  const isEvent = entry.slug.includes("expo");
  const legal = entry.slug === "privacy-policy" || entry.slug === "terms-and-conditions";
  return (
    <>
      <header className={`inner-hero container ${legal ? "is-legal" : ""}`}>
        <div className="page-breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{entry.label}</span>
        </div>
        <Eyebrow>{isEvent ? "Events · 2023 archive" : "Building a serene ecosystem"}</Eyebrow>
        <h1>
          {entry.title}
          <span className="page-title-dot" aria-hidden="true">
            .
          </span>
        </h1>
        <div className="inner-hero-foot">
          <span>Planet Green · Move to Nature</span>
          <span aria-hidden="true">↓</span>
        </div>
      </header>
      <div className="container inner-content">
        {entry.slug === "gallery" ? (
          <section className="page-gallery">
            <Heading lines={["Visual Stories of Planet Green"]} />
            <GalleryCollection groups={live.galleryGroups} />
          </section>
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
            {isEvent && (
              <section className="event-introduction">
                <Eyebrow>Past event · 2023</Eyebrow>
                <Heading
                  lines={["Embrace Nature with Planet Green's Open Villa Plots and Farmlands!"]}
                />
                {entry.slug === "behrain-expo-2023" && (
                  <div className="event-facts">
                    <p>
                      15th March to 18th March 2023
                      <br />
                      10.00am to 8.00pm
                    </p>
                    <p>
                      Location Details:
                      <br />
                      Block 1062 Road 6204 Gulf of Bahrain Road Sakhir
                    </p>
                  </div>
                )}
                <Action href="mailto:info@planetgreen.co.in">Enquire now</Action>
              </section>
            )}
            {page.sections.map((section, i) =>
              isEvent && i === 1 ? (
                <CommunityList key={i} section={section} />
              ) : (
                <Editorial key={i} section={section} index={i} legal={legal} />
              ),
            )}
            {isEvent && <VideoCollection videos={live.videos.slice(0, 2)} />}
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
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
        </nav>
      </div>
    </>
  );
}
