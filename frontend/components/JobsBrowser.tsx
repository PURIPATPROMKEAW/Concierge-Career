"use client";
import { useState } from "react";
import { Bookmark, Search } from "lucide-react";
import type { Job, Career } from "../lib/api-types";

export default function JobsBrowser({
  jobs,
  savedMode,
  careers,
  renderJob,
}: {
  jobs: Job[];
  savedMode: boolean;
  careers: Career[];
  renderJob: (j: Job) => React.ReactNode;
}) {
  const [filter, setFilter] = useState("Best match");
  const [search, setSearch] = useState("");
  const [career, setCareer] = useState("");
  const visible = jobs.filter(
    (j) =>
      (!career || j.career_id === career) &&
      (filter === "Best match" ||
        (filter === "Ready to apply" ? j.score >= 85 : j.score < 70)) &&
      `${j.title} ${j.company}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {savedMode
              ? "YOUR SHORTLIST · ALL CAREERS"
              : "OPPORTUNITIES, PERSONALIZED"}
          </span>
          <h1>
            {savedMode
              ? "Keep your next steps close."
              : "Find your kind of opportunity."}
          </h1>
          <p>
            {visible.length} of {jobs.length} fictional positions. Scores
            reflect your current profile.
          </p>
        </div>
      </div>
      <div className="jobs-toolbar">
        <div className="filter-tabs">
          {["Best match", "Ready to apply", "Prepare first"].map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        {savedMode && (
          <select
            className="career-filter"
            aria-label="Filter saved jobs by career"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
          >
            <option value="">All careers</option>
            {careers
              .filter((c) => jobs.some((j) => j.career_id === c.id))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        )}
        <label className="search-box">
          <Search size={16} />
          <input
            aria-label="Search jobs"
            placeholder="Search roles or companies"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="job-list">{visible.map((j) => renderJob(j))}</div>
      {!visible.length && (
        <div className="empty-state">
          <Bookmark size={30} />
          <h2>
            {savedMode && !jobs.length
              ? "Your shortlist starts here."
              : "No opportunities match this filter."}
          </h2>
          <p>
            {savedMode && !jobs.length
              ? "Save a position from its match analysis to find it here across all careers."
              : savedMode
                ? "Your saved positions are still here. Try another filter or clear your search."
                : "Try another filter or clear your search to see more positions."}
          </p>
          {jobs.length > 0 && (
            <button
              className="button secondary"
              onClick={() => {
                setFilter("Best match");
                setSearch("");
                setCareer("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </>
  );
}
