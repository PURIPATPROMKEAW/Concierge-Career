"""Author the fictional dataset reproducibly. Runtime reads seed.json, never calibrates."""

import json
import random
from pathlib import Path
from backend.app.matching import match, analyze

SKILL_GROUPS = {
    "Web development": [
        ("html", "HTML"),
        ("css", "CSS"),
        ("javascript", "JavaScript"),
        ("react", "React"),
        ("nextjs", "Next.js"),
        ("typescript", "TypeScript"),
        ("testing", "Frontend Testing"),
    ],
    "Engineering practice": [
        ("git", "Git"),
        ("rest", "REST APIs"),
        ("node", "Node.js"),
        ("python", "Python"),
        ("java", "Java"),
        ("oop", "Object-oriented Programming"),
    ],
    "Data management": [
        ("sql", "SQL"),
        ("postgres", "PostgreSQL"),
        ("excel", "Excel"),
        ("powerbi", "Power BI"),
        ("etl", "ETL Pipelines"),
    ],
    "Data science": [
        ("statistics", "Statistics"),
        ("pandas", "Pandas"),
        ("ml", "Machine Learning"),
        ("tensorflow", "TensorFlow"),
        ("pytorch", "PyTorch"),
    ],
    "Infrastructure": [
        ("linux", "Linux"),
        ("docker", "Docker"),
        ("aws", "AWS"),
        ("cicd", "CI/CD"),
        ("terraform", "Terraform"),
        ("networking", "Networking"),
    ],
    "Security": [
        ("security", "Security Analysis"),
        ("siem", "SIEM"),
        ("incident", "Incident Response"),
    ],
}
skills = []
aliases = {
    "javascript": ["js", "java script"],
    "nextjs": ["next.js", "next js"],
    "typescript": ["ts"],
    "react": ["react.js", "reactjs"],
    "testing": ["jest", "vitest", "frontend testing"],
    "rest": ["rest api", "restful"],
    "postgres": ["postgresql"],
}
for group, items in SKILL_GROUPS.items():
    for sid, name in items:
        skills.append(
            {
                "id": sid,
                "name": name,
                "normalized_name": name.lower(),
                "category": group,
                "competency": group,
                "esco_id": None,
                "aliases": [sid, name.lower()] + aliases.get(sid, []),
            }
        )
