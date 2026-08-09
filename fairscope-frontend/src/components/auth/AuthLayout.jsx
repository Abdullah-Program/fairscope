import { motion } from "framer-motion";
import { Scale, TrendingUp, AlertTriangle } from "lucide-react";

const rows = [
  { label: "zip_code", value: 82, flag: true },
  { label: "income", value: 55, flag: false },
  { label: "credit_score", value: 40, flag: false },
];

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-base-950 flex">
      {/* Left: form */}
      <div className="w-full lg:w-[46%] flex flex-col justify-center px-8 sm:px-16 py-12 relative">
        <a href="/" className="absolute top-8 left-8 sm:left-16 flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center">
            <Scale size={14} className="text-accent-blue" strokeWidth={2.25} />
          </div>
          <span className="font-display font-semibold text-sm text-ink-primary">
            FairScope
          </span>
        </a>

        <div className="max-w-sm w-full mx-auto">{children}</div>
      </div>

      {/* Right: brand panel — hidden on small screens */}
      <div className="hidden lg:flex lg:w-[54%] relative items-center justify-center bg-base-900 border-l border-base-border overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 60% 60% at 50% 45%, black 30%, transparent 100%)",
          }}
        />

        {/* ambient glow behind the card */}
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[420px] h-[420px] rounded-full bg-accent-blue/20 blur-[100px] pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-md px-10 text-center"
        >
          <h2 className="font-display font-bold text-2xl text-ink-primary mb-3 text-balance">
            Know what your model actually weighs.
          </h2>
          <p className="text-sm text-ink-secondary mb-10">
            Every audit becomes a case file — evidence, verdict, and the
            numbers to defend it.
          </p>

          {/* floating card — gentle continuous drift */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.2 },
              scale: { duration: 0.6, delay: 0.2 },
              y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
            }}
            className="bg-base-700/90 backdrop-blur-sm border border-base-border rounded-card p-5 text-left shadow-card relative"
            style={{
              boxShadow:
                "0 8px 40px -12px rgba(74, 127, 255, 0.25), 0 4px 24px -4px rgba(0,0,0,0.4)",
            }}
          >
            {/* top accent line */}
            <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" />

            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">
                Case file #D36A33E7
              </span>
              <motion.span
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(239,68,68,0)",
                    "0 0 12px rgba(239,68,68,0.35)",
                    "0 0 0px rgba(239,68,68,0)",
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="text-[10px] font-semibold bg-accent-red/10 text-accent-red px-2 py-0.5 rounded-full border border-accent-red/25"
              >
                Biased
              </motion.span>
            </div>

            <div className="space-y-3">
              {rows.map((row, i) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-xs text-ink-secondary w-[76px] text-left font-mono flex items-center gap-1">
                    {row.label}
                    {row.flag && (
                      <AlertTriangle size={10} className="text-accent-red" strokeWidth={2.5} />
                    )}
                  </span>
                  <div className="flex-1 h-1.5 bg-base-600 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${row.value}%` }}
                      transition={{ duration: 1, delay: 0.6 + i * 0.15, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        row.flag ? "bg-accent-red" : "bg-accent-blue"
                      }`}
                    />
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 + i * 0.15 }}
                    className="text-[10px] font-mono text-ink-muted w-7 text-right"
                  >
                    {row.value}%
                  </motion.span>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="flex items-center gap-1.5 mt-4 pt-4 border-t border-base-border text-xs text-ink-muted"
            >
              <TrendingUp size={12} />
              Disparate impact ratio: 0.67 · fails 0.80 threshold
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
