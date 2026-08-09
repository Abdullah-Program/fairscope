import { motion } from "framer-motion";
import { ListTree, MessagesSquare, FileDown } from "lucide-react";

const features = [
  {
    icon: ListTree,
    title: "Cross-examination",
    body: "Change any feature and watch the prediction move in real time — see exactly which inputs the model leans on hardest.",
  },
  {
    icon: MessagesSquare,
    title: "Plain-English verdicts",
    body: "No SHAP literacy required. The case file reads like an investigator's report, not a statistics textbook.",
  },
  {
    icon: FileDown,
    title: "Exportable case files",
    body: "Every audit compiles into a downloadable PDF — evidence, metrics, and verdict, ready to attach to a compliance review.",
  },
];

export default function Features() {
  return (
    <section className="relative py-28 px-6 md:px-10 bg-base-900/40">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <f.icon size={22} className="text-accent-teal mb-4" strokeWidth={1.6} />
              <h3 className="font-display font-semibold text-ink-primary mb-2">{f.title}</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
