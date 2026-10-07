from copy import deepcopy
from backend.app.repositories import seed_data
from backend.app.matching import analyze, match, experience_months
from ai.providers import SkillNormalizationService, MockAIProvider

data = seed_data()
catalog = {s["id"]: s for s in data["skills"]}
alex = data["alex"]
jobs = [j for j in data["jobs"] if j["career_id"] == "frontend"]


def improved():
    p = deepcopy(alex)
    p["skills"].append({"skill_id": "typescript", "proficiency": 2, "source": "demo_learning"})
    return p


def test_exact_demo_and_determinism():
    a = analyze(alex, jobs, catalog)
    b = analyze(improved(), jobs, catalog)
    assert (a["readiness"], b["readiness"]) == (78, 85)
    assert (a["jobs"][0]["score"], b["jobs"][0]["score"]) == (87, 92)
    assert a == analyze(alex, jobs, catalog)
    assert a["gaps"][0]["skill_id"] == "typescript"
    assert b["gaps"][0]["skill_id"] == "testing"
    assert b["ready_count"] > a["ready_count"]


def test_partial_and_missing():
    result = analyze(alex, jobs, catalog)
    assert "TypeScript" in result["jobs"][0]["missing_skills"]
    assert any(
        r["skill_id"] == "react" and r["status"] == "partial"
        for j in result["jobs"]
        for r in j["comparisons"]
    )


def test_critical_cap():
    j = deepcopy(jobs[0])
    j["requirements"][0] = {
        "skill_id": "typescript",
        "requirement_type": "required",
        "importance": "critical",
        "minimum_proficiency": 2,
    }
    result = match(alex, j, catalog)
    assert result["score"] <= 69 and result["critical_missing"] == ["TypeScript"]


def test_demand_and_empty():
    a = analyze(alex, jobs, catalog)
    for row in a["demand"]:
        assert row["count"] == sum(
            any(r["skill_id"] == row["skill_id"] for r in j["requirements"]) for j in jobs
        )
    assert analyze(alex, [], catalog)["readiness"] == 0


def test_normalization_is_exact_and_alias_aware():
    svc = SkillNormalizationService(data["skills"])
    assert svc.normalize(" JS ") == "javascript"
    assert svc.normalize("Java Script") == "javascript"
    assert svc.normalize("unrecognized") is None
    extracted = MockAIProvider().extract_skills(
        "JavaScript, Next.js. A basic CSS website.", data["skills"]
    )
    assert {s["skill_id"] for s in extracted} == {"javascript", "nextjs", "css"}
    assert all(s["proficiency"] == 1 for s in extracted)


def test_experience_overlap_not_double_counted():
    p = deepcopy(alex)
    p["experiences"] *= 2
    assert experience_months(p, jobs[0]) == 3


def test_missing_components_redistribute_and_monotonic():
    j = deepcopy(jobs[0])
    j["experience_months"] = 0
    j["education_level"] = "none"
    j["requirements"] = [r for r in j["requirements"] if r["requirement_type"] == "required"]
    result = match(alex, j, catalog)
    assert abs(sum(result["weights"].values()) - 100) < 0.02
    assert match(improved(), j, catalog)["score"] >= result["score"]


def test_all_careers_have_jobs_and_canonical_requirements():
    assert len(data["jobs"]) == 56 and len(data["careers"]) == 12
    assert all(any(j["career_id"] == c["id"] for j in data["jobs"]) for c in data["careers"])
    assert all(r["skill_id"] in catalog for j in data["jobs"] for r in j["requirements"])
    assert all(
        len(j["requirements"]) == len({r["skill_id"] for r in j["requirements"]})
        for j in data["jobs"]
    )


def test_ties_have_stable_id_order():
    j = deepcopy(jobs[0])
    a = {**j, "id": "a"}
    b = {**j, "id": "b"}
    assert [r["id"] for r in analyze(alex, [b, a], catalog)["jobs"]] == ["a", "b"]


def test_catalog_has_varied_demand_and_demo_alignment_states():
    frontend = analyze(alex, jobs, catalog)
    assert len({d["percent"] for d in frontend["demand"]}) > 1
    scientist = analyze(alex, [j for j in data["jobs"] if j["career_id"] == "scientist"], catalog)
    assert scientist["readiness"] == 24
    assert len({d["percent"] for d in scientist["demand"]}) > 1
    matches = [match(alex, j, catalog) for j in data["jobs"]]
    assert any(j["score"] >= 85 for j in matches)
    assert any(70 <= j["score"] < 85 for j in matches)
    assert any(j["score"] < 70 for j in matches)
    assert any(j["critical_missing"] for j in matches)
