class MockAIProvider:
    def recommend(self, missing: list[str]) -> dict[str, str]:
        if not missing:
            return {
                "title": "Prepare your portfolio",
                "reason": "You cover the sample role requirements. Collect evidence of your work before applying.",
                "skill": "Portfolio",
            }
        skill = missing[0]
        return {
            "title": f"Build your first {skill} project",
            "reason": f"{skill} is the missing requirement in your sample target role. Build a small portfolio project to practise it.",
            "skill": skill,
        }
