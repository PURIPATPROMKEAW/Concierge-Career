# Demo review fixes — 7 October 2026

Scope: the existing light CareerTech demo, English UI, 56 fictional jobs, 12 careers, 32 canonical skills, deterministic matching and explicitly labeled Mock AI. No live jobs, applications, LLM, login, or PDF parsing have been introduced.

## Review outcomes

| # | Cause and change | Verification |
|---|---|---|
| 1 | Desktop requirement rows had a 460px minimum width; grid children could enlarge their columns. Mobile detail now uses stacked requirement cards with Expected, Your profile and Alignment labels. | Data Scientist detail at 320/375/390/430px: document width does not exceed viewport; all three fields remain visible. |
| 2 | Saved jobs were filtered from the selected analysis. A protected API now returns fresh matches for all saved job IDs across careers. Added career filter, visible/total counts and separate empty/filter states. | Save Frontend, switch to Data Scientist, open original saved Frontend job at 87 without manually reselecting Frontend. API also verifies two saved careers. |
| 3 | Career/view/job context existed only in memory. Persist identifiers and view, then recompute from the current profile on restoration. Failed restoration preserves context; a missing profile clears invalid state. | Reload restores job detail and current score; original transient failure recovery test remains passing. |
| 4 | Save discarded the selected career. Save & re-analyze now calls the shared analysis/context refresh and shows before/after readiness, best match and next gap. Neutral wording also covers edits that reduce scores. | Change React Beginner → Intermediate; return directly to Frontend results with comparison. |
| 5 | Optimistic headline and zero-unlock wording were unconditional. Low alignment gets foundation guidance, nearby stronger alternative careers and a practice action. Zero unlocks explain why more than one change is needed. | Data Scientist foundation heading/panel checked; scores still come from engine. |
| 6 | Every career reused nearly the same required skills. Catalog v2 varies requirements and demand; job chips now rank actual requirements by required status, importance and target level. | Actual demand differs by skill; canonical IDs/no duplicate requirements; dataset includes ready, strong, prepare-first and critical-gap examples. |
| 7 | Demand chart showed six alphabetically ordered skills. Priority gaps now appear first, with Show all skills. | TypeScript is in the first displayed group; percentages use actual career job counts. |
| 8 | Ready-role count looked like the primary objective. Gap cards now state the weighted-deficit objective, numerical priority, target level and counterfactual ready-role gains. | Deterministic ranking tests and contextual comparison response; unlocks only break equal-priority ties. |
| 9 | Chat routed comparison questions to generic score advice. Added score, priority, comparison and readiness intents, actual values for both named gaps, a dynamic comparison prompt and honest unsupported fallback. | API checks names, numerical priority, tie explanation and unsupported question; browser checks comparison response. |
| 10 | Learning recommendations were derived only from remaining gaps. Completion is now an independent persistent history, with timestamp, simulated proficiency gain and recorded before/after scores. | Complete TypeScript, reload My learning, verify Completed; repeat API submission does not create another record or gain. |
| 11 | Learning steps were generic. Each skill now has a concrete task tied to Room Booking, portfolio work, data analysis or relevant infrastructure. | Catalog contains 32 topic-specific tasks; displayed TypeScript/Testing tasks inspected. No unverified external resource links added. |
| 12 | Career cards reused generic descriptions. Each role now explains distinct responsibilities and an example, plus up to three applicable profile skills. | All 12 curated descriptions; browser career selection and role cards inspected. A profile without relevant skills simply has no matched-skill chips. |
| 13 | Success messages stayed until dismissed. Toasts expire after 5.5 seconds and clear on navigation. | Navigation/reload has no stale success toast; manual dismissal remains available. |
| 14 | Try demo created another session and appeared to lose progress. Existing sessions use Continue demo; Start fresh demo explains reset and shares the Reset demo confirmation/handler. | Completed history survives Continue; Keep my progress cancels reset; original journey verifies confirmed reset. |
| 15 | Labels exposed system terminology; experience multi-select required modifier keys. Friendly labels and tap-friendly skill checkboxes replace those controls. | English labels, Field of study, Demo job data, native skill selector and checkbox interaction inspected; manual-profile browser test passes. |
| 16 | Reviewed badge was unconditional. Loaded demo is ready for review; only confirmation or saving marks it reviewed, and that state persists. | Browser verifies initial ready-for-review label; confirm/save handlers set reviewed. |

