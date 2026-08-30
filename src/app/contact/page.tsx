import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact MineralTrack",
  description:
    "Contact MineralTrack for digital mineral transport authorization, eForm-C support, and bulk pass management solutions.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
          Contact
        </p>
        <h1 className="mb-5 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Talk to the team behind your mineral transport compliance workflow.
        </h1>
        <p className="mb-8 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Whether you need support with QR pass generation, a corporate
          onboarding request, or a digital solution for mineral movement
          documentation, the MineralTrack team can help you get started.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-800">
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              Email
            </h2>
            <p className="text-lg text-slate-300 font-medium font-mono">
              howvaibhav@gmail.com
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-800">
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              Website
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              https://www.mineraltrack.shop
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
