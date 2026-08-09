import { motion } from "framer-motion";
import { UploadCloud, Microscope, Gavel } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: UploadCloud,
    title: "Submit the model",
    body: "Upload a scikit-learn compatible model and the dataset it was trained on. Tell FairScope which column it predicts.",
  },
  {
    n: "02",
    icon: Microscope,
    title: "Evidence is gathered",
    body: "SHAP explains every feature's pull on every prediction. Statistical fairness tests run against any sensitive attributes you name — zip code, gender, age.",
  },
  {
    n: "03",
    icon: Gavel,
    title: "The verdict is written",
    body: "An AI investigator reads the evidence and writes a plain-English case file: fair, potentially biased, or biased — with the numbers to back it up.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-xl"
        >
          <p className="font-mono text-xs tracking-widest text-accent-blue uppercase mb-3">
            The process
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink-primary tracking-tight">
            Three steps from black box to case file.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-px bg-base-border rounded-card overflow-hidden">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-base-800 p-8 relative"
            >
              <span className="font-mono text-xs text-ink-muted tracking-wider">
                {step.n}
              </span>
              <div className="w-11 h-11 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mt-5 mb-5">
                <step.icon size={19} className="text-accent-blue" strokeWidth={1.75} />
              </div>
              <h3 className="font-display font-semibold text-lg text-ink-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
