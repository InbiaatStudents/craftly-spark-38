import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, SkipForward } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (personalContext: string) => void;
  projectType: string;
}

const QUESTIONS_BY_TYPE: Record<string, { intro: string; prompts: string[] }> = {
  portfolio: {
    intro: "Let's make this a real portfolio — not a template. Drop links or a quick bio and I'll bake your actual wins into the page.",
    prompts: [
      "LinkedIn / GitHub / X / personal site URLs",
      "2–3 projects you're proudest of (name + 1-line outcome)",
      "Your role, years of experience, key tech stack",
    ],
  },
  startup: {
    intro: "Tell me about the company so the copy isn't generic SaaS-speak.",
    prompts: [
      "Founders & team — names, roles, any notable past companies",
      "Real traction (users, revenue, partners) you're comfortable sharing",
      "1-line on the unfair advantage / why now",
    ],
  },
  product: {
    intro: "Give me the real product details so we replace 'Lorem ipsum' with concrete benefits.",
    prompts: [
      "Top 3 benefits (outcomes for the user, not features)",
      "Pricing model and any real numbers",
      "1–2 real customer quotes or use cases",
    ],
  },
  personal: {
    intro: "Help me make this feel like *you*, not a template.",
    prompts: [
      "Links: LinkedIn / GitHub / X / blog",
      "What you're working on now",
      "One thing people often ask you about",
    ],
  },
};

export default function OnboardingChat({ open, onClose, onSubmit, projectType }: Props) {
  const [urls, setUrls] = useState("");
  const [bio, setBio] = useState("");
  const [extras, setExtras] = useState("");

  const config = QUESTIONS_BY_TYPE[projectType] || QUESTIONS_BY_TYPE.startup;

  const handleContinue = () => {
    const parts: string[] = [];
    if (urls.trim()) parts.push(`Profile links: ${urls.trim()}`);
    if (bio.trim()) parts.push(`Bio / about: ${bio.trim()}`);
    if (extras.trim()) parts.push(`Additional context: ${extras.trim()}`);
    onSubmit(parts.join("\n\n"));
  };

  const handleSkip = () => {
    onSubmit("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick interview — make it real
          </DialogTitle>
          <DialogDescription>{config.intro}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{config.prompts[0]}</label>
            <Input
              placeholder="https://linkedin.com/in/... , https://github.com/..."
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{config.prompts[1]}</label>
            <Textarea
              placeholder="Paste a short bio, project list, or About Me text..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{config.prompts[2] ?? "Anything else?"}</label>
            <Textarea
              placeholder="Optional — anything else that should appear on the page"
              value={extras}
              onChange={(e) => setExtras(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <Button variant="ghost" onClick={handleSkip}>
            <SkipForward className="mr-1.5 h-4 w-4" />
            Skip — use placeholders
          </Button>
          <Button onClick={handleContinue}>
            Generate with my info
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
