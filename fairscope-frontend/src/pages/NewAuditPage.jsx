import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, FileCheck2, ArrowRight, AlertCircle,
  Loader2, Check, Microscope, Gavel, BookOpen, Download
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { uploadModel, analyzeAudit, generateVerdict } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// ─── File drop zone ──────────────────────────────────────────────
function FileDrop({ label, accept, file, onFile }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false);
        if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current.click()}
      className={`cursor-pointer border-2 border-dashed rounded-card p-6 text-center transition-all ${
        dragging
          ? "border-accent-blue bg-accent-blue/5 scale-[1.01]"
          : file
          ? "border-accent-green/40 bg-accent-green/5"
          : "border-base-border hover:border-ink-muted"
      }`}
    >
      <input
        ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <FileCheck2 size={22} className="text-accent-green" />
          <p className="text-sm text-ink-primary font-medium">{file.name}</p>
          <p className="text-xs text-ink-muted">Click to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <UploadCloud size={22} className="text-ink-muted" />
          <p className="text-sm text-ink-secondary">{label}</p>
          <p className="text-xs text-ink-muted">Drag & drop or click to browse</p>
        </div>
      )}
    </div>
  );
}

// ─── Step indicator ──────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = [{ n: 1, label: "Submit" }, { n: 2, label: "Sensitive features" }];
  return (
    <div className="flex items-center gap-3 mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                backgroundColor: step >= s.n ? "rgba(74,127,255,0.15)" : "rgba(21,27,44,1)",
                borderColor: step >= s.n ? "#4A7FFF" : "#232937",
                color: step >= s.n ? "#4A7FFF" : "#5C6478",
              }}
              className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold"
            >
              {step > s.n ? <Check size={12} /> : s.n}
            </motion.div>
            <span className={`text-xs font-medium ${step >= s.n ? "text-ink-primary" : "text-ink-muted"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && <div className="w-8 h-px bg-base-border" />}
        </div>
      ))}
    </div>
  );
}

// ─── Animated progress for long analysis ─────────────────────────
const ANALYSIS_STAGES = [
  { icon: Microscope, label: "Loading model & dataset…", color: "text-accent-blue" },
  { icon: Microscope, label: "Gathering SHAP evidence…", color: "text-accent-purple" },
  { icon: Gavel,      label: "Writing the verdict…",    color: "text-accent-amber" },
];

function AnalysisLoader({ stageIndex }) {
  const stage = ANALYSIS_STAGES[Math.min(stageIndex, ANALYSIS_STAGES.length - 1)];
  const Icon = stage.icon;
  const progress = Math.round(((stageIndex + 1) / ANALYSIS_STAGES.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 bg-base-700 border border-base-border rounded-card p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-base-600 ${stage.color}`}>
          <Icon size={16} />
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={stageIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-ink-primary font-medium"
          >
            {stage.label}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-base-600 rounded-full h-1.5 overflow-hidden">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-accent-blue"
        />
      </div>
      <p className="text-xs text-ink-muted mt-2">
        This can take 30–60 seconds depending on dataset size. Please don't close the tab.
      </p>

      {/* Stage dots */}
      <div className="flex items-center gap-2 mt-4">
        {ANALYSIS_STAGES.map((s, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= stageIndex ? "bg-accent-blue w-6" : "bg-base-600 w-3"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Onboarding hint for first-time users ────────────────────────
function OnboardingHint() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 bg-accent-blue/5 border border-accent-blue/20 rounded-card p-5"
    >
      <div className="flex items-start gap-3">
        <BookOpen size={16} className="text-accent-blue flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-ink-primary mb-1">First time here?</p>
          <p className="text-xs text-ink-secondary leading-relaxed mb-3">
            FairScope needs a trained <span className="font-mono text-ink-primary">.pkl</span> or{" "}
            <span className="font-mono text-ink-primary">.joblib</span> scikit-learn model and the CSV
            dataset it was trained on. Don't have one yet? Download our sample to try it out instantly.
          </p>
          <a
            href="https://raw.githubusercontent.com/scikit-learn/scikit-learn/main/sklearn/datasets/data/iris.csv"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
          >
            <Download size={12} />
            Download sample dataset (Iris CSV)
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────
export default function NewAuditPage() {
  const [step, setStep] = useState(1);
  const [modelFile, setModelFile] = useState(null);
  const [datasetFile, setDatasetFile] = useState(null);
  const [targetColumn, setTargetColumn] = useState("");
  const [featureNames, setFeatureNames] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [auditId, setAuditId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(-1); // -1 = not running

  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleUploadSubmit(e) {
    e.preventDefault();
    setError("");
    if (!modelFile || !datasetFile || !targetColumn.trim()) {
      setError("Model file, dataset file, and target column are all required.");
      return;
    }
    setLoading(true);
    setAnalysisStage(0);
    try {
      const result = await uploadModel({
        modelFile, datasetFile,
        targetColumn: targetColumn.trim(),
        userId: user?.id,
      });
      setAuditId(result.audit_id);
      setFeatureNames(result.feature_names);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Check that the backend is running.");
    } finally {
      setLoading(false);
      setAnalysisStage(-1);
    }
  }

  function toggleFeature(name) {
    setSelectedFeatures((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  }

  async function handleRunAudit() {
    setError("");
    setLoading(true);
    setAnalysisStage(1);
    try {
      const analysis = await analyzeAudit(auditId, selectedFeatures);
      setAnalysisStage(2);
      const verdict = await generateVerdict(auditId);
      navigate(`/dashboard/audit/${auditId}`, { state: { analysis, verdict, targetColumn } });
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong while running the audit.");
      setLoading(false);
      setAnalysisStage(-1);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <p className="font-mono text-xs tracking-widest text-accent-blue uppercase mb-2">New audit</p>
        <h1 className="font-display font-bold text-2xl text-ink-primary mb-6">
          {step === 1 ? "Submit a model" : "Name the sensitive features"}
        </h1>

        <StepIndicator step={step} />

        {error && (
          <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/25 text-accent-red text-sm rounded-lg px-3.5 py-3 mb-6">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleUploadSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-2">
                  Trained model (.pkl / .joblib)
                </label>
                <FileDrop
                  label="scikit-learn compatible model"
                  accept=".pkl,.joblib"
                  file={modelFile}
                  onFile={setModelFile}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-2">
                  Dataset (.csv)
                </label>
                <FileDrop
                  label="CSV the model was trained on"
                  accept=".csv"
                  file={datasetFile}
                  onFile={setDatasetFile}
                />
              </div>
              <div>
                <label htmlFor="target" className="block text-xs font-medium text-ink-secondary mb-2">
                  Target column
                </label>
                <input
                  id="target"
                  type="text"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  placeholder="e.g. approved"
                  className="w-full bg-base-700 border border-base-border rounded-lg px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent-blue transition-colors outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="group flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-60 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" />Loading…</>
                ) : (
                  <>Continue <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>

              {/* Progress loader while uploading */}
              {loading && analysisStage >= 0 && <AnalysisLoader stageIndex={0} />}

              {/* First-time onboarding hint (only when nothing uploaded yet) */}
              {!loading && !modelFile && !datasetFile && <OnboardingHint />}
            </motion.form>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <p className="text-sm text-ink-secondary mb-2">
                Select features that shouldn't drive the model's decisions — FairScope will test fairness
                against each one.
              </p>
              <p className="text-xs text-ink-muted mb-5">
                This step is optional but strongly recommended.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-8">
                {featureNames.map((name) => (
                  <label
                    key={name}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                      selectedFeatures.includes(name)
                        ? "border-accent-blue/40 bg-accent-blue/5 text-ink-primary"
                        : "border-base-border text-ink-secondary hover:border-ink-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(name)}
                      onChange={() => toggleFeature(name)}
                      className="accent-accent-blue"
                    />
                    <span className="font-mono text-xs">{name}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleRunAudit}
                disabled={loading}
                className="group flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-60 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" />Running…</>
                ) : (
                  <>Run audit <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>

              {/* Animated analysis progress */}
              {loading && analysisStage >= 0 && <AnalysisLoader stageIndex={analysisStage} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
