import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mineral Transport Services",
  description:
    "Explore MineralTrack services for digital eForm-C processing, QR pass generation, mineral transport authorization, and verification workflows.",
};

const services = [
  {
    title: "eForm-C Issuance",
    text: "Create and manage transport authorization forms for mineral shipments with a digital workflow that keeps records organized and accessible.",
  },
  {
    title: "QR Pass Generation",
    text: "Generate a unique QR-enabled mineral pass for each trip, making route verification and document checks faster and more transparent.",
  },
  {
    title: "Legal Compliance Tracking",
    text: "Monitor validity, expiry, and compliance checkpoints to help keep mineral movement documentation ready and auditable.",
  },
  {
    title: "Public Verification",
    text: "Let agencies, checkpoints, or stakeholders verify pass authenticity quickly using a public verification pathway.",
  },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <section className="mb-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
          Services
        </p>
        <h1 className="mb-5 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Mineral transport solutions built for assurance, speed, and
          accountability.
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          MineralTrack helps mineral transport businesses and host agencies
          streamline eForm-C issuance, digital pass validation, and public
          verification while keeping records ready for oversight and compliance
          review.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => (
          <article
            key={service.title}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
              {service.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">{service.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
