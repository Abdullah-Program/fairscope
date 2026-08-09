import { motion } from "framer-motion";
import { Gavel, Download, Wrench } from "lucide-react";
import { getReportPdfUrl } from "../../lib/api";
import CourtroomDebate from "./CourtroomDebate";
import DebiasCard from "./DebiasCard";

const verdictStyles = {
  FAIR: { color: "text-accent-green", bg: "bg-accent-green/10", border: "border-accent-green/25" },
  POTENTIALLY_BIASED: { color: "text-accent-amber", bg: "bg-accent-amber/10", border: "border-accent-amber/25" },
  BIASED: { color: "text-accent-red", bg: "bg-accent-red/10", border: "border-accent-red/25" },
};

function getRiskBarColor(score) {
  if (score < 30) return "bg-accent-green";
  if (score < 65) return "bg-accent-amber";
  return "bg-accent-red";
}

function getRiskText(score) {
  if (score < 30) return { label: "Low Risk", color: "text-accent-green" };
  if (score < 65) return { label: "Moderate Risk", color: "text-accent-amber" };
  return { label: "High Bias Risk", color: "text-accent-red" };
}

export default function VerdictTab({ verdict, auditId }) {
  const style = verdictStyles[verdict?.verdict] || verdictStyles.POTENTIALLY_BIASED;
  const riskScore = Math.min(100, Math.max(0, Math.round(verdict?.risk_score || 0)));
  const riskInfo = getRiskText(riskScore);
  const barColor = getRiskBarColor(riskScore);

  return (
    <div className="space-y-6">
      {/* Top Banner & Risk Score Gauge */}
      <div className="bg-base-700/80 backdrop-blur-md border border-base-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            <Gavel size={18} className="text-accent-blue" />
            <h3 className="font-display font-semibold text-ink-primary">Auditor Verdict Summary</h3>
          </div>
          <a
            href={getReportPdfUrl(auditId)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary border border-base-border hover:border-ink-muted px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download size={12} />
            Download PDF Report
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-6">
          {/* Verdict Status */}
          <div className="md:col-span-2 space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded-lg border ${style.color} ${style.bg} ${style.border}`}
            >
              {verdict?.verdict?.replace("_", " ")}
              <span className="text-xs font-normal opacity-70">
                ({Math.round((verdict?.confidence || 0) * 100)}% confidence)
              </span>
            </motion.div>

            <p className="text-sm text-ink-secondary leading-relaxed">
              {verdict?.summary}
            </p>
          </div>

          {/* Risk Score Gauge Meter */}
          <div className="bg-base-800/90 border border-base-border rounded-xl p-4 flex flex-col justify-center shadow-inner">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-ink-muted font-medium uppercase tracking-wider">Bias Risk Index</span>
              <span className={`font-semibold ${riskInfo.color}`}>{riskInfo.label}</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold font-mono text-ink-primary">{riskScore}</span>
              <span className="text-xs text-ink-muted">/ 100</span>
            </div>

            {/* Gauge Progress Bar */}
            <div className="w-full bg-base-900 rounded-full h-2.5 overflow-hidden border border-base-border/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${riskScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${barColor}`}
              />
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="pt-5 border-t border-base-border">
          <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-3">
            Key Investigation Findings
          </h4>
          <ul className="space-y-2">
            {(verdict?.key_findings || []).map((finding, i) => (
              <li key={i} className="text-sm text-ink-secondary flex items-start gap-2">
                <span className="text-accent-blue mt-1">•</span>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 🎭 Interactive 3D Multi-Agent Courtroom Debate */}
      {verdict?.debate_transcript && verdict.debate_transcript.length > 0 && (
        <CourtroomDebate transcript={verdict.debate_transcript} />
      )}

      {/* ⚡ Automated Model Debiaser & Retrainer */}
      <DebiasCard auditId={auditId} preRiskScore={riskScore} />

      {/* Mitigation Action Plan */}
      {(verdict?.mitigation_recommendations || []).length > 0 && (
        <div className="bg-base-700/80 backdrop-blur-md border border-base-border rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Wrench size={16} className="text-accent-amber" />
            <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              Mitigation Action Plan (Engineering Recommendations)
            </h4>
          </div>
          <div className="space-y-2.5">
            {verdict.mitigation_recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-base-800/60 border border-base-border/40 text-sm text-ink-secondary"
              >
                <span className="flex-shrink-0 text-accent-amber font-mono text-xs font-semibold mt-0.5">
                  #{i + 1}
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Checklist */}
      <div className="bg-base-700/80 backdrop-blur-md border border-base-border rounded-2xl p-6 shadow-lg">
        <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-4">
          Regulatory Compliance Checklist
        </h4>
        <div className="space-y-2.5">
          {(verdict?.compliance_checklist || []).map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm py-2 border-b border-base-border/50 last:border-0"
            >
              <span className="text-ink-secondary">
                {c.check} <span className="text-ink-muted font-mono text-xs">({c.feature})</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-ink-secondary">{c.value}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    c.passes
                      ? "text-accent-green bg-accent-green/10 border-accent-green/25"
                      : "text-accent-red bg-accent-red/10 border-accent-red/25"
                  }`}
                >
                  {c.passes ? "Pass" : "Fail"}
                </span>
              </div>
            </div>
          ))}
          {(!verdict?.compliance_checklist || verdict.compliance_checklist.length === 0) && (
            <p className="text-sm text-ink-muted">
              No sensitive features were tested for this audit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
