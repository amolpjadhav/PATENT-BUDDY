"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Is Patent Buddy legal advice?",
    a: "No. Patent Buddy is a drafting assistance tool only. It helps you organise and articulate your invention, but nothing it produces constitutes legal advice. Always consult a registered patent attorney before filing.",
  },
  {
    q: "Do I still need a patent attorney?",
    a: "Yes — for filing. Patent Buddy produces a structured first draft that gives your attorney a solid starting point, which can significantly reduce their billable hours. But attorney review and filing remain essential.",
  },
  {
    q: "Can it draft provisional and non-provisional applications?",
    a: "Patent Buddy generates a complete provisional-style specification including abstract, background, summary, detailed description, drawings list, and claims. Your attorney can use this as the basis for either a provisional or non-provisional application.",
  },
  {
    q: "What formats can I export?",
    a: "You can export your draft as a formatted DOCX (Microsoft Word) document, ready to share with your attorney or collaborators.",
  },
  {
    q: "How is my invention protected?",
    a: "Your project data is stored confidentially and never used to train AI models. You can delete your project at any time. We recommend not sharing your project link with anyone outside your legal team.",
  },
  {
    q: "Can I collaborate with others?",
    a: "Currently each project is tied to your browser session. Multi-user collaboration and team workspaces are on the roadmap.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-medium text-gray-900">{q}</span>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="pb-5 text-sm text-gray-600 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
          <p className="text-gray-500">Everything you need to know before you start.</p>
        </div>
        <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white px-6">
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
