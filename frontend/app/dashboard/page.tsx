import Link from "next/link";
import { Brand } from "@/components/brand";
import { Dashboard } from "@/features/dashboard/dashboard";
export default function DashboardPage() {
  return (
    <div className="workspace">
      <header className="topbar">
        <Brand />
        <Link className="pill" href="/">
          Back to home ↗
        </Link>
      </header>
      <div className="workspace-layout">
        <aside className="sidebar">
          <p className="eyebrow">WORKSPACE</p>
          <Link className="active" href="/dashboard" aria-current="page">
            ◈ &nbsp; Overview
          </Link>
          <p className="caption">COMING NEXT</p>
          <span>My career</span>
          <span>Job matches</span>
          <span>Skill gaps</span>
          <span>Roadmap</span>
          <span>Concierge</span>
          <div className="sidebar-note">
            A clearer path,
            <br />
            <em>built around you.</em>
          </div>
        </aside>
        <main id="main" className="workspace-main">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
