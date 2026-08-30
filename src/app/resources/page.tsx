import { Metadata } from "next";
import Link from "next/link";
import { resources } from "@/lib/data/resources";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Resources & Guides | MineralTrack",
  description: "Explore our latest guides, regulatory updates, and resources for mineral transport compliance in Uttar Pradesh.",
  openGraph: {
    title: "Resources & Guides | MineralTrack",
    description: "Explore our latest guides, regulatory updates, and resources for mineral transport compliance in Uttar Pradesh.",
    url: "https://www.mineraltrack.shop/resources",
  },
  alternates: {
    canonical: "/resources",
  }
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Resources & <span className="text-primary">Guides</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest mining regulations, step-by-step guides for eForm-C, and technical insights on the MineralTrack platform.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <Link href={`/resources/${resource.slug}`} key={resource.id} className="h-full block group">
                <Card interactive className="h-full flex flex-col justify-between">
                  <div>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded-full">
                          {resource.tags[0]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(resource.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                        {resource.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3">
                        {resource.excerpt}
                      </CardDescription>
                    </CardContent>
                  </div>
                  <CardFooter>
                    <span className="text-sm font-medium text-primary flex items-center">
                      Read Article <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
