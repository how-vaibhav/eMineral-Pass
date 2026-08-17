import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | MineralTrack",
  description:
    "Find answers about mineral transport authorization, digital eForm-C processing, QR pass verification, and compliance workflows in MineralTrack.",
};

const faqs = [
  {
    question: "What is MineralTrack?",
    answer:
      "MineralTrack is a digital mineral transport authorization platform that helps issue, track, and verify eForm-C passes and QR-based mineral movement records.",
  },
  {
    question: "Who can use the platform?",
    answer:
      "The platform is designed for mineral transport operators, license hosts, compliance teams, and agencies that require a transparent and auditable pass workflow.",
  },
  {
    question: "How does QR verification work?",
    answer:
      "Each pass is generated with a unique QR code that can be scanned to validate pass details and confirm the associated transport record.",
  },
  {
    question: "Is the system built for compliance?",
    answer:
      "Yes. The platform is structured around the operational and documentation flow used for mineral transport authorization and record verification.",
  },
];

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <section className="mb-12 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
          FAQ
        </p>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Common questions about digital mineral transport authorization.
        </h1>
      </section>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <article
            key={faq.question}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
              {faq.question}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">{faq.answer}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
