import { motion } from "framer-motion";
import { ArrowRight, Scale } from "lucide-react";

export default function FooterCTA() {
  return (
    <section className="relative py-32 px-6 md:px-10 border-t border-base-border">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display font-bold text-3xl sm:text-4xl text-ink-primary tracking-tight mb-5 text-balance"
        >
          Open the case on your own model.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-ink-secondary mb-9"
        >
          Free to run. No credit card, no proprietary lock-in — bring any
          scikit-learn model and a CSV.
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          href="/signup"
          className="group inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white font-medium px-6 py-3.5 rounded-xl shadow-glow transition-all"
        >
          Start an audit
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </motion.a>
      </div>

      <footer className="mt-32 border-t border-base-border bg-base-900/60">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Scale size={16} className="text-accent-blue" />
              <span className="font-display font-semibold text-sm text-ink-primary">
                FairScope
              </span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed max-w-[200px]">
              Evidence-based fairness audits for machine learning models.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-ink-secondary">
              <li><a href="#how-it-works" className="hover:text-ink-primary transition-colors">How it works</a></li>
              <li><a href="#evidence" className="hover:text-ink-primary transition-colors">Sample case file</a></li>
              <li><a href="/signup" className="hover:text-ink-primary transition-colors">Start an audit</a></li>
              <li><a href="#" className="hover:text-ink-primary transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm text-ink-secondary">
              <li><a href="#" className="hover:text-ink-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-ink-primary transition-colors">API reference</a></li>
              <li><a href="#" className="hover:text-ink-primary transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-ink-primary transition-colors">Fairness metrics guide</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-ink-secondary">
              <li><a href="#" className="hover:text-ink-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-ink-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-ink-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-ink-secondary">
              <li><a href="#" className="hover:text-ink-primary transition-colors">Privacy notice</a></li>
              <li><a href="#" className="hover:text-ink-primary transition-colors">Terms of use</a></li>
              <li><a href="#" className="hover:text-ink-primary transition-colors">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-base-border">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">
              © 2026 FairScope. Built with SHAP, scikit-learn, and Groq.
            </p>
            <p className="text-xs text-ink-muted">Not legal advice.</p>
          </div>
        </div>
      </footer>
    </section>
  );
}
