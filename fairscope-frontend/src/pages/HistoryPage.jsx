import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  History as HistoryIcon, Download, FolderOpen,
  Loader2, FilePlus2, AlertCircle
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getAuditHistory, getFullAudit, getReportPdfUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const verdictStyles = {
  FAIR: "text-accent-green bg-accent-green/10 border-accent-green/25",
  POTENTIALLY_BIASED: "text-accent-amber bg-accent-amber/10 border-accent-amber/25",
  BIASED: "text-accent-red bg-accent-red/10 border-accent-red/25",
};

export default function HistoryPage() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reopeningId, setReopeningId] = useState(null);
  const [reopenError, setReopenError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    getAuditHistory(user.id)
      .then((data) => setAudits(data.audits || []))
      .catch(() => setError("Couldn't reach the backend. Make sure it's running."))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleReopen(auditId) {
    setReopenError("");
    setReopeningId(auditId);
    try {
      const full = await getFullAudit(auditId, user?.id);
      navigate(`/dashboard/audit/${auditId}`, {
        state: { analysis: full.evidence, verdict: full.verdict, targetColumn: full.target_column },
      });
    } catch {
      setReopenError(
        "Couldn't reopen this audit — evidence wasn't stored for older audits. Run a new audit to get full results."
      );
      setReopeningId(null);
    }
  }

  return (
    <DashboardLayout>
      <p className="font-mono text-xs tracking-widest text-accent-blue uppercase mb-2">Archive</p>
      <h1 className="font-display font-bold text-2xl text-ink-primary mb-8">Audit history</h1>

      {loading && (
        <div className="flex items-center gap-2 text-ink-muted text-sm">
          <Loader2 size={16} className="animate-spin" />
          Loading…
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/25 text-accent-red text-sm rounded-lg px-4 py-3 mb-6">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p>{error}</p>
            <p className="text-xs mt-1 opacity-80">
              Start the backend server, then{" "}
              <button onClick={() => window.location.reload()} className="underline">
                refresh this page
              </button>
              .
            </p>
          </div>
        </div>
      )}

      {reopenError && (
        <div className="flex items-start gap-2 bg-accent-amber/10 border border-accent-amber/25 text-accent-amber text-sm rounded-lg px-4 py-3 mb-6">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>{reopenError}</p>
        </div>
      )}

      {!loading && audits.length === 0 && !error && (
        <div className="text-center py-20 border border-dashed border-base-border rounded-card">
          <HistoryIcon size={22} className="text-ink-muted mx-auto mb-3" />
          <p className="text-sm text-ink-secondary mb-1">No audits yet.</p>
          <p className="text-xs text-ink-muted mb-5">
            Once you run an audit, it will show up here.
          </p>
          <Link
            to="/dashboard/new"
            className="inline-flex items-center gap-1.5 text-sm text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
          >
            <FilePlus2 size={14} />
            Start your first audit
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {audits.map((a, i) => (
          <motion.div
            key={a.audit_id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between bg-base-700 border border-base-border rounded-lg px-5 py-4 hover:border-ink-muted/50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm text-ink-primary">#{a.audit_id.toUpperCase()}</p>
              <p className="text-xs text-ink-muted mt-0.5 truncate">
                {a.dataset_filename} · target: <span className="font-mono">{a.target_column}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
              {a.verdict && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border hidden sm:inline-flex ${
                    verdictStyles[a.verdict] || verdictStyles.POTENTIALLY_BIASED
                  }`}
                >
                  {a.verdict.replace("_", " ")}
                </span>
              )}

              {a.has_full_data ? (
                <button
                  onClick={() => handleReopen(a.audit_id)}
                  disabled={reopeningId === a.audit_id}
                  title="Reopen full audit results"
                  className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary border border-base-border hover:border-ink-muted px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {reopeningId === a.audit_id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <FolderOpen size={12} />
                  )}
                  Reopen
                </button>
              ) : (
                <span
                  title="Evidence wasn't stored for this audit (older format). Download the PDF report instead."
                  className="text-xs text-ink-muted italic hidden sm:block cursor-help border border-dashed border-base-border px-2.5 py-1.5 rounded-lg"
                >
                  PDF only
                </span>
              )}

              <a
                href={getReportPdfUrl(a.audit_id)}
                target="_blank"
                rel="noreferrer"
                title="Download PDF report"
                className="text-ink-secondary hover:text-ink-primary transition-colors p-1"
              >
                <Download size={16} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
