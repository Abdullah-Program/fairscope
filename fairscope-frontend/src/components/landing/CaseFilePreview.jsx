import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const evidence = [
  { feature: "zip_code", importance: 0.198, direction: "increases", flag: true },
  { feature: "income", importance: 0.131, direction: "decreases", flag: false },
  { feature: "credit_score", importance: 0.081, direction: "increases", flag: false },
  { feature: "loan_amount", importance: 0.029, direction: "decreases", flag: false },
  { feature: "gender", importance: 0.011, direction: "increases", flag: false },
];

const metrics = [
  { name: "Disparate Impact Ratio", feature: "zip_code", value: "0.67", threshold: "≥ 0.80", pass: false },
  { name: "Demographic Parity Diff.", feature: "zip_code", value: "-0.28", threshold: "± 0.10", pass: false },
  { name: "Disparate Impact Ratio", feature: "gender", value: "0.986", threshold: "≥ 0.80", pass: true },
  { name: "Demographic Parity Diff.", feature: "gender", value: "-0.009", threshold: "± 0.10", pass: true },
];

const maxImportance = Math.max(...evidence.map((e) => e.importance));

export default function CaseFilePreview() {
  return (
    <section id="evidence" className="relative py-28 px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-xl"
        >
          <p className="font-mono text-xs tracking-widest text-accent-blue uppercase mb-3">
            Real output, not a mockup
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink-primary tracking-tight mb-4">
            Case file #D36A33E7
          </h2>
          <p className="text-ink-secondary leading-relaxed">
            A loan-approval model, audited by FairScope. This is the actual
            evidence and verdict it produced — nothing here is illustrative.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-5 gap-5"
        >
          {/* Evidence panel */}
          <div className="lg:col-span-3 bg-base-700 border border-base-border rounded-card p-7">
            <h3 className="font-display font-semibold text-ink-primary mb-1">
              Evidence — feature importance
            </h3>
            <p className="text-xs text-ink-muted mb-6 font-mono">SHAP · mean absolute contribution</p>

            <div className="space-y-4">
              {evidence.map((e, i) => (
                <div key={e.feature}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-sm text-ink-primary font-medium flex items-center gap-1.5">
                      {e.feature}
                      {e.flag && (
                        <AlertTriangle size={12} className="text-accent-red" strokeWidth={2.5} />
                      )}
                    </span>
                    <span className="font-mono text-xs text-ink-secondary">
                      {e.importance.toFixed(3)}
                    </span>
                  </div>
                  <div className="h-2 bg-base-600 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(e.importance / maxImportance) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        e.flag ? "bg-accent-red" : "bg-accent-blue"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verdict panel */}
          <div className="lg:col-span-2 bg-base-700 border border-base-border rounded-card p-7 flex flex-col">
            <h3 className="font-display font-semibold text-ink-primary mb-1">Verdict</h3>
            <p className="text-xs text-ink-muted mb-5 font-mono">AI-generated · Groq / Llama 3.3</p>

            <div className="inline-flex items-center gap-2 self-start bg-accent-red/10 border border-accent-red/30 text-accent-red font-semibold text-sm px-3 py-1.5 rounded-lg mb-4">
              BIASED
            </div>

            <p className="text-sm text-ink-secondary leading-relaxed mb-6">
              zip_code fails both fairness thresholds and carries the highest
              feature importance in the model — a strong signal of proxy
              discrimination.
            </p>

            <div className="mt-auto space-y-2.5 pt-5 border-t border-base-border">
              {metrics.map((m) => (
                <div key={m.name + m.feature} className="flex items-center justify-between text-xs">
                  <span className="text-ink-secondary">
                    {m.name} <span className="text-ink-muted">({m.feature})</span>
                  </span>
                  <span
                    className={`font-mono font-medium ${
                      m.pass ? "text-accent-green" : "text-accent-red"
                    }`}
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
