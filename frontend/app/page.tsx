"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Compass,
  Sparkles,
  LayoutDashboard,
  UserRound,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  BookOpen,
  Bookmark,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCheck,
  Code2,
  Database,
  BrainCircuit,
  Cloud,
  ShieldCheck,
  MapPin,
  Clock3,
  Plus,
  X,
  Menu,
  Send,
  RefreshCw,
  GraduationCap,
  FolderGit2,
  Target,
  Loader2,
  CheckCircle2,
  TriangleAlert,
  Search,
} from "lucide-react";
import type {
  Profile,
  Skill,
  Career,
  Analysis,
  Job,
  Resource,
  Alternative,
  ProgressResult,
} from "../lib/api-types";
import { api } from "../lib/api";
import ProfileEditor, { emptyProfile } from "../components/ProfileEditor";

type View =
  | "landing"
  | "edit"
  | "profile"
  | "careers"
  | "overview"
  | "jobs"
  | "detail"
  | "gaps"
  | "learning"
  | "alternatives"
  | "saved";
const levels = ["Not yet added", "Beginner", "Intermediate", "Advanced"];
const nav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "My profile", icon: UserRound },
  { id: "careers", label: "Career analysis", icon: ChartNoAxesCombined },
  { id: "jobs", label: "Discover jobs", icon: BriefcaseBusiness },
  { id: "gaps", label: "Skill gaps", icon: Target },
  { id: "learning", label: "My learning", icon: BookOpen },
  { id: "saved", label: "Saved jobs", icon: Bookmark },
] as const;
const groupIcon = (group: string) =>
  group === "Data"
    ? Database
    : group === "Artificial Intelligence"
      ? BrainCircuit
      : group === "Infrastructure"
        ? Cloud
        : group === "Cybersecurity"
          ? ShieldCheck
          : Code2;
const pill = (status: string) =>
  status === "READY TO APPLY"
    ? "green"
    : status === "STRONG MATCH"
      ? "blue"
      : "amber";
