"""Pure matching functions. No database access, providers, or persona overrides."""

from collections import defaultdict
import math

IMPORTANCE = {"low": 1, "medium": 2, "high": 3, "critical": 4}
WEIGHTS = {
    "required": 0.50,
    "preferred": 0.15,
    "experience": 0.15,
    "education": 0.10,
    "competency": 0.10,
}


def rounded(value):
    return math.floor(value + 0.5)


def experience_months(profile, job):
    months = set()
    needed = {r["skill_id"] for r in job["requirements"]}
    for item in profile.get("experiences", []):
        if not needed.intersection(item.get("skills", [])):
            continue
        a, b = item["start"].split("-"), item["end"].split("-")
        start, end = int(a[0]) * 12 + int(a[1]), int(b[0]) * 12 + int(b[1])
        months.update(range(start, end + 1))
    return len(months)


def match(profile, job, skills):
    levels = {s["skill_id"]: s["proficiency"] for s in profile["skills"]}
    rows = []
    for req in job["requirements"]:
        current = levels.get(req["skill_id"], 0)
        ratio = min(current / req["minimum_proficiency"], 1)
        rows.append(
            {
                **req,
                "name": skills[req["skill_id"]]["name"],
                "current": current,
                "satisfaction": ratio,
                "status": "matched" if ratio == 1 else "partial" if current else "missing",
            }
        )
    components = {}
    for kind in ["required", "preferred"]:
        group = [r for r in rows if r["requirement_type"] == kind]
        if group:
            components[kind] = (
                sum(r["satisfaction"] * IMPORTANCE[r["importance"]] for r in group)
                / sum(IMPORTANCE[r["importance"]] for r in group)
                * 100
            )
    if job["experience_months"] > 0:
        components["experience"] = (
            min(experience_months(profile, job) / job["experience_months"], 1) * 100
        )
    if job["education_level"] != "none":
        degrees = {"High school": 1, "Diploma": 2, "Bachelor": 3, "Master": 4, "Doctorate": 5}
        education = profile.get("education", [])
        components["education"] = (
            100
            if any(
                degrees.get(e["degree"], 0) >= degrees.get(job["education_level"], 3)
                and (not e.get("enrolled", False) or job["accepts_enrolled"])
                and (
                    not job["education_fields"]
                    or e["field"].lower() in [f.lower() for f in job["education_fields"]]
                )
                for e in education
            )
            else 0
        )
    groups = {skills[r["skill_id"]]["competency"] for r in rows}
    owned_groups = {skills[s]["competency"] for s in levels if s in skills}
    if groups:
        components["competency"] = len(groups & owned_groups) / len(groups) * 100
    denominator = sum(WEIGHTS[k] for k in components)
    raw = sum(v * WEIGHTS[k] for k, v in components.items()) / denominator if denominator else 0
    critical = [
        r["name"]
        for r in rows
        if r["requirement_type"] == "required"
        and r["importance"] == "critical"
        and not r["current"]
    ]
    if critical:
        raw = min(raw, 69)
    score = rounded(raw)
    status = (
        "READY TO APPLY"
        if score >= 85
        else "STRONG MATCH"
        if score >= 70
        else "PREPARE FIRST"
        if score >= 50
        else "LOW ALIGNMENT"
    )
    return {
        **job,
        "score": score,
        "raw_score": raw,
        "recommendation": status,
        "breakdown": {k: round(v, 2) for k, v in components.items()},
        "weights": {k: round(WEIGHTS[k] / denominator * 100, 2) for k in components}
        if denominator
        else {},
        "comparisons": rows,
        "critical_missing": critical,
        "matched_skills": [r["name"] for r in rows if r["status"] == "matched"],
        "partial_skills": [r["name"] for r in rows if r["status"] == "partial"],
        "missing_skills": [r["name"] for r in rows if r["status"] == "missing"],
    }


def analyze(profile, jobs, skills):
    ranked = sorted(
        [match(profile, j, skills) for j in jobs], key=lambda j: (-j["raw_score"], j["id"])
    )
    count = len(jobs)
    demand = defaultdict(int)
    gaps = defaultdict(lambda: {"priority_raw": 0, "target": 0, "required_count": 0})
    levels = {s["skill_id"]: s["proficiency"] for s in profile["skills"]}
    for job in ranked:
        for r in job["comparisons"]:
            sid = r["skill_id"]
            demand[sid] += 1
            if r["satisfaction"] < 1:
                g = gaps[sid]
                g["priority_raw"] += (
                    (1 - r["satisfaction"])
                    * IMPORTANCE[r["importance"]]
                    * (1 if r["requirement_type"] == "required" else 0.5)
                )
                g["target"] = max(g["target"], r["minimum_proficiency"])
                g["required_count"] += int(r["requirement_type"] == "required")
    gap_rows = []
    for sid, g in gaps.items():
        updated = {
            **profile,
            "skills": [s for s in profile["skills"] if s["skill_id"] != sid]
            + [{"skill_id": sid, "proficiency": g["target"]}],
        }
        unlocked = sum(
            match(updated, j, skills)["score"] >= 85 and old["score"] < 85
            for j, old in zip(jobs, [match(profile, j, skills) for j in jobs])
        )
        priority = g["priority_raw"] / count if count else 0
        gap_rows.append(
            {
                "skill_id": sid,
                "name": skills[sid]["name"],
                "current": levels.get(sid, 0),
                "target": g["target"],
                "demand": rounded(demand[sid] / count * 100) if count else 0,
                "job_count": demand[sid],
                "required_count": g["required_count"],
                "priority_value": round(priority, 4),
                "priority": "HIGH" if priority >= 1 else "MEDIUM" if priority >= 0.4 else "LOW",
                "unlocks": unlocked,
            }
        )
    gap_rows.sort(key=lambda g: (-g["priority_value"], -g["unlocks"], g["skill_id"]))
    return {
        "readiness": rounded(sum(j["raw_score"] for j in ranked) / count) if count else 0,
        "jobs_analyzed": count,
        "ready_count": sum(j["score"] >= 85 for j in ranked),
        "strong_count": sum(j["score"] >= 70 for j in ranked),
        "jobs": ranked,
        "gaps": gap_rows,
        "demand": sorted(
            [
                {
                    "skill_id": sid,
                    "name": skills[sid]["name"],
                    "count": n,
                    "percent": rounded(n / count * 100),
                }
                for sid, n in demand.items()
            ],
            key=lambda s: (-s["count"], s["name"]),
        ),
    }
