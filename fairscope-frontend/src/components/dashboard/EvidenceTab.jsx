import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function EvidenceTab({ analysis }) {
  const importances = analysis?.feature_importances || [];
  const samples = analysis?.sample_predictions || [];
  const maxImportance = Math.max(...importances.map((f) => f.importance), 0.001);

  return (
    <div className="space-y-6">
      <div className="bg-base-700 border border-base-border rounded-card p-6">
        <h3 className="font-display font-semibold text-ink-primary mb-1">
          Feature importance
        </h3>
        <p className="text-xs text-ink-muted font-mono mb-6">
          SHAP · mean absolute contribution to each prediction
        </p>

        <div className="space-y-4">
          {importances.map((f, i) => (
            <div key={f.feature}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-sm text-ink-primary font-medium flex items-center gap-1.5">
                  {f.feature}
                  <span className="text-xs text-ink-muted font-normal">
                    ({f.direction})
                  </span>
                </span>
                <span className="font-mono text-xs text-ink-secondary">
                  {f.importance.toFixed(4)}
                </span>
              </div>
              <div className="h-2 bg-base-600 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(f.importance / maxImportance) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
                  className="h-full rounded-full bg-accent-blue"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-base-700 border border-base-border rounded-card p-6 overflow-x-auto">
        <h3 className="font-display font-semibold text-ink-primary mb-1">
          Sample predictions
        </h3>
        <p className="text-xs text-ink-muted font-mono mb-5">
          First {samples.length} rows evaluated by the model
        </p>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-base-border text-ink-muted text-xs uppercase tracking-wider">
              {samples[0] &&
                Object.keys(samples[0]).map((key) => (
                  <th key={key} className="text-left py-2 pr-4 font-medium">
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {samples.map((row, i) => (
              <tr key={i} className="border-b border-base-border/50 text-ink-secondary">
                {Object.entries(row).map(([key, val]) => (
                  <td
                    key={key}
                    className={`py-2.5 pr-4 font-mono text-xs ${
                      key === "prediction" ? "text-ink-primary font-semibold" : ""
                    }`}
                  >
                    {String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