function Brand() {
  return (
    <span className="brand">
      <span className="brand-symbol">
        <Compass size={23} />
      </span>
      <span>
        concierge<span className="brand-light">career</span>
        <i />
      </span>
    </span>
  );
}
function ScoreRing({
  score,
  small = false,
}: {
  score: number;
  small?: boolean;
}) {
  return (
    <div
      className={"score-ring " + (small ? "small-ring" : "")}
      style={{ "--score": score } as React.CSSProperties}
    >
      <div>
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
    </div>
  );
}
function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<Profile>(emptyProfile);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [careerId, setCareerId] = useState("frontend");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [health, setHealth] = useState("Connecting");
  const [filter, setFilter] = useState("Best match");
  const [search, setSearch] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [progress, setProgress] = useState<ProgressResult | null>(null);
  const [application, setApplication] = useState(false);
  const skillName = (id: string) => skills.find((s) => s.id === id)?.name || id;
  const go = (next: View) => {
    if (!profile && !["landing", "edit"].includes(next)) next = "edit";
    if (
      !analysis &&
      [
        "overview",
        "jobs",
        "detail",
        "gaps",
        "learning",
        "alternatives",
        "saved",
      ].includes(next)
    )
      next = "careers";
    setView(next);
    setMobileMenu(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  async function initialize() {
    try {
      const [s, c, h] = await Promise.all([
        api<Skill[]>("/skills"),
        api<Career[]>("/careers"),
        api<{ database: string }>("/health"),
      ]);
      setSkills(s);
      setCareers(c);
      setHealth(h.database);
      const id = localStorage.getItem("concierge-profile");
      if (id) {
        try {
          const p = await api<Profile>("/profile/" + id);
          setProfile(p);
          setDraft(p);
        } catch {
          localStorage.removeItem("concierge-profile");
        }
      }
    } catch (e) {
      setHealth("Offline");
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void initialize();
  }, []);
  useEffect(() => {
    if (!processing) return;
    setProcessingStep(0);
    const t = setInterval(
      () => setProcessingStep((n) => Math.min(n + 1, 3)),
      260,
    );
    return () => clearInterval(t);
  }, [processing]);
  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(true);
    setError("");
    try {
      return await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function showProfile(p: Profile) {
    setProfile(p);
    setDraft(p);
    localStorage.setItem("concierge-profile", p.id!);
    setAnalysis(null);
    setSaved([]);
    setProgress(null);
    await new Promise((r) => setTimeout(r, 1050));
    setView("profile");
  }
  async function demo() {
    setProcessing("profile");
    await run(async () =>
      showProfile(await api<Profile>("/demo/profile", "POST")),
    );
    setProcessing("");
  }
  async function saveProfile(p: Profile) {
    setProcessing("profile");
    await run(async () =>
      showProfile(
        await api<Profile>(
          p.id ? "/profile/" + p.id : "/profile",
          p.id ? "PUT" : "POST",
          p,
        ),
      ),
    );
    setProcessing("");
  }
  async function loadAnalysis(id: string) {
    if (!profile?.id) return;
    setCareerId(id);
    setProcessing("analysis");
    await run(async () => {
      const a = await api<Analysis>("/analysis/career", "POST", {
        user_id: profile.id,
        career_id: id,
      });
      setAnalysis(a);
      setSelectedJob(null);
      setProgress(null);
      const [r, alt, s] = await Promise.all([
        api<Resource[]>(
          `/learning-recommendations?user_id=${profile.id}&career_id=${id}`,
        ),
        api<Alternative[]>(
          `/users/${profile.id}/alternative-careers?career_id=${id}`,
        ),
        api<string[]>(`/users/${profile.id}/saved-jobs`),
      ]);
      setResources(r);
      setAlternatives(alt);
      setSaved(s);
      await new Promise((r) => setTimeout(r, 1000));
      setView("overview");
    });
    setProcessing("");
  }
  async function complete(resource: Resource) {
    if (!profile?.id) return;
    setProcessing("progress");
    await run(async () => {
      const result = await api<ProgressResult>("/progress/complete", "POST", {
        user_id: profile.id,
        career_id: careerId,
        resource_id: resource.id,
      });
      setProgress(result);
      setProfile(result.profile);
      setDraft(result.profile);
      setAnalysis(result.after);
      setResources(
        await api<Resource[]>(
          `/learning-recommendations?user_id=${profile.id}&career_id=${careerId}`,
        ),
      );
      setAlternatives(
        await api<Alternative[]>(
          `/users/${profile.id}/alternative-careers?career_id=${careerId}`,
        ),
      );
      await new Promise((r) => setTimeout(r, 950));
      setView("overview");
    });
    setProcessing("");
  }
  async function toggleSave(job: Job) {
    await run(async () =>
      setSaved(
        await api<string[]>(
          `/users/${profile!.id}/saved-jobs/${job.id}`,
          saved.includes(job.id) ? "DELETE" : "PUT",
        ),
      ),
    );
  }
  async function ask(text = message) {
    if (!text.trim() || !profile?.id) return;
    setChatBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await api<{ answer: string }>("/concierge/chat", "POST", {
        user_id: profile.id,
        career_id: careerId,
        message: text,
        job_id: view === "detail" ? selectedJob?.id : undefined,
      });
      setAnswer(data.answer);
    } catch (e) {
      setAnswer((e as Error).message);
    } finally {
      setChatBusy(false);
    }
  }
  function jobCard(job: Job, compact = false) {
    return (
      <article
        className={"job-card " + (compact ? "compact" : "")}
        key={job.id}
      >
        <div className="job-card-main">
          <div className={"company-avatar company-" + (job.company.length % 4)}>
            {job.company.slice(0, 1)}
            <span>↗</span>
          </div>
          <div className="job-ident">
            <div className="company-name">
              {job.company}
              <span className="demo-label">DEMO</span>
            </div>
            <h3>
              <button
                onClick={() => {
                  setSelectedJob(job);
                  go("detail");
                }}
              >
                {job.title}
              </button>
            </h3>
            <p>
              <MapPin size={12} />
              {job.location}
              <span>·</span>
              {job.employment_type}
            </p>
          </div>
          <div className="job-score">
            <strong>
              {job.score}
              <small>/100</small>
            </strong>
            <span className={"status " + pill(job.recommendation)}>
              {job.recommendation}
            </span>
          </div>
        </div>
        <div className="job-card-bottom">
          <div className="tags">
            {job.matched_skills.slice(0, 3).map((s) => (
              <span className="tag matched" key={s}>
                <Check size={11} />
                {s}
              </span>
            ))}
            {(job.missing_skills[0] || job.partial_skills[0]) && (
              <span className="tag gap">
                Gap: {job.missing_skills[0] || job.partial_skills[0]}
              </span>
            )}
          </div>
          <button
            className="text-button"
            onClick={() => {
              setSelectedJob(job);
              go("detail");
            }}
          >
            View match
            <ArrowUpRight size={15} />
          </button>
        </div>
      </article>
    );
  }

  return (
    <div className={view === "landing" ? "landing" : "app-shell"}>
      {view === "landing" ? (
        <>
          <header className="landing-nav">
            <button className="brand-button" onClick={() => go("landing")}>
              <Brand />
            </button>
            <nav>
              <a href="#how-it-works">How it works</a>
              <a href="#built-for-you">Built for you</a>
              <span className="beta-pill">COMPETITION DEMO</span>
            </nav>
            <button
              className="button secondary"
              onClick={() => {
                setDraft(profile || emptyProfile);
                go(profile ? "profile" : "edit");
              }}
            >
              {profile ? "My profile" : "Get started"}
              <ArrowUpRight size={15} />
            </button>
          </header>
          <main>
            <section className="hero">
              <div className="hero-copy">
                <div className="hero-eyebrow">
                  <span className="live-dot" />
                  YOUR NEXT CHAPTER, WITH CLARITY
                </div>
                <h1>
                  Find where
                  <br />
                  your skills
                  <br />
                  <span>can take you.</span>
                </h1>
                <p>
                  Your potential deserves more than a guess. Understand where
                  you fit, discover the gaps, and take your next step with
                  confidence.
                </p>
                <div className="button-row">
                  <button
                    className="button primary large"
                    onClick={() => {
                      setDraft(emptyProfile);
                      go("edit");
                    }}
                  >
                    Build my career profile
                    <ArrowRight size={18} />
                  </button>
                  <button
                    className="button ghost large"
                    onClick={demo}
                    disabled={busy}
                  >
                    Try demo profile
                    <ArrowUpRight size={17} />
                  </button>
                </div>
                <div className="hero-proof">
                  <span>
                    <CheckCircle2 size={14} />
                    No login needed
                  </span>
                  <span>
                    <CheckCircle2 size={14} />
                    Explainable results
                  </span>
                  <span>
                    <CheckCircle2 size={14} />
                    Made for your first step
                  </span>
                </div>
              </div>
              <div
                className="hero-visual"
                aria-label="Illustrative career analysis preview"
              >
                <div className="orbital orbit-one" />
                <div className="orbital orbit-two" />
                <div className="floating-skill skill-js">JS</div>
                <div className="floating-skill skill-code">
                  <Code2 size={22} />
                </div>
                <div className="floating-skill skill-git">
                  <FolderGit2 size={21} />
                </div>
                <div className="hero-analysis">
                  <div className="preview-top">
                    <span>
                      <Sparkles size={14} />
                      YOUR CAREER, DECODED
                    </span>
                    <span className="preview-dots">•••</span>
                  </div>
                  <div className="preview-person">
                    <div className="avatar">A</div>
                    <div>
                      <strong>Alex’s next chapter</strong>
                      <p>Computer Engineering Student</p>
                    </div>
                    <span className="check-bubble">
                      <Check size={14} />
                    </span>
                  </div>
                  <div className="preview-match">
                    <span className="eyebrow">YOUR STRONGEST OPPORTUNITY</span>
                    <h3>Frontend Developer</h3>
                    <div className="preview-score">
                      <strong>
                        87<small>/100</small>
                      </strong>
                      <span className="status green">READY TO APPLY</span>
                    </div>
                    <div className="bar">
                      <i style={{ width: "87%" }} />
                    </div>
                    <p>Built on your JavaScript, Next.js & Git skills.</p>
                  </div>
                  <div className="preview-gap">
                    <div className="icon-tile">
                      <Target size={18} />
                    </div>
                    <div>
                      <strong>One skill. More possibilities.</strong>
                      <p>TypeScript is your next best step.</p>
                    </div>
                    <ArrowUpRight size={16} />
                  </div>
                  <div className="preview-foot">
                    <span className="live-dot" />
                    ILLUSTRATIVE DEMO · NOT HIRING PROBABILITY
                  </div>
                </div>
                <div className="floating-insight">
                  <span>
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <strong>A clearer path forward.</strong>
                    <p>Built around who you are.</p>
                  </div>
                </div>
              </div>
            </section>
            <section className="landing-strip">
              <span>YOUR BACKGROUND</span>
              <ArrowRight />
              <span>REAL REQUIREMENT STRUCTURES</span>
              <ArrowRight />
              <span>A MORE INFORMED NEXT STEP</span>
            </section>
            <section id="how-it-works" className="how-section">
              <div>
                <span className="eyebrow">LESS GUESSWORK. MORE DIRECTION.</span>
                <h2>Your career starts with you.</h2>
                <p>
                  Not another job board. A better way to understand your
                  possibilities.
                </p>
              </div>
              <div className="how-grid">
                {[
                  {
                    n: "01",
                    icon: UserRound,
                    title: "Tell your story",
                    body: "Bring your skills, projects, and experience together in one clear career profile.",
                  },
                  {
                    n: "02",
                    icon: Compass,
                    title: "Find your fit",
                    body: "Choose a career, then see how your profile aligns with structured job requirements.",
                  },
                  {
                    n: "03",
                    icon: ChartNoAxesCombined,
                    title: "Move forward",
                    body: "Focus on the skills that matter. Update your profile and see your opportunities change.",
                  },
                ].map((c) => (
                  <div key={c.n}>
                    <div className="how-top">
                      <c.icon size={22} />
                      <span>{c.n}</span>
                    </div>
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                  </div>
                ))}
              </div>
            </section>
            <section id="built-for-you" className="landing-bottom">
              <div>
                <span className="eyebrow">BUILT FOR YOUR FIRST BIG MOVE</span>
                <h2>
                  You have potential.
                  <br />
                  Let’s give it direction.
                </h2>
              </div>
              <div>
                <p>
                  For students and fresh graduates exploring technology careers.
                  Start with what you know. Discover what comes next.
                </p>
                <button
                  className="button primary"
                  onClick={demo}
                  disabled={busy}
                >
                  Meet Alex. Try the demo
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          </main>
          <footer className="landing-footer">
            <Brand />
            <span>
              56 fictional opportunities. 12 career paths. Your next chapter.
            </span>
            <span>© 2026 Concierge-Career</span>
          </footer>
        </>
      ) : (
        <>
          <aside className={"sidebar " + (mobileMenu ? "open" : "")}>
            <button className="brand-button" onClick={() => go("landing")}>
              <Brand />
            </button>
            <div className="workspace-label">YOUR WORKSPACE</div>
            <nav>
              {nav.map((n) => (
                <button
                  key={n.id}
                  className={
                    view === n.id ||
                    (view === "detail" && n.id === "jobs") ||
                    (view === "edit" && n.id === "profile")
                      ? "active"
                      : ""
                  }
                  onClick={() => go(n.id)}
                >
                  <n.icon size={18} />
                  {n.label}
                  {n.id === "saved" && saved.length > 0 && (
                    <span className="nav-count">{saved.length}</span>
                  )}
                  {n.id === "gaps" && analysis && (
                    <span className="nav-count">{analysis.gaps.length}</span>
                  )}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-note">
                <div className="icon-tile">
                  <Sparkles size={18} />
                </div>
                <strong>
                  Small steps.
                  <br />
                  New possibilities.
                </strong>
                <p>Your profile grows with you.</p>
                <button
                  className="text-button"
                  onClick={() => {
                    setDraft(profile || emptyProfile);
                    go("edit");
                  }}
                >
                  Update my profile
                  <ArrowUpRight size={14} />
                </button>
              </div>
              <div className="data-status">
                <span className="live-dot" />
                {health === "Offline"
                  ? "Service offline"
                  : `${health} · demo dataset`}
              </div>
              <div className="sidebar-person">
                <div className="avatar">{profile?.name[0] || "Y"}</div>
                <div>
                  <strong>{profile?.name || "Your profile"}</strong>
                  <span>
                    {profile ? "Your career workspace" : "Let’s get started"}
                  </span>
                </div>
                <button
                  className="icon-button"
                  aria-label="Edit profile"
                  onClick={() => {
                    setDraft(profile || emptyProfile);
                    go("edit");
                  }}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </aside>
          <div className="workspace">
            <header className="topbar">
              <button
                className="icon-button mobile-toggle"
                aria-label="Toggle menu"
                onClick={() => setMobileMenu(!mobileMenu)}
              >
                <Menu />
              </button>
              <div className="breadcrumb">
                Workspace
                <ChevronRight size={13} />
                <span>
                  {view === "overview"
                    ? "Career overview"
                    : view === "detail"
                      ? "Job match analysis"
                      : view === "edit"
                        ? "Build your profile"
                        : view === "profile"
                          ? "My career profile"
                          : view === "gaps"
                            ? "Skill gaps"
                            : view === "careers"
                              ? "Choose your direction"
                              : view[0].toUpperCase() + view.slice(1)}
                </span>
              </div>
              <div className="topbar-right">
                <span className="demo-pill">
                  <span />
                  DEMO MODE
                </span>
                <button
                  className="button concierge-button"
                  onClick={() => setChatOpen(true)}
                  disabled={!profile}
                >
                  <Sparkles size={15} />
                  Ask Concierge
                </button>
                <div className="avatar small-avatar">
                  {profile?.name[0] || "Y"}
                </div>
              </div>
            </header>
            <main className="main-content">
              {view === "edit" && (
                <>
                  <Heading
                    eyebrow="FIRST, LET’S GET TO KNOW YOU"
                    title={
                      draft.id
                        ? "Your profile, your progress."
                        : "Build your career profile."
                    }
                    description="Your skills and experiences are the starting point. We’ll explore careers next."
                  />
                  <ProfileEditor
                    key={draft.id || "new"}
                    initial={draft}
                    catalog={skills}
                    onSave={saveProfile}
                    busy={busy}
                  />
                </>
              )}
              {view === "profile" && profile && (
                <>
                  <Heading
                    eyebrow="CAREER PROFILE READY"
                    title={`This is your starting point, ${profile.name}.`}
                    description="A clearer picture of your background. Review it, make it yours, then choose your direction."
                    action={
                      <button
                        className="button secondary"
                        onClick={() => {
                          setDraft(profile);
                          go("edit");
                        }}
                      >
                        Edit profile
                        <ArrowUpRight size={16} />
                      </button>
                    }
                  />
                  <section className="profile-banner panel">
                    <div className="avatar profile-avatar">
                      {profile.name[0]}
                    </div>
                    <div>
                      <h2>{profile.name}</h2>
                      <p>
                        {profile.field || "Exploring a career in technology"}{" "}
                        {profile.university && `· ${profile.university}`}
                      </p>
                      <div className="tags">
                        <span className="tag">
                          {profile.degree} · {profile.graduation_year}
                        </span>
                        <span className="tag blue">
                          Profile reviewed by you
                        </span>
                      </div>
                    </div>
                    <button
                      className="button primary"
                      onClick={() => go("careers")}
                    >
                      Choose Career Interest
                      <ArrowRight size={17} />
                    </button>
                  </section>
                  <div className="stats-grid profile-stats">
                    {[
                      [profile.skills.length, "Skills identified"],
                      [profile.projects.length, "Projects added"],
                      [profile.experiences.length, "Experiences"],
                      [
                        new Set(
                          profile.skills
                            .map(
                              (s) =>
                                skills.find((c) => c.id === s.skill_id)
                                  ?.competency,
                            )
                            .filter(Boolean),
                        ).size,
                        "Competency groups",
                      ],
                    ].map(([n, t]) => (
                      <div className="panel" key={t}>
                        <strong>{n}</strong>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="two-col">
                    <section className="panel">
                      <div className="section-title">
                        <h2>Technical skills</h2>
                        <Code2 size={19} />
                      </div>
                      {profile.skills.length ? (
                        profile.skills.map((s) => (
                          <div className="profile-skill" key={s.skill_id}>
                            <span>{skillName(s.skill_id)}</span>
                            <div className="level-dots">
                              {[1, 2, 3].map((n) => (
                                <i
                                  key={n}
                                  className={n <= s.proficiency ? "on" : ""}
                                />
                              ))}
                            </div>
                            <small>{levels[s.proficiency]}</small>
                          </div>
                        ))
                      ) : (
                        <p className="muted">
                          No skills added yet. Edit your profile to add them.
                        </p>
                      )}
                      <div className="competency-list">
                        {[
                          ...new Set(
                            profile.skills
                              .map(
                                (s) =>
                                  skills.find((c) => c.id === s.skill_id)
                                    ?.competency,
                              )
                              .filter(Boolean),
                          ),
                        ].map((g) => (
                          <span className="tag" key={g}>
                            {g}
                          </span>
                        ))}
                      </div>
                    </section>
                    <section className="panel">
                      <div className="section-title">
                        <h2>Education & experience</h2>
                        <GraduationCap size={20} />
                      </div>
                      {profile.education.map((e, i) => (
                        <div className="timeline-item" key={i}>
                          <GraduationCap size={17} />
                          <div>
                            <h3>
                              {e.degree} · {e.field}
                            </h3>
                            <p>{e.institution}</p>
                            <small>
                              {e.start_year} — {e.end_year}{" "}
                              {e.enrolled ? "· In progress" : ""}
                            </small>
                          </div>
                        </div>
                      ))}
                      {profile.experiences.map((e, i) => (
                        <div className="timeline-item" key={i}>
                          <BriefcaseBusiness size={17} />
                          <div>
                            <h3>{e.role}</h3>
                            <p>
                              {e.organization} · {e.start} — {e.end}
                            </p>
                            <small>{e.description}</small>
                          </div>
                        </div>
                      ))}
                      {!profile.education.length &&
                        !profile.experiences.length && (
                          <p className="muted">
                            Add your education and experience to make the
                            comparison more complete.
                          </p>
                        )}
                    </section>
                  </div>
                  <section className="panel project-section">
                    <div className="section-title">
                      <h2>Projects & proof of progress</h2>
                      <FolderGit2 size={19} />
                    </div>
                    <div className="project-grid">
                      {profile.projects.map((p, i) => (
                        <article key={i}>
                          <span className="eyebrow">{p.project_type}</span>
                          <h3>{p.name}</h3>
                          <p>{p.description}</p>
                          <div className="tags">
                            {p.stack.map((t, j) => (
                              <span className="tag" key={j}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </article>
                      ))}
                      {!profile.projects.length && (
                        <p className="muted">No projects added yet.</p>
                      )}
                    </div>
                    {profile.certifications.length > 0 && (
                      <div className="cert-list">
                        <h3>Certifications</h3>
                        {profile.certifications.map((c, i) => (
                          <p key={i}>
                            <CheckCircle2 size={15} />
                            {c.name} · {c.issuer} · {c.year}
                          </p>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
              {view === "careers" && (
                <>
                  <Heading
                    eyebrow="NOW, CHOOSE YOUR DIRECTION"
                    title="Where would you like to go?"
                    description="You bring the background. Choose a career, and we’ll compare your profile with its opportunities."
                  />
                  <div className="inline-insight">
                    <Sparkles size={20} />
                    <p>
                      Your profile is ready. Each path below will be analyzed
                      against its own structured job requirements.
                    </p>
                    <span className="tag">12 career paths</span>
                  </div>
                  {[...new Set(careers.map((c) => c.group))].map((group) => (
                    <section className="career-group" key={group}>
                      <h2>{group}</h2>
                      <div className="career-grid">
                        {careers
                          .filter((c) => c.group === group)
                          .map((c) => {
                            const Icon = groupIcon(group);
                            return (
                              <button
                                key={c.id}
                                className="career-card"
                                disabled={busy}
                                onClick={() => loadAnalysis(c.id)}
                              >
                                <div className="career-card-top">
                                  <div className="icon-tile">
                                    <Icon size={22} />
                                  </div>
                                  <ArrowUpRight size={20} />
                                </div>
                                <h3>{c.name}</h3>
                                <p>{c.description}</p>
                                <span className="career-card-cta">
                                  Explore my alignment
                                  <ArrowRight size={14} />
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </section>
                  ))}
                </>
              )}
              {analysis &&
                [
                  "overview",
                  "jobs",
                  "detail",
                  "gaps",
                  "learning",
                  "alternatives",
                  "saved",
                ].includes(view) && (
                  <>
                    {view === "overview" && (
                      <>
                        <Heading
                          eyebrow="YOUR PROFILE × THE JOB MARKET"
                          title={`Your next chapter looks promising, ${profile?.name}.`}
                          description="A little clarity goes a long way. Here’s where you stand, and where you can go next."
                          action={
                            <button
                              className="button secondary"
                              onClick={() => go("careers")}
                            >
                              <Code2 size={16} />
                              {analysis.career.name}
                              <ChevronDown size={14} />
                            </button>
                          }
                        />
                        {progress && (
                          <section className="progress-banner" role="status">
                            <div className="progress-check">
                              <CheckCheck size={24} />
                            </div>
                            <div>
                              <span className="eyebrow">
                                PROGRESS THAT OPENS POSSIBILITIES
                              </span>
                              <h2>
                                Your profile improved. Your opportunities did,
                                too.
                              </h2>
                              <p>
                                Career readiness{" "}
                                <strong>
                                  {progress.before.readiness} →{" "}
                                  {progress.after.readiness}
                                </strong>
                                <span>·</span>Best job match{" "}
                                <strong>
                                  {progress.before.jobs[0]?.score} →{" "}
                                  {progress.after.jobs[0]?.score}
                                </strong>
                              </p>
                              <small>
                                Demo learning completion recorded as a simulated
                                skill gain.
                              </small>
                            </div>
                            <button
                              className="icon-button"
                              aria-label="Dismiss progress"
                              onClick={() => setProgress(null)}
                            >
                              <X size={18} />
                            </button>
                          </section>
                        )}
                        <div className="overview-top">
                          <section className="panel readiness-panel">
                            <div className="section-title">
                              <h2>Career readiness</h2>
                              <span className="subtle-label">
                                PROFILE ALIGNMENT
                              </span>
                            </div>
                            <div className="readiness-main">
                              <ScoreRing score={analysis.readiness} />
                              <div>
                                <span
                                  className={
                                    "status " +
                                    (analysis.readiness >= 70
                                      ? "green"
                                      : "amber")
                                  }
                                >
                                  {analysis.readiness >= 85
                                    ? "READY FOR YOUR NEXT STEP"
                                    : analysis.readiness >= 70
                                      ? "STRONG ALIGNMENT"
                                      : "ROOM TO GROW"}
                                </span>
                                <h3>{analysis.career.name}</h3>
                                <p>
                                  {analysis.readiness >= 70
                                    ? "You have a solid foundation. A few focused steps can open more doors."
                                    : "Build your foundation one skill at a time. Your next step is clear."}
                                </p>
                                <button
                                  className="text-button"
                                  onClick={() => go("gaps")}
                                >
                                  See what’s next
                                  <ArrowRight size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="readiness-footer">
                              <span>
                                <span className="live-dot" />
                                Based on {analysis.jobs_analyzed} demo positions
                              </span>
                              <span>Alignment, not hiring probability</span>
                            </div>
                          </section>
                          <div className="summary-metrics">
                            <div className="panel metric">
                              <span>
                                <BriefcaseBusiness size={17} />
                                Opportunities analyzed
                              </span>
                              <strong>
                                {analysis.jobs_analyzed
                                  .toString()
                                  .padStart(2, "0")}
                                <small>positions</small>
                              </strong>
                              <p>Matched against your current profile</p>
                            </div>
                            <div className="panel metric">
                              <span>
                                <CheckCircle2 size={17} />
                                Ready to apply
                              </span>
                              <strong className="positive">
                                {analysis.ready_count
                                  .toString()
                                  .padStart(2, "0")}
                                <small>opportunities</small>
                              </strong>
                              <p>
                                {analysis.strong_count} positions with strong
                                alignment or better
                              </p>
                            </div>
                          </div>
                        </div>
                        <section className="insight-banner">
                          <div className="insight-icon">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <span className="eyebrow">
                              A NOTE FROM YOUR CONCIERGE
                            </span>
                            <p>
                              {analysis.gaps.length ? (
                                <>
                                  Your next best move?{" "}
                                  <strong>{analysis.gaps[0].name}.</strong> It
                                  appears in {analysis.gaps[0].job_count} of{" "}
                                  {analysis.jobs_analyzed} roles. Closing this
                                  gap could move {analysis.gaps[0].unlocks}{" "}
                                  {analysis.gaps[0].unlocks === 1
                                    ? "opportunity"
                                    : "opportunities"}{" "}
                                  into “Ready to apply.”
                                </>
                              ) : (
                                <>
                                  Your current skills satisfy the listed
                                  requirements. Focus on showcasing your
                                  experience.
                                </>
                              )}
                            </p>
                          </div>
                          <button
                            className="text-button"
                            onClick={() => go("learning")}
                          >
                            Make a move
                            <ArrowRight size={16} />
                          </button>
                        </section>
                        <div className="dashboard-grid">
                          <section>
                            <div className="section-title outside">
                              <div>
                                <h2>
                                  Your strongest matches
                                  <span className="count-badge">
                                    {analysis.jobs_analyzed}
                                  </span>
                                </h2>
                                <p>
                                  Opportunities that connect with what you
                                  already know.
                                </p>
                              </div>
                              <button
                                className="text-button"
                                onClick={() => go("jobs")}
                              >
                                View all
                                <ArrowRight size={14} />
                              </button>
                            </div>
                            <div className="job-list">
                              {analysis.jobs
                                .slice(0, 3)
                                .map((j) => jobCard(j, true))}
                            </div>
                            <button
                              className="alternative-link"
                              onClick={() => go("alternatives")}
                            >
                              <Compass size={19} />
                              <span>
                                There’s more than one way forward.
                                <strong>Explore other career paths</strong>
                              </span>
                              <ArrowUpRight size={17} />
                            </button>
                          </section>
                          <div className="dashboard-right">
                            <section className="panel demand-panel">
                              <div className="section-title">
                                <h2>What the market asks for</h2>
                                <ChartNoAxesCombined size={18} />
                              </div>
                              <p className="muted small">
                                Skill demand across {analysis.jobs_analyzed}{" "}
                                demo positions
                              </p>
                              {analysis.demand.slice(0, 6).map((d) => (
                                <div className="demand-row" key={d.skill_id}>
                                  <div>
                                    <span>{d.name}</span>
                                    <strong>
                                      {d.percent}
                                      <small>%</small>
                                    </strong>
                                  </div>
                                  <div className="bar">
                                    <i
                                      className={
                                        profile?.skills.some(
                                          (s) => s.skill_id === d.skill_id,
                                        )
                                          ? "owned"
                                          : ""
                                      }
                                      style={{ width: d.percent + "%" }}
                                    />
                                  </div>
                                </div>
                              ))}
                              <div className="chart-legend">
                                <span>
                                  <i />
                                  In your profile
                                </span>
                                <span>
                                  <i />
                                  Room to grow
                                </span>
                              </div>
                            </section>
                            <section className="panel priority-panel">
                              <div className="section-title">
                                <h2>Your next priorities</h2>
                                <span className="count-badge">
                                  {analysis.gaps.length}
                                </span>
                              </div>
                              {analysis.gaps.slice(0, 3).map((g, i) => (
                                <button
                                  className="priority-row"
                                  key={g.skill_id}
                                  onClick={() => go("gaps")}
                                >
                                  <span className="priority-num">0{i + 1}</span>
                                  <div>
                                    <strong>{g.name}</strong>
                                    <small>
                                      {g.demand}% of roles · {levels[g.current]}
                                    </small>
                                  </div>
                                  <ChevronRight size={15} />
                                </button>
                              ))}
                              <button
                                className="text-button"
                                onClick={() => go("gaps")}
                              >
                                Explore skill gaps
                                <ArrowRight size={14} />
                              </button>
                            </section>
                          </div>
                        </div>
                      </>
                    )}
                    {(view === "jobs" || view === "saved") && (
                      <>
                        <Heading
                          eyebrow={
                            view === "saved"
                              ? "YOUR SHORTLIST"
                              : "OPPORTUNITIES, PERSONALIZED"
                          }
                          title={
                            view === "saved"
                              ? "Keep your next steps close."
                              : "Find your kind of opportunity."
                          }
                          description={`Ranked against your profile. ${analysis.jobs_analyzed} fictional ${analysis.career.name} positions, explained.`}
                        />
                        <div className="jobs-toolbar">
                          <div className="filter-tabs">
                            {[
                              "Best match",
                              "Ready to apply",
                              "Prepare first",
                            ].map((f) => (
                              <button
                                key={f}
                                className={filter === f ? "active" : ""}
                                onClick={() => setFilter(f)}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
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
                        <div className="job-list">
                          {analysis.jobs
                            .filter(
                              (j) =>
                                (view !== "saved" || saved.includes(j.id)) &&
                                (filter === "Best match" ||
                                  (filter === "Ready to apply" &&
                                    j.score >= 85) ||
                                  (filter === "Prepare first" &&
                                    j.score < 70)) &&
                                `${j.title} ${j.company}`
                                  .toLowerCase()
                                  .includes(search.toLowerCase()),
                            )
                            .map((j) => jobCard(j))}
                        </div>
                        {!analysis.jobs.some(
                          (j) =>
                            (view !== "saved" || saved.includes(j.id)) &&
                            (filter === "Best match" ||
                              (filter === "Ready to apply" && j.score >= 85) ||
                              (filter === "Prepare first" && j.score < 70)) &&
                            `${j.title} ${j.company}`
                              .toLowerCase()
                              .includes(search.toLowerCase()),
                        ) && (
                          <div className="empty-state">
                            <Bookmark size={30} />
                            <h2>
                              {view === "saved"
                                ? "Your shortlist starts here."
                                : "No opportunities match this filter."}
                            </h2>
                            <p>
                              {view === "saved"
                                ? "Save a position from its match analysis to find it here."
                                : "Try another filter or clear your search."}
                            </p>
                            <button
                              className="button secondary"
                              onClick={() => {
                                setFilter("Best match");
                                setSearch("");
                                go("jobs");
                              }}
                            >
                              Explore all jobs
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {view === "detail" && selectedJob && (
                      <>
                        <button
                          className="text-button back-link"
                          onClick={() => go("jobs")}
                        >
                          <ArrowLeft size={15} />
                          Back to opportunities
                        </button>
                        <div className="detail-heading">
                          <div className="company-avatar large-company">
                            {selectedJob.company[0]}
                          </div>
                          <div>
                            <div className="company-name">
                              {selectedJob.company}
                              <span className="demo-label">
                                FICTIONAL DEMO POSITION
                              </span>
                            </div>
                            <h1>{selectedJob.title}</h1>
                            <p>
                              <MapPin size={15} />
                              {selectedJob.location}
                              <span>·</span>
                              {selectedJob.employment_type}
                              <span>·</span>
                              {selectedJob.experience_level}
                            </p>
                          </div>
                          <button
                            disabled={busy}
                            className="button secondary"
                            onClick={() => toggleSave(selectedJob)}
                          >
                            <Bookmark
                              size={16}
                              fill={
                                saved.includes(selectedJob.id)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                            {saved.includes(selectedJob.id)
                              ? "Saved"
                              : "Save job"}
                          </button>
                        </div>
                        <div className="detail-grid">
                          <div>
                            <section className="panel">
                              <div className="section-title">
                                <h2>The opportunity</h2>
                                <BriefcaseBusiness size={18} />
                              </div>
                              <p className="body-copy">
                                {selectedJob.description}
                              </p>
                            </section>
                            <section className="panel requirements-panel">
                              <div className="section-title">
                                <div>
                                  <h2>Every requirement. Explained.</h2>
                                  <p>
                                    A side-by-side look at what this role asks
                                    for and what you bring.
                                  </p>
                                </div>
                              </div>
                              <div className="requirements-table">
                                <div className="table-head">
                                  <span>JOB REQUIREMENT</span>
                                  <span>EXPECTED</span>
                                  <span>YOUR PROFILE</span>
                                  <span>ALIGNMENT</span>
                                </div>
                                {selectedJob.comparisons.map((r) => (
                                  <div className="table-row" key={r.skill_id}>
                                    <div>
                                      <strong>{r.name}</strong>
                                      <small>
                                        {r.requirement_type} · {r.importance}
                                      </small>
                                    </div>
                                    <span>{levels[r.minimum_proficiency]}</span>
                                    <span>{levels[r.current]}</span>
                                    <span
                                      className={
                                        "comparison-status " +
                                        (r.status === "matched"
                                          ? "positive"
                                          : r.status === "partial"
                                            ? "amber-text"
                                            : "muted")
                                      }
                                    >
                                      {r.status === "matched" ? (
                                        <CheckCircle2 size={14} />
                                      ) : r.status === "partial" ? (
                                        <ChartNoAxesCombined size={14} />
                                      ) : (
                                        <Plus size={14} />
                                      )}{" "}
                                      {r.status === "matched"
                                        ? "Matched"
                                        : r.status === "partial"
                                          ? "Developing"
                                          : "Missing"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </section>
                            <section className="inline-insight">
                              <Sparkles size={23} />
                              <div>
                                <span className="eyebrow">
                                  YOUR CONCIERGE’S TAKE
                                </span>
                                <p>
                                  You fully satisfy{" "}
                                  {selectedJob.matched_skills.length} of{" "}
                                  {selectedJob.comparisons.length} skill
                                  requirements.{" "}
                                  {selectedJob.missing_skills.length
                                    ? `Focus on ${selectedJob.missing_skills.join(" and ")} to strengthen this match.`
                                    : "Bring examples that demonstrate these skills in practice."}{" "}
                                  {selectedJob.critical_missing.length
                                    ? `A missing critical requirement caps this score at 69.`
                                    : ""}
                                </p>
                              </div>
                            </section>
                          </div>
                          <div>
                            <section className="panel match-summary">
                              <span className="eyebrow">YOUR JOB MATCH</span>
                              <ScoreRing score={selectedJob.score} />
                              <span
                                className={
                                  "status " + pill(selectedJob.recommendation)
                                }
                              >
                                {selectedJob.recommendation}
                              </span>
                              <p>
                                How your current profile aligns with this
                                position.
                              </p>
                              <div className="score-breakdown">
                                {Object.entries(selectedJob.breakdown).map(
                                  ([k, v]) => (
                                    <div key={k}>
                                      <div>
                                        <span>
                                          {k[0].toUpperCase() + k.slice(1)}
                                          <small>
                                            {" "}
                                            · {selectedJob.weights[k]}% weight
                                          </small>
                                        </span>
                                        <strong>{Math.round(v)}%</strong>
                                      </div>
                                      <div className="bar">
                                        <i style={{ width: v + "%" }} />
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                              <small className="muted">
                                Alignment score, not the probability of an
                                offer.
                              </small>
                              <button
                                className="button primary full"
                                onClick={() => setApplication(true)}
                              >
                                Prepare application
                                <ArrowRight size={16} />
                              </button>
                              <button
                                className="button secondary full"
                                onClick={() => go("gaps")}
                              >
                                View skill gaps
                                <Target size={16} />
                              </button>
                            </section>
                          </div>
                        </div>
                      </>
                    )}
                    {view === "gaps" && (
                      <>
                        <Heading
                          eyebrow="FOCUS ON WHAT MOVES YOU FORWARD"
                          title="A gap is just your next step."
                          description={`Prioritized from ${analysis.jobs_analyzed} ${analysis.career.name} positions, your proficiency, and requirement importance.`}
                        />
                        <div className="gap-summary">
                          <span>
                            <CheckCircle2 size={17} />
                            {
                              analysis.demand.filter(
                                (d) =>
                                  !analysis.gaps.some(
                                    (g) => g.skill_id === d.skill_id,
                                  ),
                              ).length
                            }{" "}
                            satisfied skills
                          </span>
                          <span>
                            <ChartNoAxesCombined size={17} />
                            {
                              analysis.gaps.filter((g) => g.current > 0).length
                            }{" "}
                            developing skills
                          </span>
                          <span>
                            <Plus size={17} />
                            {
                              analysis.gaps.filter((g) => g.current === 0)
                                .length
                            }{" "}
                            missing skills
                          </span>
                        </div>
                        <div className="gap-cards">
                          {analysis.gaps.map((g, i) => (
                            <article
                              className="panel gap-card"
                              key={g.skill_id}
                            >
                              <div className="gap-number">
                                {String(i + 1).padStart(2, "0")}
                              </div>
                              <div className="gap-content">
                                <div className="section-title">
                                  <h2>{g.name}</h2>
                                  <span
                                    className={
                                      "status " +
                                      (g.priority === "HIGH" ? "amber" : "blue")
                                    }
                                  >
                                    {g.priority} PRIORITY
                                  </span>
                                </div>
                                <p>
                                  Appears in{" "}
                                  <strong>
                                    {g.job_count} of {analysis.jobs_analyzed}{" "}
                                    positions ({g.demand}%)
                                  </strong>
                                  . {g.required_count} roles list a requirement
                                  above your current level.
                                </p>
                                <div className="gap-levels">
                                  <div>
                                    <small>YOUR CURRENT LEVEL</small>
                                    <strong>{levels[g.current]}</strong>
                                  </div>
                                  <ArrowRight size={20} />
                                  <div>
                                    <small>RECOMMENDED LEVEL</small>
                                    <strong>{levels[g.target]}</strong>
                                  </div>
                                </div>
                                <p className="small muted">
                                  Priority combines demand, required/preferred
                                  status, importance, and your proficiency gap.
                                  Improving this skill could unlock {g.unlocks}{" "}
                                  ready-to-apply{" "}
                                  {g.unlocks === 1 ? "role" : "roles"}.
                                </p>
                                <button
                                  className="text-button"
                                  onClick={() => go("learning")}
                                >
                                  Find a way to learn
                                  <ArrowRight size={15} />
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                        {!analysis.gaps.length && (
                          <div className="empty-state">
                            <CheckCheck size={32} />
                            <h2>Your skills meet this selection.</h2>
                            <p>
                              Keep adding project evidence and experience to
                              strengthen your profile.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {view === "learning" && (
                      <>
                        <Heading
                          eyebrow="TURN INSIGHT INTO PROGRESS"
                          title="Your next move starts here."
                          description="A focused set of learning activities connected to your most important skill gaps."
                        />
                        <div className="notice">
                          <BookOpen size={18} />
                          These are demo learning activities. Completing one
                          simulates an Intermediate skill gain; it is not an
                          assessment or certification.
                        </div>
                        <div className="learning-grid">
                          {resources.map((r, i) => (
                            <article className="panel learning-card" key={r.id}>
                              <div className="section-title">
                                <span className="learning-number">
                                  STEP {String(i + 1).padStart(2, "0")}
                                </span>
                                <BookOpen size={20} />
                              </div>
                              <span className="tag blue">{r.gap.name}</span>
                              <h2>{r.title}</h2>
                              <div className="learning-meta">
                                <span>
                                  <Clock3 size={14} />
                                  {r.duration}
                                </span>
                                <span>{r.resource_type}</span>
                              </div>
                              <p>{r.description}</p>
                              <div className="learning-why">
                                <Sparkles size={14} />
                                <span>
                                  Recommended because {r.gap.name} appears in{" "}
                                  {r.gap.job_count} of your analyzed positions.
                                </span>
                              </div>
                              <ol>
                                {r.steps.map((step) => (
                                  <li key={step}>{step}</li>
                                ))}
                              </ol>
                              <button
                                className="button primary full"
                                disabled={busy || r.completed}
                                onClick={() => complete(r)}
                              >
                                <CheckCircle2 size={16} />
                                {r.completed
                                  ? "Completed"
                                  : "Complete demo learning"}
                                <ArrowRight size={15} />
                              </button>
                            </article>
                          ))}
                        </div>
                        {!resources.length && (
                          <div className="empty-state">
                            <CheckCircle2 size={30} />
                            <h2>You’ve covered the current skill gaps.</h2>
                            <p>
                              Explore another career or add new project evidence
                              to your profile.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {view === "alternatives" && (
                      <>
                        <Heading
                          eyebrow="MORE THAN ONE WAY FORWARD"
                          title="Different paths. Same potential."
                          description={`Your selected career, ${analysis.career.name}, scores ${analysis.readiness}/100. Here’s how other paths compare.`}
                        />
                        <div className="alternative-grid">
                          {alternatives.map((a) => {
                            const Icon = groupIcon(a.career.group);
                            return (
                              <article className="panel" key={a.career.id}>
                                <div className="section-title">
                                  <div className="icon-tile">
                                    <Icon size={23} />
                                  </div>
                                  <span className="alternative-score">
                                    {a.readiness}
                                    <small>/100</small>
                                  </span>
                                </div>
                                <span className="eyebrow">
                                  {a.career.group}
                                </span>
                                <h2>{a.career.name}</h2>
                                <p>
                                  {a.readiness > analysis.readiness
                                    ? "Your current profile aligns more strongly with this path."
                                    : "Another direction to explore as your skills develop."}
                                </p>
                                <p className="small muted">
                                  Based on {a.jobs_analyzed} positions.{" "}
                                  {a.matched_skills.length
                                    ? `You already bring ${a.matched_skills.slice(0, 3).join(", ")}.`
                                    : "Start by building the core skills in this path."}
                                </p>
                                <button
                                  className="button secondary full"
                                  disabled={busy}
                                  onClick={() => loadAnalysis(a.career.id)}
                                >
                                  Explore this path
                                  <ArrowRight size={16} />
                                </button>
                              </article>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                )}
              <footer className="workspace-footer">
                <span>
                  <ShieldCheck size={13} />
                  Explainable by design. Built around you.
                </span>
                <span>Demo data · Deterministic matching · Mock AI</span>
                {profile && (
                  <button
                    onClick={() =>
                      run(async () => {
                        const p = await api<Profile>(
                          `/demo/reset/${profile.id}`,
                          "POST",
                        );
                        setProfile(p);
                        setDraft(p);
                        setAnalysis(null);
                        setProgress(null);
                        setSaved([]);
                        setView("profile");
                        setNotice(
                          "Demo reset. Alex’s original profile is ready.",
                        );
                      })
                    }
                    disabled={busy}
                  >
                    Reset demo
                    <RefreshCw size={11} />
                  </button>
                )}
              </footer>
            </main>
          </div>
        </>
      )}
      {error && (
        <div className="error-toast" role="alert">
          <TriangleAlert size={20} />
          <div>
            <strong>Something needs a moment.</strong>
            <p>{error}</p>
          </div>
          <button
            className="text-button"
            onClick={() => {
              setError("");
              void initialize();
            }}
          >
            Retry
          </button>
          <button
            className="icon-button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {notice && (
        <div className="notice-toast" role="status">
          <CheckCircle2 size={18} />
          {notice}
          <button
            className="icon-button"
            aria-label="Dismiss notice"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {processing && (
        <div className="modal-backdrop">
          <div className="processing-panel" role="status" aria-live="polite">
            <div className="processing-icon">
              <Compass size={35} />
            </div>
            <span className="eyebrow">MAKING THE CONNECTIONS</span>
            <h2>
              {processing === "profile"
                ? "Getting to know your story."
                : processing === "progress"
                  ? "Your progress changes things."
                  : "Finding where you fit."}
            </h2>
            <p>
              {processing === "profile"
                ? "Building your structured career profile."
                : processing === "progress"
                  ? "Updating your profile and re-analyzing opportunities."
                  : `Comparing your profile with ${careers.find((c) => c.id === careerId)?.name || "career"} requirements.`}
            </p>
            <div className="processing-steps">
              {(processing === "profile"
                ? [
                    "Reading your profile",
                    "Normalizing technical skills",
                    "Mapping competency groups",
                    "Preparing your career profile",
                  ]
                : [
                    "Querying the demo job database",
                    "Comparing skills and experience",
                    "Prioritizing your skill gaps",
                    "Ranking your opportunities",
                  ]
              ).map((step, i) => (
                <div key={step} className={i <= processingStep ? "done" : ""}>
                  {i < processingStep ? (
                    <CheckCircle2 size={17} />
                  ) : i === processingStep ? (
                    <Loader2 className="spin" size={17} />
                  ) : (
                    <span className="step-dot" />
                  )}
                  {step}
                </div>
              ))}
            </div>
            <small>Deterministic analysis · No external AI call</small>
          </div>
        </div>
      )}
      {chatOpen && (
        <div className="drawer-backdrop" onClick={() => setChatOpen(false)}>
          <aside
            className="concierge-drawer"
            aria-label="Career Concierge"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <Sparkles size={20} />
                <h2>Your Career Concierge</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close concierge"
                onClick={() => setChatOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="drawer-context">
              <span className="eyebrow">CURRENT CONTEXT</span>
              <p>
                {view === "detail"
                  ? selectedJob?.title
                  : analysis?.career.name || "Your career profile"}
              </p>
              <span className="tag">Deterministic demo assistant</span>
            </div>
            <div className="chat-body">
              <div className="chat-bubble">
                Let’s make your next step clearer. I can explain your match,
                your skill gaps, and where to focus.
              </div>
              {!analysis && (
                <p className="muted small">
                  Choose a career to get insights grounded in its job
                  requirements.
                </p>
              )}
              <div className="chat-prompts">
                {[
                  "Why did I get this score?",
                  "What should I improve first?",
                  "Am I ready to apply?",
                ].map((q) => (
                  <button
                    disabled={!analysis || chatBusy}
                    key={q}
                    onClick={() => ask(q)}
                  >
                    {q}
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
              {answer && (
                <div className="chat-bubble answer">
                  <Sparkles size={16} />
                  <p>{answer}</p>
                </div>
              )}
              {chatBusy && <Loader2 className="spin" />}
            </div>
            <form
              className="chat-input"
              onSubmit={(e) => {
                e.preventDefault();
                void ask();
              }}
            >
              <input
                aria-label="Ask Career Concierge"
                placeholder="Ask about your next step…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!analysis}
              />
              <button
                className="icon-button"
                aria-label="Send question"
                disabled={!analysis || chatBusy || !message.trim()}
              >
                <Send size={18} />
              </button>
            </form>
            <small className="drawer-disclaimer">
              Guidance based on demo requirements, not hiring predictions.
            </small>
          </aside>
        </div>
      )}
      {application && selectedJob && (
        <div className="modal-backdrop">
          <section
            className="application-modal panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-title"
          >
            <div className="section-title">
              <span className="eyebrow">SIMULATED APPLICATION PREPARATION</span>
              <button
                className="icon-button"
                aria-label="Close application"
                onClick={() => setApplication(false)}
              >
                <X size={19} />
              </button>
            </div>
            <h2 id="application-title">Make your experience count.</h2>
            <p>
              Prepare for {selectedJob.title} at {selectedJob.company}.
            </p>
            {[
              "Tailor your resume to the matched requirements.",
              "Choose two projects and explain your contribution.",
              `Prepare a short example using ${selectedJob.matched_skills[0] || "a relevant skill"}.`,
              "Be honest about developing skills and your next learning step.",
            ].map((t) => (
              <label className="application-check" key={t}>
                <input type="checkbox" />
                {t}
              </label>
            ))}
            <div className="notice">
              This is a fictional position. No application will be sent.
            </div>
            <button
              className="button primary full"
              onClick={() => {
                setApplication(false);
                setNotice(
                  "Preparation checklist reviewed. No application was sent.",
                );
              }}
            >
              Done preparing
              <Check size={16} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
