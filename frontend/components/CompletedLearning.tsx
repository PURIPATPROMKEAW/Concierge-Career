import { CheckCircle2 } from "lucide-react";
import type { Resource } from "../lib/api-types";
const levels = ["Not yet added", "Beginner", "Intermediate", "Advanced"];
export default function CompletedLearning({
  resources,
}: {
  resources: Resource[];
}) {
  const completed = resources.filter((r) => r.completed);
  return (
    <section className="completed-learning">
      <div className="section-title">
        <h2>
          <CheckCircle2 size={19} />
          Completed ({completed.length})
        </h2>
      </div>
      {!completed.length && (
        <p className="muted">
          Completed demo activities will appear here with their recorded
          results.
        </p>
      )}
      <div className="learning-grid">
        {completed.map((r) => (
          <article className="panel learning-card" key={r.id}>
            <span className="status green">COMPLETED · SIMULATED</span>
            <h2>{r.title}</h2>
            <p>
              {r.completed_at
                ? new Date(r.completed_at).toLocaleString("en-GB")
                : "Completed before dated history was available."}
            </p>
            {r.summary && (
              <div className="completion-summary">
                <p>
                  Simulated skill gain:{" "}
                  {levels[Number(r.summary.previous_level)]} →{" "}
                  {levels[Number(r.summary.outcome_level)]}
                </p>
                <p>
                  {String(r.summary.career_name)} readiness:{" "}
                  <strong>
                    {String(r.summary.before_readiness)} →{" "}
                    {String(r.summary.after_readiness)}
                  </strong>
                </p>
                <p>
                  Best match: {String(r.summary.before_best)} →{" "}
                  {String(r.summary.after_best)}
                </p>
                <small>
                  Recorded at completion time. Current results may differ after
                  later profile changes.
                </small>
              </div>
            )}
            <p>{r.description}</p>
            <button className="button secondary full" disabled>
              <CheckCircle2 size={16} />
              Completed
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
