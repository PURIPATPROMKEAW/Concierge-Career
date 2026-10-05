def match_skills(user_skills: list[str], requirements: list[str]) -> dict:
    """Explainable equal-weight skill coverage. Not a probability of being hired."""
    known = {skill.strip().casefold() for skill in user_skills if skill.strip()}
    unique = {skill.strip().casefold(): skill.strip() for skill in requirements if skill.strip()}
    matched = [label for key, label in unique.items() if key in known]
    missing = [label for key, label in unique.items() if key not in known]
    total = len(unique)
    return {
        "score": round(100 * len(matched) / total) if total else 0,
        "matched": matched,
        "missing": missing,
        "explanation": f"{len(matched)} of {total} required skills matched. Demo skill coverage, not a hiring prediction.",
    }
