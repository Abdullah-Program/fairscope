import { useState, useEffect } from "react";
import { Scale, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Sample case file", href: "#evidence" },
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-4 transition-all duration-300 ${
          scrolled
            ? "bg-base-950/80 backdrop-blur-md border-b border-base-border/50"
            : ""
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center group-hover:bg-accent-blue/25 transition-colors">
              <Scale size={16} className="text-accent-blue" strokeWidth={2.25} />
            </div>
            <span className="font-display font-semibold text-[15px] tracking-tight text-ink-primary">
              FairScope
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-ink-secondary">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-ink-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-ink-secondary hover:text-ink-primary transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium bg-ink-primary text-base-950 hover:bg-white transition-colors px-4 py-2 rounded-lg"
            >
              Start an audit →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden text-ink-secondary hover:text-ink-primary transition-colors p-1"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[60px] left-0 right-0 z-40 bg-base-900 border-b border-base-border px-6 py-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-sm text-ink-secondary hover:text-ink-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-base-border my-2" />
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-sm text-ink-secondary hover:text-ink-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-sm font-medium text-accent-blue hover:text-accent-blue/80 transition-colors"
              >
                Start an audit →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
