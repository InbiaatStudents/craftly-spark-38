export type ProjectType = "portfolio" | "startup" | "product" | "personal";
export type StylePreference = "minimal" | "dark" | "colorful";

export interface GenerationRequest {
  projectType: ProjectType;
  title: string;
  description: string;
  style: StylePreference;
  primaryColor: string;
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
