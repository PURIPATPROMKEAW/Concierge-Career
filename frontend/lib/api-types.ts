import type {
  ProfileOutput,
  SkillOutput,
  CareerOutput,
  JobMatchOutput,
  GapOutput,
  AnalysisOutput,
  LearningOutput,
  AlternativeOutput,
  ProgressOutput,
} from "./api.generated";
export type Skill = SkillOutput;
export type Career = CareerOutput;
export type Job = JobMatchOutput;
export type Gap = GapOutput;
export type Analysis = AnalysisOutput;
export type Resource = LearningOutput;
export type Alternative = AlternativeOutput;
export type Profile = Omit<ProfileOutput, "id" | "revision"> & {
  id?: string;
  revision?: number;
};
export type UserSkill = Profile["skills"][number];
export type ProgressResult = Omit<ProgressOutput, "profile"> & {
  profile: Profile;
};
