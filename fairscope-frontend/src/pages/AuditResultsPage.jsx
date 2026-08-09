import { useState } from "react";
import { useLocation, useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { ListTree, Gavel, MessagesSquare, ArrowLeft, Loader2 } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import EvidenceTab from "../components/dashboard/EvidenceTab";
import VerdictTab from "../components/dashboard/VerdictTab";
import CrossExamineTab from "../components/dashboard/CrossExamineTab";
import { getFullAudit } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const tabs = [
  { id: "evidence", label: "Evidence", icon: ListTree },
  { id: "verdict", label: "Verdict", icon: Gavel },
  { id: "cross-examine", label: "Cross-Examination", icon: MessagesSquare },
];

export default function AuditResultsPage() {
  const { auditId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("evidence");

  // State from navigation (fresh audit or History reopen)
  const [analysis, setAnalysis] = useState(location.state?.analysis || null);
  const [verdict, setVerdict] = useState(location.state?.verdict || null);
  const [targetColumn, setTargetColumn] = useState(location.state?.targetColumn || "");
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [loadError, setLoadError] = useState("");

  // If no state (e.g. direct URL / page refresh), try fetching from backend
  useEffect(() => {
    if (!analysis || !verdict) {
      if (!user) return; // wait for auth
      setLoadingAudit(true);
      getFullAudit(auditId, user.id)
        .then((full) => {
          setAnalysis(full.evidence);
          setVerdict(full.verdict);
          setTargetColumn(full.target_column || "");
        })
        .catch(() => {
          setLoadError("Audit data not found. It may have expired or never been stored.");
        })
        .finally(() => setLoadingAudit(false));
    }
  }, [auditId, user]);

  if (loadingAudit) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-3 text-ink-secondary py-20 justify-center">
          <Loader2 size={20} className="animate-spin text-accent-blue" />
          <span className="text-sm">Loading audit…</span>
        </div>
      </DashboardLayout>
    );
  }

  if (loadError) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto py-20 text-center">
          <p className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/25 rounded-lg px-4 py-3 mb-5">
            {loadError}
          </p>
          <Link to="/dashboard/new" className="text-sm text-accent-blue hover:text-accent-blue/80 font-medium">
            ← Start a new audit
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!analysis || !verdict) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-1">
        <p className="font-mono text-xs tracking-widest text-accent-blue uppercase">
          Case file
        </p>
        <Link
          to="/dashboard/new"
          className="text-xs text-ink-secondary hover:text-ink-primary transition-colors"
        >
          + New audit
        </Link>
      </div>
      <h1 className="font-display font-bold text-2xl text-ink-primary mb-1">
        #{auditId.toUpperCase()}
      </h1>
      <p className="text-sm text-ink-muted font-mono mb-8">
        Target: {targetColumn}
      </p>

      <div className="flex items-center gap-1 border-b border-base-border mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-accent-blue text-ink-primary"
                  : "border-transparent text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "evidence" && <EvidenceTab analysis={analysis} />}
      {activeTab === "verdict" && <VerdictTab verdict={verdict} auditId={auditId} />}
      {activeTab === "cross-examine" && (
        <CrossExamineTab analysis={analysis} auditId={auditId} />
      )}
    </DashboardLayout>
  );
}
