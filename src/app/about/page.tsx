import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About MineralTrack",
  description:
    "Learn how MineralTrack helps mineral transport businesses manage eForm-C issuance, QR verification, and compliant mineral movement tracking in India.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <section className="mb-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
          About MineralTrack
        </p>
        <h1 className="mb-5 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Digital mineral transport authorization built for compliance and
          speed.
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          MineralTrack is designed for mineral transport operators, license
          hosts, and regulatory stakeholders who need a secure, transparent, and
          efficient way to create, verify, and track eForm-C passes for mineral
          movement across India.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Built for transparency",
            text: "Every digital pass carries a QR code, audit trail, and verification path that helps authorities and stakeholders confirm authenticity in real time.",
          },
          {
            title: "Made for compliance",
            text: "The platform has been structured around field requirements commonly used in mineral transport records, QR pass issuance, and permit verification workflows.",
          },
          {
            title: "Designed for operations",
            text: "From submitters to host agencies, the system helps reduce manual paperwork and speed up mineral movement approvals without sacrificing accountability.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
              {item.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
