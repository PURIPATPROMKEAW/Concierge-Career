"""Curated fictional roles and tasks. Baseline verified before applying v2."""

ROLES = {
    "frontend": "Build accessible screens, interactive forms, and responsive interfaces. Example: a room-booking dashboard.",
    "backend": "Design APIs, validate requests, and store reliable data. Example: booking endpoints and transactions.",
    "fullstack": "Connect interfaces, APIs, and databases. Example: an end-to-end reservation feature.",
    "software": "Design maintainable application logic and tests. Example: a reusable scheduling module.",
    "analyst": "Clean business data and communicate patterns. Example: reporting room usage and peak hours.",
    "scientist": "Explore data and evaluate predictive models. Example: forecasting booking demand with uncertainty.",
    "data-engineer": "Build pipelines and dependable datasets. Example: loading reservation events into a warehouse.",
    "ai": "Integrate model capabilities into evaluated applications. Example: a help assistant with structured responses.",
    "ml-engineer": "Train, deploy, and monitor models. Example: a demand prediction service with drift checks.",
    "devops": "Automate delivery and improve reliability. Example: a tested deployment pipeline with monitoring.",
    "cloud": "Design cloud networks, compute, and storage. Example: a secure, cost-aware booking service.",
    "security": "Investigate threats and reduce risks. Example: detecting suspicious booking access and planning a response.",
}
TASKS = {
    "typescript": "Convert the Room Booking form to TypeScript with typed room, date, and reservation fields",
    "testing": "Test duplicate reservations, invalid dates, and a successful Room Booking submission",
    "react": "Split Room Booking into controlled React components with reusable validation state",
    "html": "Add semantic labels, fieldsets, and keyboard controls to the Room Booking form",
    "css": "Make the Personal Portfolio layout work at 320px and 1440px without hiding content",
    "javascript": "Validate booking dates and display useful errors before form submission",
    "nextjs": "Add a booking detail route with loading and not-found states",
    "git": "Use a feature branch to review and resolve a booking-form merge conflict",
    "rest": "Design booking API responses for successful requests, missing rooms, and overlapping dates",
    "node": "Implement a validated booking endpoint in Node.js",
    "python": "Clean a synthetic booking CSV and summarize reservations by weekday",
    "java": "Model rooms and reservations as Java classes with validation methods",
    "oop": "Separate booking availability rules from persistence using interfaces",
    "sql": "Query available rooms, reservation totals, and overlapping bookings",
    "postgres": "Create PostgreSQL room and booking tables with foreign keys and a transaction",
    "excel": "Build a pivot table showing peak hours from synthetic booking records",
    "powerbi": "Create a room-utilization report with date and location filters",
    "etl": "Build a repeatable validation and loading pipeline for booking events",
    "statistics": "Compare weekday booking averages and explain a confidence interval",
    "pandas": "Clean missing dates and duplicate rows in a booking dataset with Pandas",
    "ml": "Evaluate a booking-demand baseline on a held-out time period",
    "tensorflow": "Compare a small TensorFlow demand model with a simple baseline",
    "pytorch": "Build a PyTorch training loop with a separate validation set",
    "linux": "Inspect booking service logs, processes, and file permissions",
    "docker": "Containerize a booking API and verify its health endpoint",
    "aws": "Sketch AWS hosting for the booking app with access rules and cost assumptions",
    "cicd": "Test the booking API before building a deployment artifact in CI",
    "terraform": "Describe a booking-service environment using reusable Terraform variables",
    "networking": "Trace a booking request through DNS, HTTPS, and the application service",
    "security": "Threat-model the booking form and propose controls for three concrete risks",
    "siem": "Detect repeated failed booking access in synthetic log records",
    "incident": "Write a timeline and containment plan for synthetic suspicious booking activity",
}


def enrich(data):
    for c in data["careers"]:
        c["description"] = ROLES[c["id"]]
    for i, j in enumerate(data["jobs"]):
        req = j["requirements"]
        if j["career_id"] == "frontend" and i % 3 != 0:
            for r in req:
                if r["skill_id"] == ("css" if i % 3 == 1 else "html"):
                    r["skill_id"] = "sql"
                    r["minimum_proficiency"] = 1
        elif j["career_id"] != "frontend" and len(req) > 3 and i % 3 != 0:
            req.pop(-1 if i % 3 == 1 else -2)
        j["description"] = (
            ROLES[j["career_id"]]
            + f" Collaborate with {j['company']} on this fictional demo position."
        )
    for r in data["resources"]:
        r["description"] = TASKS[r["skill_id"]] + "."
        r["steps"] = [
            r["description"],
            "Show one successful example and one edge case in your demo project.",
            "Record the result, explain your choices, and add evidence to your portfolio.",
        ]
    data["version"] = "2026.10-demo-v2"
