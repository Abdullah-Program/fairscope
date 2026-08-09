import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-base-950">
      <Sidebar />
      {/* Desktop: offset by sidebar width. Mobile: offset by top bar height (56px). */}
      <main className="md:ml-60 min-h-screen pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
