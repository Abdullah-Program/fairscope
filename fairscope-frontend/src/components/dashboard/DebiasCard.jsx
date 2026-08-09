import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Download, CheckCircle, RefreshCw } from "lucide-react";
import { triggerDebias, getDebiasedModelUrl } from "../../lib/api";

export default function DebiasCard({ auditId, preRiskScore = 75 }) {
  const [loading, setLoading] = useState(false);
  const [debiasResult, setDebiasResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleFixModel() {
    setLoading(true);
    setError(null);
    try {
      const res = await triggerDebias(auditId);
      setDebiasResult(res);
    } catch (err) {
      setError(err.response?.data?.detail || "Debiasing process failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-base-800/95 via-base-800/80 to-base-700/90 backdrop-blur-xl border border-emerald-500/40 hover:border-emerald-400/70 rounded-2xl p-6 shadow-2xl transition-all transform-gpu hover:-translate-y-0.5">
      {/* Background ambient glow */}
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-primary text-base flex items-center gap-2">
              Automated Model Debiaser & Retrainer
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                MLOps Auto-Fix
              </span>
            </h3>
            <p className="text-xs text-ink-muted">
              Re-weights demographic samples & retrains a fair scikit-learn model on-the-fly
            </p>
          </div>
        </div>
      </div>

      {!debiasResult ? (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-base-900/60 p-5 rounded-xl border border-base-border/50">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-ink-primary block">
              Remediate Model Discriminatory Bias
            </span>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Triggers inverse-probability demographic re-weighting to balance privilege metrics while retaining predictive power.
            </p>
          </div>

          <button
            onClick={handleFixModel}
            disabled={loading}
            className="flex-shrink-0 flex items-center gap-2 font-bold text-xs px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Retraining Model...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Auto-Fix & Retrain Model
              </>
            )}
          </button>
        </div>
      ) : (
        /* Before vs After Retraining Stats & Download Button */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-5"
        >
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pre-Debias Risk */}
            <div className="bg-base-900/80 p-4 rounded-xl border border-accent-red/30">
              <span className="text-[11px] text-ink-muted uppercase font-mono block mb-1">Original Risk</span>
              <div className="text-2xl font-bold font-mono text-accent-red">{preRiskScore} / 100</div>
              <span className="text-[10px] text-accent-red/80 font-medium">Pre-debias evaluation</span>
            </div>

            {/* Post-Debias Risk */}
            <div className="bg-base-900/80 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10">
              <span className="text-[11px] text-ink-muted uppercase font-mono block mb-1">Post-Debias Risk</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center gap-1">
                {debiasResult.post_risk_score} / 100
                <CheckCircle size={18} className="text-emerald-400 ml-1" />
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">Remediated risk score</span>
            </div>

            {/* Accuracy Retention */}
            <div className="bg-base-900/80 p-4 rounded-xl border border-accent-blue/30">
              <span className="text-[11px] text-ink-muted uppercase font-mono block mb-1">Accuracy Retention</span>
              <div className="text-2xl font-bold font-mono text-accent-blue">{debiasResult.accuracy_retention}%</div>
              <span className="text-[10px] text-accent-blue/80 font-medium">Prediction fidelity retained</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle size={16} />
              Fair scikit-learn model retrained successfully!
            </span>

            <a
              href={getDebiasedModelUrl(auditId)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Download size={14} />
              Download Fixed Model (.pkl)
            </a>
          </div>
        </motion.div>
      )}

      {error && (
        <p className="text-xs text-accent-red mt-3 font-mono">{error}</p>
      )}
    </div>
  );
}
