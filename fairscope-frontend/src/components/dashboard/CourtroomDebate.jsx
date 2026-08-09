import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, ShieldAlert, ShieldCheck, Gavel, Play, CheckCircle2 } from "lucide-react";

const agentConfigs = {
  Prosecutor: {
    icon: Scale,
    title: "Prosecutor AI",
    subtitle: "Bias Indictment Agent",
    border: "border-accent-red/40 hover:border-accent-red",
    shadow: "shadow-accent-red/10 hover:shadow-accent-red/20",
    badge: "bg-accent-red/10 text-accent-red border-accent-red/30",
    glow: "from-accent-red/20 via-transparent to-transparent",
    avatarBg: "bg-accent-red/20 text-accent-red",
  },
  Defense: {
    icon: ShieldCheck,
    title: "Defense AI",
    subtitle: "Model Defense Agent",
    border: "border-accent-blue/40 hover:border-accent-blue",
    shadow: "shadow-accent-blue/10 hover:shadow-accent-blue/20",
    badge: "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
    glow: "from-accent-blue/20 via-transparent to-transparent",
    avatarBg: "bg-accent-blue/20 text-accent-blue",
  },
  Judge: {
    icon: Gavel,
    title: "Judge AI",
    subtitle: "Adjudication Agent",
    border: "border-accent-amber/40 hover:border-accent-amber",
    shadow: "shadow-accent-amber/10 hover:shadow-accent-amber/20",
    badge: "bg-accent-amber/10 text-accent-amber border-accent-amber/30",
    glow: "from-accent-amber/20 via-transparent to-transparent",
    avatarBg: "bg-accent-amber/20 text-accent-amber",
  },
};

export default function CourtroomDebate({ transcript = [] }) {
  const [activeStep, setActiveStep] = useState(transcript.length);

  if (!transcript || transcript.length === 0) {
    return null;
  }

  return (
    <div className="bg-base-700/80 backdrop-blur-md border border-base-border rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-base-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
            <Gavel size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-primary text-base flex items-center gap-2">
              Multi-Agent Courtroom Hearing
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-accent-purple/10 text-accent-purple border border-accent-purple/30">
                Autonomous Agents
              </span>
            </h3>
            <p className="text-xs text-ink-muted">
              Prosecutor AI vs. Defense AI adjudicated by Chief Judge AI
            </p>
          </div>
        </div>

        {/* Step control button */}
        {activeStep < transcript.length && (
          <button
            onClick={() => setActiveStep((prev) => Math.min(transcript.length, prev + 1))}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 border border-accent-blue/30 transition-all"
          >
            <Play size={12} />
            Next Agent Speech
          </button>
        )}
      </div>

      {/* 3D Agent Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {transcript.slice(0, activeStep).map((msg, index) => {
          const config = agentConfigs[msg.agent] || agentConfigs.Judge;
          const Icon = config.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`relative overflow-hidden bg-base-800/90 backdrop-blur-lg border rounded-xl p-5 shadow-xl transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-[1.02] ${config.border} ${config.shadow}`}
            >
              {/* Top ambient glow */}
              <div
                className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${config.glow} opacity-60 blur-xl pointer-events-none`}
              />

              {/* Agent Title Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${config.avatarBg} font-bold`}>
                  <Icon size={18} />
                </div>
                <div>
                  <span className="font-display font-semibold text-ink-primary text-sm block">
                    {config.title}
                  </span>
                  <span className="text-[11px] text-ink-muted block font-mono">
                    {config.subtitle}
                  </span>
                </div>
              </div>

              {/* Speech Topic Badge */}
              <div className="mb-3">
                <span
                  className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-md border ${config.badge}`}
                >
                  {msg.title || `${msg.agent} Arguments`}
                </span>
              </div>

              {/* Speech Bubble / Argument Text */}
              <p className="text-xs text-ink-secondary leading-relaxed font-sans bg-base-900/60 p-3 rounded-lg border border-base-border/50">
                "{msg.argument}"
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