Connection recovery remains separate from analysis processing. Initial demo actions wait for the service; API retries and the Retry connection action remain available. Removed the artificial delay after profile creation. Simulated cold-start recovery is tested; no Render latency or Core Web Vitals measurement is claimed.

## Dataset and scoring impact

Scoring formula is unchanged: required skills 50%, preferred 15%, experience 15%, education 10%, competency 10%; absent components redistribute weights, absent critical required skills cap at 69. Readiness averages unrounded matches then rounds half up. Ready threshold remains 85.

Priority = sum of `(1 − satisfaction) × importance × required/preferred factor` divided by career job count, where importance is 1/2/3/4 and required/preferred factor is 1/0.5. Satisfied requirements contribute zero. Counterfactual unlocks raise just that skill to its unmet target; they are not predicted hiring outcomes.

Dataset version changes from `2026.10-demo-v1` to `2026.10-demo-v2`. Counts remain 56/12/32. Some fictional roles replace a frontend CSS/HTML requirement with an already-satisfied SQL requirement; other careers vary their skill sets. Frontend calibration is preserved through equal satisfaction and competency coverage. Other scores legitimately change because requirements differ.

Puripatjudhai baseline, old → new:

| Career | Readiness | Best match | Ready jobs |
|---|---:|---:|---:|
| Frontend Developer | 78 → 78 | 87 → 87 | 1 → 1 |
| Backend Developer | 50 → 50 | 56 → 56 | 0 → 0 |
| Full-stack Developer | 70 → 70 | 81 → 78 | 0 → 0 |
| Software Engineer | 43 → 43 | 50 → 46 | 0 → 0 |
| Data Analyst | 32 → 32 | 46 → 50 | 0 → 0 |
| Data Scientist | 22 → 24 | 28 → 37 | 0 → 0 |
| Data Engineer | 29 → 29 | 39 → 39 | 0 → 0 |
| AI Engineer | 14 → 15 | 16 → 18 | 0 → 0 |
| Machine Learning Engineer | 14 → 14 | 16 → 16 | 0 → 0 |
| DevOps Engineer | 31 → 25 | 38 → 38 | 0 → 0 |
| Cloud Engineer | 11 → 11 | 12 → 12 | 0 → 0 |
| Cybersecurity Analyst | 11 → 11 | 12 → 12 | 0 → 0 |

Frontend TypeScript Intermediate improvement remains readiness **78 → 85**, best match **87 → 92**, ready jobs **1 → 4**. Baseline gap priorities: TypeScript **1.8125**, Frontend Testing **1.4375**, React **0.9375**. After TypeScript, Testing ranks first despite React's larger ready-role gain: weighted deficit is the primary objective.

## Validation and deployment

- Backend: 20 passing tests, including fixture compatibility, matching, ownership, history/idempotency, saved matches, chat and migration upgrade/downgrade.
- Browser: 8 passing end-to-end tests, including original flows, API recovery and new review regressions.
- Frontend lint, TypeScript check and production build pass; OpenAPI and generated API types refreshed.
- Database migration 0004 adds nullable history fields. Preexisting completions are labeled as predating dated history rather than fabricating dates or scores.
- Migration 0005 refreshes only known fictional catalogs, backs up the prior values and supports downgrade. It preserves profiles, saved jobs and completion history; round-trip and preservation tests cover this behavior. Existing users may see recalculated scores after the catalog update.
- Local screenshot artifacts: `.tools/review-overview.png`, `.tools/review-foundations.png`, `.tools/review-completed.png`, `.tools/review-mobile-detail.png`. These generated files are excluded from Git.
- Render requires the updated **API and web services** from `feature/ai-career-concierge-demo`. API startup runs migrations. Deploy API first, then web; verify Completed and Saved jobs after both are live. Local results do not establish that Render has deployed this revision.

Remaining limitations: rule-based chat understands specified intents and canonical gap names; synthetic catalog is not labor-market evidence; learning gains are simulations; older undated history cannot be reconstructed. Render free-service sleep and database expiration are hosting constraints unchanged by these review fixes. PostgreSQL production deployment and real cold-start latency have not been verified during this local review.
