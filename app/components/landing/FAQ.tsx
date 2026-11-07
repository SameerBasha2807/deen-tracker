import HeroBackground from "./HeroBackground";

const faqs = [
  {
    question: "Is DeenTracker free?",
    answer:
      "Yes. The core features are completely free to use with more premium features planned in future releases.",
  },
  {
    question: "Can I sync across devices?",
    answer:
      "Yes. Secure cloud synchronization keeps your progress available across all your devices.",
  },
  {
    question: "Is my worship data private?",
    answer:
      "Absolutely. Your worship data belongs only to you and is designed with privacy as a top priority.",
  },
  {
    question: "Can I customize my goals?",
    answer:
      "Yes. Create personalized daily and weekly Islamic goals that fit your lifestyle.",
  },
];

export default function FAQ() {
  return (
    <section className="relative overflow-hidden bg-[#030712] py-28">
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Heading */}

        <div className="text-center">
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
            FAQ
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Everything you need to know before starting your journey with
            DeenTracker.
          </p>
        </div>

        {/* FAQ Cards */}

        <div className="mt-20 space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="
                rounded-[32px]
                border
                border-slate-800
                bg-slate-900/70
                p-8
                backdrop-blur-xl
                shadow-xl
                transition-all
                duration-300
                hover:border-emerald-500/40
                hover:shadow-[0_20px_60px_rgba(16,185,129,0.12)]
              "
            >
              <h3 className="text-2xl font-semibold text-white">
                {faq.question}
              </h3>

              <p className="mt-5 leading-8 text-slate-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}