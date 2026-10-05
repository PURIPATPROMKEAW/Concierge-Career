"use client";
import { useEffect, useState } from "react";
import { getOverview, type Overview } from "@/services/career";
export function Dashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    let active = true;
    getOverview()
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  if (error)
    return (
      <div role="alert" className="panel">
        <h1>Let’s reconnect.</h1>
        <p>{error}</p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  if (!data) return <p role="status">Bringing your next step into focus…</p>;
  return (
    <>
      <div className="workspace-title">
        <p className="eyebrow">YOUR PERSONAL CAREER SPACE</p>
        <h1>
          Hello, {data.name}.<br />
          <em>Let’s move you forward.</em>
        </h1>
        <p className="muted">Here’s what matters most today.</p>
      </div>
      <div className="workspace-grid">
        <section className="panel focus-panel">
          <p className="eyebrow">✦ &nbsp; YOUR NEXT BEST ACTION</p>
          <h2>{data.next_action.title}</h2>
          <p>{data.next_action.reason}</p>
          <button
            className="button primary"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Close starter plan" : "Explore starter plan"}{" "}
            <span aria-hidden>↗</span>
          </button>
          {expanded && (
            <div className="starter-plan">
              <h3>A small start. A meaningful step.</h3>
              <ol>
                <li>Learn components, props, and state.</li>
                <li>Build a searchable portfolio project list.</li>
                <li>Write a short reflection on what you learned.</li>
              </ol>
              <p className="caption">
                Sample plan · Progress tracking arrives in the full prototype.
              </p>
            </div>
          )}
        </section>
        <aside className="panel">
          <p className="eyebrow">YOUR NORTH STAR</p>
          <h3>{data.goal}</h3>
          <div
            className="orbit"
            aria-label={`${data.match.score}% sample role skill coverage`}
          >
            <span>
              {data.match.score}
              <small>%</small>
            </span>
          </div>
          <p className="caption">Sample role skill coverage</p>
          <p className="muted small">{data.match.explanation}</p>
        </aside>
      </div>
      <section className="panel skills-panel">
        <div>
          <p className="eyebrow">A FOUNDATION TO BUILD ON</p>
          <h3>Your current strengths</h3>
        </div>
        <div className="chips">
          {data.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>
      <p className="caption">
        {data.mode === "demo"
          ? "Demo mode · Fictional profile and sample requirements · No live job market or LLM connected."
          : "Database mode · Seed profile and sample requirements · Mock AI provider."}
      </p>
    </>
  );
}
