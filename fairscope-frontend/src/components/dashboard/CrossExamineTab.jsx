import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessagesSquare, Loader2, ArrowRight } from "lucide-react";
import { runWhatIf } from "../../lib/api";

export default function CrossExamineTab({ analysis, auditId }) {
  const features = analysis?.feature_importances?.map((f) => f.feature) || [];
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(feature, value) {
    setValues((prev) => ({ ...prev, [feature]: value }));
  }

  async function handleSimulate() {
    setError("");
    const modifiedRow = {};
    Object.entries(values).forEach(([key, val]) => {
      if (val !== "" && val !== undefined) {
        const num = Number(val);
        modifiedRow[key] = isNaN(num) ? val : num;
      }
    });

    if (Object.keys(modifiedRow).length === 0) {
      setError("Enter at least one feature value to test.");
      return;
    }

    setLoading(true);
    try {
      const data = await runWhatIf(auditId, modifiedRow);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Simulation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-base-700 border border-base-border rounded-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <MessagesSquare size={18} className="text-accent-blue" />
          <h3 className="font-display font-semibold text-ink-primary">
            Cross-examination
          </h3>
        </div>
        <p className="text-xs text-ink-muted mb-6">
          Change any feature and see how the model's prediction moves. Leave
          fields blank to keep them at their original value.
        </p>

        {error && (
          <p className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/25 rounded-lg px-3.5 py-2.5 mb-5">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {features.map((feature) => (
            <div key={feature}>
              <label className="block text-xs font-mono text-ink-secondary mb-1.5">
                {feature}
              </label>
              <input
                type="text"
                value={values[feature] || ""}
                onChange={(e) => handleChange(feature, e.target.value)}
                placeholder="unchanged"
                className="w-full bg-base-600 border border-base-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent-blue transition-colors outline-none"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading}
          className="group flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-60 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Simulating…
            </>
          ) : (
            <>
              Run simulation
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-base-700 border border-base-border rounded-card p-6"
          >
            <div className="flex items-center gap-8 mb-5">
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">
                  Original
                </p>
                <p className="font-mono text-2xl text-ink-secondary">
                  {String(result.original_prediction)}
                </p>
              </div>
              <ArrowRight size={20} className="text-ink-muted mt-4" />
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">
                  New prediction
                </p>
                <p
                  className={`font-mono text-2xl font-semibold ${
                    result.new_prediction !== result.original_prediction
                      ? "text-accent-blue"
                      : "text-ink-secondary"
                  }`}
                >
                  {String(result.new_prediction)}
                </p>
              </div>
            </div>

            <p className="text-sm text-ink-secondary leading-relaxed mb-5 pb-5 border-b border-base-border">
              {result.explanation}
            </p>

            <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-3">
              Feature contributions for this scenario
            </h4>
            <div className="space-y-2">
              {result.feature_contributions?.slice(0, 5).map((c) => (
                <div key={c.feature} className="flex items-center justify-between text-sm">
                  <span className="text-ink-secondary font-mono text-xs">{c.feature}</span>
                  <span className="text-ink-secondary font-mono text-xs">
                    {c.importance.toFixed(4)} · {c.direction}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
