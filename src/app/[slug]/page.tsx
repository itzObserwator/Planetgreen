import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageDirectory } from "@/data/page-directory";
import { PageShell } from "@/components/page-shell";
import { PageContent } from "@/components/page-content";
import live from "@/data/live-pages.json";

export const dynamicParams = false;
export function generateStaticParams() {
  return pageDirectory.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = pageDirectory.find((page) => page.slug === slug);
  if (!entry) return {};
  const text = live[entry.sourceKey].sections
    .flatMap((section) => section.blocks)
    .find((block) => block.tag === "p")?.text;
  return {
    title: `${entry.title} — Planet Green`,
    description: text?.slice(0, 180) ?? `${entry.title} · Planet Green`,
    alternates: { canonical: `/${slug}/` },
    openGraph: {
      title: `${entry.title} — Planet Green`,
      description: text?.slice(0, 180) ?? `${entry.title} · Planet Green`,
    },
  };
}
export default async function EditorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = pageDirectory.find((page) => page.slug === slug);
  if (!entry) notFound();
  return (
    <PageShell>
      <PageContent entry={entry} />
    </PageShell>
  );
}
