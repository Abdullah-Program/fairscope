import { motion } from "framer-motion";
import { ArrowRight, FileSearch } from "lucide-react";
import VerdictOrb from "./VerdictOrb";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      {/* subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-10 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-accent-teal uppercase mb-6 border border-accent-teal/25 bg-accent-teal/5 px-3 py-1.5 rounded-full"
          >
            <FileSearch size={13} />
            Evidence-based model audits
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-[2.75rem] sm:text-6xl leading-[1.05] tracking-tight text-balance text-ink-primary"
          >
            Every model reaches
            <br />
            a verdict. <span className="text-accent-blue">Most teams</span>
            <br />
            never read the file.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg text-ink-secondary max-w-lg leading-relaxed"
          >
            Upload a trained model and dataset. FairScope gathers SHAP evidence,
            runs statistical fairness tests, and has an AI investigator write
            the case file — in plain English, with a verdict you can defend.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="/signup"
              className="group inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white font-medium px-5 py-3 rounded-xl shadow-glow transition-all"
            >
              Start an audit
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#evidence"
              className="inline-flex items-center gap-2 text-ink-secondary hover:text-ink-primary border border-base-border hover:border-ink-muted px-5 py-3 rounded-xl transition-colors"
            >
              See a sample case file
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-8 font-mono text-xs text-ink-muted tracking-wide"
          >
            BUILT ON SHAP · TESTED AGAINST THE EEOC 80% RULE · FREE TO RUN
          </motion.p>
        </div>

        {/* Right: 3D Verdict Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative h-[420px] lg:h-[560px]"
        >
          <VerdictOrb className="w-full h-full" />

          {/* floating evidence tag — grounds the abstract orb in the product's real language */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[18%] right-[6%] bg-base-700/80 backdrop-blur-md border border-base-border rounded-xl px-3.5 py-2.5 shadow-card"
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">
              Evidence
            </div>
            <div className="text-sm font-semibold text-ink-primary mt-0.5">
              zip_code <span className="text-accent-red">↑ 0.198</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[15%] left-[2%] bg-base-700/80 backdrop-blur-md border border-base-border rounded-xl px-3.5 py-2.5 shadow-card"
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">
              Verdict
            </div>
            <div className="text-sm font-semibold text-accent-red mt-0.5">Biased</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
