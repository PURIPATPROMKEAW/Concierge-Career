# Matching engine

The engine consumes canonical skills/proficiency, normalized requirements, relevant experience dates, education and competency mappings. Career interest selects the job set; it does not inflate scores. These are rule-based alignment measures, not hiring-outcome predictions.

## Job score

- Levels: Beginner 1, Intermediate 2, Advanced 3, absent 0.
- Satisfaction: `min(current / expected, 1)`.
- Importance: low 1, medium 2, high 3, critical 4.
- Required/preferred components: separate importance-weighted satisfaction means × 100.
- Experience: `min(relevant non-overlapping months / required months, 1) × 100`. Relevant records share a skill with the job; calendar months are inclusive, overlap counts once.
- Education: 100 if an education record satisfies degree rank, accepted field (case-insensitive exact match), and enrollment policy; otherwise 0. Empty accepted fields mean any field.
- Competency: proportion of the job's competency groups represented by a user skill. This measures breadth, not independent proficiency evidence.

Weights: required 50%, preferred 15%, experience 15%, education 10%, competency 10%. Components without requirements are omitted and remaining weights renormalized. No components yields zero.

An absent critical required skill caps the score at 69. Partial critical skills lower satisfaction but do not trigger this absence cap. Retain unrounded scores, display half-up rounding, and assign states from displayed integers:

| Score | State |
| --- | --- |
| 85–100 | READY TO APPLY |
| 70–84 | STRONG MATCH |
| 50–69 | PREPARE FIRST |
| 0–49 | LOW ALIGNMENT |

Rank by descending unrounded score, then stable job ID. The UI shows effective weights, component values, matched/partial/missing skills and critical caps.

## Career aggregation

Readiness is the half-up rounded arithmetic mean of all unrounded scores in the selected career. Empty selection yields zero and no recommendations. Strong alignment-or-better includes scores ≥70; ready-to-apply is the subset ≥85.

Demand = distinct jobs listing a skill / category jobs × 100. Required/preferred occurrences both count once per job. The calibrated eight-role Frontend seed shares eight core technologies with varying levels/importance/status, so those frequencies are 100%. They describe this seed, not the wider labor market.

## Priority and learning

For each unsatisfied requirement: `(1 - satisfaction) × importance × type_factor`, where required = 1 and preferred = 0.5. Sum by skill and divide by the category's total job count. This includes frequency, strength and deficit. High ≥1, Medium ≥0.4, otherwise Low.

Target proficiency is the highest unmet expectation for that skill. Break ties by the number of jobs that would move from <85 to ≥85 if only that skill reached target, then skill ID. Unlock counts are requirement alignment counterfactuals, not interview predictions.

Learning joins canonical skill IDs and follows gap order. Alternatives apply the identical engine to every other career, returning the four highest readiness values with explanations.

## Exact demo calibration

`database/build_seed.py` authors fictional requirements using a fixed random seed and asserts the agreed rounded outcomes. It never runs during analysis. Runtime `matching.py` has no Alex-specific overrides.

| State | Readiness | Best job | First gap |
| --- | ---: | ---: | --- |
| Initial Alex | 78 | 87 | TypeScript |
| Intermediate TypeScript | 85 | 92 | Frontend Testing |

Regression tests cover exact values, deterministic repeats, partial skills, critical caps, missing components, stable ties, empty categories, demand denominators, overlap deduplication, improvement, and repeat-safe completion.
