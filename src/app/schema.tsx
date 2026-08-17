export default function SchemaMarkup() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "MineralTrack",
          url: "https://www.mineraltrack.shop",
          logo: "https://www.mineraltrack.shop/icon.svg",
          sameAs: ["https://www.mineraltrack.shop"],
          description:
            "MineralTrack provides secure digital mineral transport authorization, QR verification, and compliance tracking for mineral transportation operations.",
          areaServed: "India",
          industry: "Mining and Logistics",
          keywords: [
            "mineral transport",
            "eForm-C",
            "mineral pass",
            "transport authorization",
            "UP minerals compliance",
          ],
        }),
      }}
    />
  );
}
