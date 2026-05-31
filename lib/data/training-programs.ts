export type TrainingProgramType = "course" | "event" | "workshop";

export type PublicTrainingProgram = {
  id: string;
  title: string;
  program_type: TrainingProgramType;
  description: string | null;
  cover_url: string | null;
  event_start_at: string | null;
  event_end_at: string | null;
  location: string | null;
  instructor: string | null;
  highlights: string[];
  cta_label: string;
  cta_url: string;
  sort_order: number;
};