catalog = {s["id"]: s for s in skills}
careers = []
definitions = [
    (
        "frontend",
        "Frontend Developer",
        "Software Development",
        8,
        ["html", "css", "javascript", "react", "nextjs", "git", "typescript", "testing"],
    ),
    (
        "backend",
        "Backend Developer",
        "Software Development",
        6,
        ["node", "sql", "git", "rest", "python"],
    ),
    (
        "fullstack",
        "Full-stack Developer",
        "Software Development",
        4,
        ["javascript", "react", "node", "sql", "git", "typescript"],
    ),
    (
        "software",
        "Software Engineer",
        "Software Development",
        5,
        ["java", "oop", "git", "testing", "sql"],
    ),
    ("analyst", "Data Analyst", "Data", 6, ["sql", "excel", "powerbi", "statistics", "python"]),
    ("scientist", "Data Scientist", "Data", 4, ["python", "statistics", "ml", "pandas", "sql"]),
    ("data-engineer", "Data Engineer", "Data", 4, ["python", "sql", "etl", "postgres", "aws"]),
    (
        "ai",
        "AI Engineer",
        "Artificial Intelligence",
        4,
        ["python", "ml", "pytorch", "rest", "docker"],
    ),
    (
        "ml-engineer",
        "Machine Learning Engineer",
        "Artificial Intelligence",
        4,
        ["python", "ml", "tensorflow", "statistics", "docker"],
    ),
    ("devops", "DevOps Engineer", "Infrastructure", 3, ["linux", "docker", "cicd", "aws", "git"]),
    (
        "cloud",
        "Cloud Engineer",
        "Infrastructure",
        3,
        ["aws", "terraform", "linux", "networking", "docker"],
    ),
    (
        "security",
        "Cybersecurity Analyst",
        "Cybersecurity",
        5,
        ["security", "siem", "networking", "linux", "incident"],
    ),
]
alex = {
    "name": "Alex",
    "university": "Chulalongkorn University",
    "field": "Computer Engineering",
    "degree": "Bachelor",
    "graduation_year": 2027,
    "skills": [
        {"skill_id": sid, "proficiency": level, "source": "resume"}
        for sid, level in [
            ("html", 3),
            ("css", 3),
            ("javascript", 2),
            ("git", 2),
            ("nextjs", 2),
            ("react", 1),
            ("sql", 1),
        ]
    ],
    "education": [
        {
            "institution": "Chulalongkorn University",
            "degree": "Bachelor",
            "field": "Computer Engineering",
            "start_year": 2023,
            "end_year": 2027,
            "enrolled": True,
        }
    ],
    "experiences": [
        {
            "organization": "Campus Digital Studio",
            "role": "Web Development Intern",
            "start": "2025-06",
            "end": "2025-08",
            "description": "Built accessible web interfaces and collaborated on a student services application.",
            "skills": ["html", "css", "javascript", "git", "nextjs"],
        }
    ],
    "projects": [
        {
            "name": "Room Booking System",
            "description": "A campus booking experience with room availability and responsive reservation forms.",
            "stack": ["Next.js", "JavaScript", "SQL"],
            "project_type": "University",
        },
        {
            "name": "Personal Portfolio Website",
            "description": "A responsive portfolio highlighting projects and internship experience.",
            "stack": ["HTML", "CSS", "JavaScript"],
            "project_type": "Personal",
        },
        {
            "name": "Web Application Project",
            "description": "A collaborative student application using reusable UI components.",
            "stack": ["React", "Git"],
            "project_type": "Team",
        },
    ],
    "certifications": [],
}
improved = {
    **alex,
    "skills": alex["skills"]
    + [{"skill_id": "typescript", "proficiency": 2, "source": "demo_learning"}],
}
companies = [
    "NovaTech",
    "Orbit Labs",
    "ByteWorks",
    "BluePeak",
    "Nexa Systems",
    "DataForge",
    "CloudGrid",
    "Vertex Labs",
]
jobs = []
rng = random.Random(48)
targets = [(87, 92), (82, 89), (80, 87), (77, 85), (76, 84), (75, 82), (74, 81), (73, 80)]
for cid, name, group, n, base in definitions:
    careers.append(
        {
            "id": cid,
            "name": name,
            "group": group,
            "description": {
                "Software Development": "Build useful software and thoughtful digital experiences.",
                "Data": "Turn data into clarity, decisions, and reliable systems.",
                "Artificial Intelligence": "Create intelligent systems grounded in data.",
                "Infrastructure": "Keep modern systems reliable, scalable, and connected.",
                "Cybersecurity": "Protect systems and investigate emerging threats.",
            }[group],
        }
    )
    for i in range(n):
        job = {
            "id": f"{cid}-{i + 1:02}",
            "career_id": cid,
            "occupation_id": f"occ-{cid}",
            "company": companies[i % 8],
            "title": (
                "Frontend Developer Intern" if cid == "frontend" and i == 0 else f"Junior {name}"
            ),
            "location": ["Bangkok, Thailand", "Remote · Thailand", "Bangkok · Hybrid"][i % 3],
            "employment_type": "Internship" if i == 0 else "Full-time",
            "experience_level": "Intern" if i == 0 else "Entry level",
            "experience_months": 3 if cid == "frontend" else [0, 3, 6, 12][i % 4],
            "education_level": "Bachelor",
            "education_fields": [
                "Computer Engineering",
                "Computer Science",
                "Software Engineering",
                "Information Technology",
            ],
            "accepts_enrolled": True,
            "source_type": "fictional_demo",
            "description": f"Join {companies[i % 8]} to build practical solutions with a supportive engineering team. Work on real-world project scenarios, collaborate through code reviews, and develop your {name.lower()} skills. This is a fictional position created for the competition demo.",
        }
        if cid == "frontend":
            before, after = targets[i]
            for attempt in range(300000):
                req = []
                for sid in base:
                    req.append(
                        {
                            "skill_id": sid,
                            "requirement_type": "required" if rng.random() < 0.65 else "preferred",
                            "importance": rng.choice(["low", "medium", "high"]),
                            "minimum_proficiency": 2
                            if sid in ["typescript", "testing"]
                            else rng.choice([1, 2]),
                        }
                    )
                # TypeScript should have higher aggregate priority than testing before improvement.
                if next(r for r in req if r["skill_id"] == "typescript")["importance"] == "low":
                    continue
                priority = lambda r: {"low": 1, "medium": 2, "high": 3}[r["importance"]] * (
                    1 if r["requirement_type"] == "required" else 0.5
                )
                if priority(next(r for r in req if r["skill_id"] == "testing")) > priority(
                    next(r for r in req if r["skill_id"] == "typescript")
                ):
                    continue
                job["requirements"] = req
                a, b = match(alex, job, catalog), match(improved, job, catalog)
                if a["score"] == before and b["score"] == after:
                    break
            else:
                raise RuntimeError(f"Could not calibrate {i}")
        else:
            job["requirements"] = [
                {
                    "skill_id": sid,
                    "requirement_type": "required" if k < 3 else "preferred",
                    "importance": "critical" if k == 0 else "high" if k == 1 else "medium",
                    "minimum_proficiency": 1 if i == 0 else 2,
                }
                for k, sid in enumerate(base)
            ]
        jobs.append(job)
resources = []
for sid, title, typ, hours in [
    ("typescript", "TypeScript Fundamentals", "Guided practice", "6 hours"),
    ("testing", "Frontend Testing Fundamentals", "Workshop", "5 hours"),
    ("react", "React Component Patterns", "Mini project", "8 hours"),
] + [
    (s["id"], f"{s['name']} Foundations", "Guided practice", "6 hours")
    for s in skills
    if s["id"] not in ["typescript", "testing", "react"]
]:
    resources.append(
        {
            "id": f"learn-{sid}",
            "skill_id": sid,
            "title": title,
            "resource_type": typ,
            "duration": hours,
            "description": f"A curated demo learning activity to build practical confidence in {catalog[sid]['name']}.",
            "outcome_level": 2,
            "steps": [
                f"Review the core concepts of {catalog[sid]['name']}.",
                "Apply the concepts in a small working example.",
                "Document what you learned and add evidence to your profile.",
            ],
        }
    )
data = {
    "version": "2026.10-demo-v1",
    "skills": skills,
    "careers": careers,
    "jobs": jobs,
    "resources": resources,
    "alex": alex,
}
front = [j for j in jobs if j["career_id"] == "frontend"]
a, b = analyze(alex, front, catalog), analyze(improved, front, catalog)
assert (a["readiness"], b["readiness"]) == (78, 85), (a["readiness"], b["readiness"])
assert a["gaps"][0]["skill_id"] == "typescript", a["gaps"]
assert b["gaps"][0]["skill_id"] == "testing", b["gaps"]
Path("database/seeds").mkdir(exist_ok=True)
Path("database/seeds/demo.json").write_text(json.dumps(data, indent=2), encoding="utf-8")
print(
    {
        "jobs": len(jobs),
        "readiness": [a["readiness"], b["readiness"]],
        "top": [a["jobs"][0]["score"], b["jobs"][0]["score"]],
    }
)
