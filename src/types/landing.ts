export type ProjectType = "portfolio" | "startup" | "product" | "personal";
export type StylePreference = "minimal" | "dark" | "colorful";
export type PageGoal = "hire" | "sell" | "collect-emails" | "impress" | "inform";
export type EmotionalTone = "trust" | "excitement" | "authority" | "warmth" | "urgency";
export type ExportFormat = "html" | "react" | "nextjs" | "tailwind" | "ai-plugin";

export interface GenerationRequest {
  projectType: ProjectType;
  title: string;
  description: string;
  style: StylePreference;
  primaryColor: string;
  pageGoal: PageGoal;
  targetAudience: string;
  emotionalTone: EmotionalTone;
  animationIntensity: number; // 0-100
  layoutComplexity: number; // 0-100
  modernLevel: number; // 0-100
  experimentalMode: boolean;
  productionMode: boolean;
}

export interface HistoryEntry {
  id: string;
  projectType: ProjectType;
  title: string;
  style: StylePreference;
  primaryColor: string;
  html: string;
  createdAt: string;
}
