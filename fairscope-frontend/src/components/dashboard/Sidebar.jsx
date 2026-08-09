import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Scale, FilePlus2, History, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  const navItems = [
    { path: "/dashboard/new", label: "New Audit", icon: FilePlus2 },
    { path: "/dashboard/history", label: "History", icon: History },
  ];

  const NavContent = () => (
    <>
      <div className="px-5 py-5 border-b border-base-border">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="w-7 h-7 rounded-lg bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center">
            <Scale size={14} className="text-accent-blue" strokeWidth={2.25} />
          </div>
          <span className="font-display font-semibold text-sm text-ink-primary">FairScope</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(item.path)
                ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                : "text-ink-secondary hover:text-ink-primary hover:bg-base-700"
            }`}
          >
            <item.icon size={16} strokeWidth={1.8} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-base-border">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-ink-muted truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-secondary hover:text-accent-red hover:bg-accent-red/5 transition-colors"
        >
          <LogOut size={16} strokeWidth={1.8} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 h-screen bg-base-900 border-r border-base-border flex-col fixed left-0 top-0 z-40">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-base-900 border-b border-base-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center">
            <Scale size={14} className="text-accent-blue" strokeWidth={2.25} />
          </div>
          <span className="font-display font-semibold text-sm text-ink-primary">FairScope</span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-ink-secondary hover:text-ink-primary transition-colors p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 z-50 bg-base-900 border-r border-base-border flex flex-col"
            >
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
