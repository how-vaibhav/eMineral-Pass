import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getResourceBySlug, resources } from "@/lib/data/resources";

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const resource = getResourceBySlug(resolvedParams.slug);

  if (!resource) {
    return {
      title: "Resource Not Found | MineralTrack",
    };
  }

  // Optionally fetch parent metadata if needed
  // const previousImages = (await parent).openGraph?.images || []

  return {
    title: resource.title,
    description: resource.excerpt,
    keywords: resource.seoKeywords,
    alternates: {
      canonical: `/resources/${resource.slug}`,
    },
    openGraph: {
      title: resource.title,
      description: resource.excerpt,
      url: `https://www.mineraltrack.shop/resources/${resource.slug}`,
      type: "article",
      authors: [resource.author],
      tags: resource.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: resource.title,
      description: resource.excerpt,
    },
  };
}

// 2. Static path generation for build time optimization (SSG)
export async function generateStaticParams() {
  return resources.map((resource) => ({
    slug: resource.slug,
  }));
}

// 3. The Page Component
export default async function ResourceArticlePage({ params }: Props) {
  const resolvedParams = await params;
  const resource = getResourceBySlug(resolvedParams.slug);

  if (!resource) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background py-16 px-6">
      <article className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/resources" className="text-primary hover:underline mb-6 inline-block font-medium">
            ← Back to Resources
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold uppercase tracking-wider text-xs">
              {resource.tags[0]}
            </span>
            <time dateTime={resource.date}>
              {new Date(resource.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </time>
            <span>•</span>
            <span>By {resource.author}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            {resource.title}
          </h1>
          <p className="text-xl text-muted-foreground border-l-4 border-primary pl-4 italic">
            {resource.excerpt}
          </p>
        </div>

        {/* 
          Using dangerouslySetInnerHTML because our mock content is HTML.
          In a real production app with user input, this should be sanitized
          or we should use MDX / a proper rich text renderer.
        */}
        <div 
          className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-primary max-w-none"
          dangerouslySetInnerHTML={{ __html: resource.content }}
        />
      </article>
    </main>
  );
}
