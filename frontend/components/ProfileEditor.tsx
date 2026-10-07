"use client";
import { useState } from "react";
import {
  Plus,
  Trash2,
  Upload,
  FileText,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import type { Profile, Skill, UserSkill } from "../lib/api-types";
import { api } from "../lib/api";
export const emptyProfile: Profile = {
  name: "",
  university: "",
  field: "",
  degree: "Bachelor",
  graduation_year: 2027,
  skills: [],
  education: [],
  experiences: [],
  projects: [],
  certifications: [],
};
const levels = ["", "Beginner", "Intermediate", "Advanced"];
export default function ProfileEditor({
  initial,
  catalog,
  onSave,
  busy,
}: {
  initial: Profile;
  catalog: Skill[];
  onSave: (p: Profile) => void;
  busy: boolean;
}) {
  const [p, setP] = useState<Profile>(structuredClone(initial));
  const [tab, setTab] = useState("Basics");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const tabs = [
    "Basics",
    "Skills",
    "Education",
    "Experience",
    "Projects",
    "Certifications",
  ];
  const patch = (value: Partial<Profile>) => setP({ ...p, ...value });
  const input = (
    label: string,
    key: "name" | "university" | "field" | "degree" | "graduation_year",
  ) => (
    <label className="field">
      {label}
      <input
        required={key === "name"}
        value={p[key]}
        type={key === "graduation_year" ? "number" : "text"}
        min={key === "graduation_year" ? 1950 : undefined}
        max={key === "graduation_year" ? 2100 : undefined}
        onChange={(e) =>
          patch({
            [key]:
              key === "graduation_year"
                ? Number(e.target.value)
                : e.target.value,
          })
        }
      />
    </label>
  );
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setNotice("");
    try {
      const body = new FormData();
      body.append("file", file);
      const data = await api<{ skills: UserSkill[]; notice: string }>(
        "/resume/analyze",
        "POST",
        body,
      );
      const merged = new Map(p.skills.map((s) => [s.skill_id, s]));
      data.skills.forEach((s) => {
        if (!merged.has(s.skill_id)) merged.set(s.skill_id, s);
      });
      patch({ skills: [...merged.values()] });
      setNotice(data.notice);
      setTab("Skills");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!p.name.trim()) {
          setTab("Basics");
          setNotice("Enter your name to create a profile.");
          return;
        }
        onSave({ ...p, name: p.name.trim() });
      }}
    >
      <div className="section-tabs">
        {tabs.map((t, i) => (
          <button
            type="button"
            className={t === tab ? "active" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            <span>{i + 1}</span>
            {t}
          </button>
        ))}
      </div>
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}
      <section className="panel editor-panel">
        <div className="section-title">
          <div>
            <span className="eyebrow">YOUR STORY, STRUCTURED</span>
            <h2>{tab === "Basics" ? "Let’s start with you." : tab}</h2>
          </div>
          <span className="muted small">You can update this anytime</span>
        </div>
        {tab === "Basics" && (
          <>
            <div className="form-grid">
              {input("Your name", "name")}
              {input("University / institution", "university")}
              {input("Field of study", "field")}
              {input("Degree", "degree")}
              {input("Graduation year", "graduation_year")}
            </div>
            <div className="upload-box">
              <div className="icon-tile">
                <Upload size={24} />
              </div>
              <h3>Start with your resume</h3>
              <p>
                Upload a UTF-8 .txt file to identify skills, or enter everything
                manually.
              </p>
              <div className="button-row">
                <label className="button secondary">
                  {uploading ? (
                    <Loader2 className="spin" size={16} />
                  ) : (
                    <Upload size={16} />
                  )}
                  Upload resume
                  <input
                    aria-label="Upload resume"
                    type="file"
                    accept=".txt,text/plain"
                    hidden
                    disabled={uploading}
                    onChange={(e) => upload(e.target.files?.[0])}
                  />
                </label>
                <button
                  type="button"
                  className="button ghost"
                  onClick={async () => {
                    try {
                      setP(await api<Profile>("/demo/template"));
                      setNotice(
                        "Demo resume loaded. Review Puripatjudhai’s skills and background before continuing.",
                      );
                    } catch (e) {
                      setNotice((e as Error).message);
                    }
                  }}
                >
                  <FileText size={16} />
                  Use Demo Resume
                </button>
              </div>
              <small>
                PDF and DOCX parsing are future integrations. Your upload is not
                stored.
              </small>
            </div>
          </>
        )}
        {tab === "Skills" && (
          <>
            <p className="muted">
              Review your skills and choose your own proficiency. Resume
              extraction suggests Beginner until you confirm it.
            </p>
            <div className="skill-editor">
              {p.skills.map((s, i) => (
                <div key={s.skill_id} className="skill-edit-row">
                  <div>
                    <strong>
                      {catalog.find((c) => c.id === s.skill_id)?.name ||
                        s.skill_id}
                    </strong>
                    <small>{s.source.replace("_", " ")}</small>
                  </div>
                  <select
                    aria-label={`${s.skill_id} proficiency`}
                    value={s.proficiency}
                    onChange={(e) =>
                      patch({
                        skills: p.skills.map((x, j) =>
                          j === i
                            ? { ...x, proficiency: Number(e.target.value) }
                            : x,
                        ),
                      })
                    }
                  >
                    {[1, 2, 3].map((l) => (
                      <option key={l} value={l}>
                        {levels[l]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove ${s.skill_id}`}
                    onClick={() =>
                      patch({ skills: p.skills.filter((_, j) => j !== i) })
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <label className="field">
              Add a skill
              <select
                value=""
                onChange={(e) =>
                  e.target.value &&
                  patch({
                    skills: [
                      ...p.skills,
                      {
                        skill_id: e.target.value,
                        proficiency: 1,
                        source: "manual",
                      },
                    ],
                  })
                }
              >
                <option value="">Choose a canonical skill…</option>
                {catalog
                  .filter((c) => !p.skills.some((s) => s.skill_id === c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
          </>
        )}
        {tab === "Education" && (
          <>
            {p.education.map((item, i) => (
              <div className="record-form" key={i}>
                <div className="form-grid">
                  {(
                    [
                      "institution",
                      "degree",
                      "field",
                      "start_year",
                      "end_year",
                    ] as const
                  ).map((k) => (
                    <label className="field" key={k}>
                      {k.replace("_", " ")}
                      <input
                        type={k.includes("year") ? "number" : "text"}
                        value={item[k]}
                        onChange={(e) =>
                          patch({
                            education: p.education.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    [k]: k.includes("year")
                                      ? Number(e.target.value)
                                      : e.target.value,
                                  }
                                : x,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={item.enrolled}
                    onChange={(e) =>
                      patch({
                        education: p.education.map((x, j) =>
                          j === i ? { ...x, enrolled: e.target.checked } : x,
                        ),
                      })
                    }
                  />
                  Currently enrolled
                </label>
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() =>
                    patch({ education: p.education.filter((_, j) => j !== i) })
                  }
                >
                  Remove education
                </button>
              </div>
            ))}
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                patch({
                  education: [
                    ...p.education,
                    {
                      institution: p.university,
                      degree: p.degree,
                      field: p.field,
                      start_year: 2023,
                      end_year: p.graduation_year,
                      enrolled: true,
                    },
                  ],
                })
              }
            >
              <Plus size={16} />
              Add education
            </button>
          </>
        )}
        {tab === "Experience" && (
          <>
            {p.experiences.map((item, i) => (
              <div className="record-form" key={i}>
                <div className="form-grid">
                  {(
                    [
                      "organization",
                      "role",
                      "start",
                      "end",
                      "description",
                    ] as const
                  ).map((k) => (
                    <label className="field" key={k}>
                      {k}
                      <input
                        type={k === "start" || k === "end" ? "month" : "text"}
                        value={item[k]}
                        onChange={(e) =>
                          patch({
                            experiences: p.experiences.map((x, j) =>
                              j === i ? { ...x, [k]: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
                  <label className="field">
                    Skills used (hold Ctrl / Cmd to select multiple)
                    <select
                      multiple
                      value={item.skills}
                      onChange={(e) =>
                        patch({
                          experiences: p.experiences.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  skills: Array.from(
                                    e.target.selectedOptions,
                                    (o) => o.value,
                                  ),
                                }
                              : x,
                          ),
                        })
                      }
                    >
                      {catalog.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() =>
                    patch({
                      experiences: p.experiences.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove experience
                </button>
              </div>
            ))}
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                patch({
                  experiences: [
                    ...p.experiences,
                    {
                      organization: "",
                      role: "",
                      start: "2025-06",
                      end: "2025-08",
                      description: "",
                      skills: [],
                    },
                  ],
                })
              }
            >
              <Plus size={16} />
              Add internship / experience
            </button>
          </>
        )}
        {tab === "Projects" && (
          <>
            {p.projects.map((item, i) => (
              <div className="record-form" key={i}>
                <div className="form-grid">
                  {(["name", "description", "project_type"] as const).map(
                    (k) => (
                      <label className="field" key={k}>
                        {k.replace("_", " ")}
                        <input
                          value={item[k]}
                          onChange={(e) =>
                            patch({
                              projects: p.projects.map((x, j) =>
                                j === i ? { ...x, [k]: e.target.value } : x,
                              ),
                            })
                          }
                        />
                      </label>
                    ),
                  )}
                  <label className="field">
                    Technology stack (comma separated)
                    <input
                      value={item.stack.join(", ")}
                      onChange={(e) =>
                        patch({
                          projects: p.projects.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  stack: e.target.value
                                    .split(",")
                                    .map((t) => t.trim()),
                                }
                              : x,
                          ),
                        })
                      }
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() =>
                    patch({ projects: p.projects.filter((_, j) => j !== i) })
                  }
                >
                  Remove project
                </button>
              </div>
            ))}
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                patch({
                  projects: [
                    ...p.projects,
                    {
                      name: "",
                      description: "",
                      stack: [],
                      project_type: "Personal",
                    },
                  ],
                })
              }
            >
              <Plus size={16} />
              Add project
            </button>
          </>
        )}
        {tab === "Certifications" && (
          <>
            {p.certifications.map((item, i) => (
              <div className="record-form" key={i}>
                <div className="form-grid">
                  {(["name", "issuer", "year"] as const).map((k) => (
                    <label className="field" key={k}>
                      {k}
                      <input
                        type={k === "year" ? "number" : "text"}
                        value={item[k]}
                        onChange={(e) =>
                          patch({
                            certifications: p.certifications.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    [k]:
                                      k === "year"
                                        ? Number(e.target.value)
                                        : e.target.value,
                                  }
                                : x,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() =>
                    patch({
                      certifications: p.certifications.filter(
                        (_, j) => j !== i,
                      ),
                    })
                  }
                >
                  Remove certification
                </button>
              </div>
            ))}
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                patch({
                  certifications: [
                    ...p.certifications,
                    { name: "", issuer: "", year: 2026 },
                  ],
                })
              }
            >
              <Plus size={16} />
              Add certification
            </button>
          </>
        )}
      </section>
      <div className="form-footer">
        <span className="muted small">
          <Check size={14} />
          Your profile comes first. Choose your career next.
        </span>
        <div className="button-row">
          {tab !== "Certifications" && (
            <button
              type="button"
              className="button secondary"
              onClick={() => setTab(tabs[tabs.indexOf(tab) + 1])}
            >
              Next section
              <ArrowRight size={16} />
            </button>
          )}
          <button className="button primary" disabled={busy || uploading}>
            {busy ? <Loader2 className="spin" size={16} /> : null}
            {p.id ? "Save & review profile" : "Create My Career Profile"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}
