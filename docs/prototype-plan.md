# Full prototype implementation plan

## North star
An AI that understands who you are, knows where you want to go, and continuously guides what to learn, which jobs to consider, and what to do next. Audience: students and fresh graduates. Default product language: English.

## Delivery sequence and acceptance criteria
1. **Onboarding + resume simulation:** select a career goal/timeline, use a sample resume, show staged analysis, confirm extracted skills. Clearly identify simulated extraction; never pretend to parse a real upload.
2. **Career profile:** editable skills, strengths, experience, projects and goal; persist changes through repositories; recompute suggestions from this state.
3. **Concierge dashboard:** one dominant next best action with rationale, current goal, readiness definition and provenance. Avoid invented live-market statistics.
4. **Jobs + matching:** seeded fictional roles, search/filter/save, match detail, matched/missing skills, Apply Now vs Prepare First. Explain weights if extending the current skill coverage metric. Simulated application actions must be labeled.
5. **Skill gaps + learning:** prioritized gaps tied to target requirements and learning resources; explain why each gap matters.
6. **Roadmap + progress:** milestones and tasks with completion state; completing a learning action updates profile, progress and recommendations consistently, including after reload.
7. **Concierge chat:** contextual mock responses and action cards that lead to real in-app actions; preserve conversation and relevant career memory. Clearly label mock AI.
8. **Adaptive/proactive demo:** completing a milestone triggers a visible revised plan or sample opportunity alert, with explanation and before/after state. Calendar and external application integrations remain explicit simulations.

## Planned API surface
Version all routes under `/api/v1`. Only `GET /overview` and `/health` exist now.
- GET/PATCH /users/{id}/career-profile
- POST /resume/analyze
- GET /jobs and /jobs/{id}/match
- GET /users/{id}/skill-gaps
- GET /users/{id}/roadmap; PATCH /roadmap/tasks/{id}
- POST /concierge/chat and /concierge/recommend
- GET /users/{id}/progress

## Demo narrative
Set frontend internship goal → review sample resume → understand career profile → identify React gap → compare sample roles → start roadmap → complete task → see progress and replan → ask concierge for the next action.

## Completion bar
Coherent shared state across screens, meaningful loading/empty/error states, responsive mobile and desktop layouts, keyboard navigation, visible focus, reduced-motion support, explainable mock data, and no dead buttons. Cover core journey and state propagation with integration tests; validate layouts in a browser. Document real vs simulated behavior and known limitations.
