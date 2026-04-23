import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (personalContext: string) => void;
  projectType: string;
}

const QUESTIONS_BY_TYPE: Record<string, { intro: string; prompts: string[] }> = {
  portfolio: {
    intro: "30 seconds. Drop links and we'll bake your real wins in — no Lorem Ipsum, no fake clients.",
    prompts: [
      "LinkedIn / GitHub / X / personal site",
      "2–3 projects you're proudest of (name + 1-line outcome)",
      "Role, years of experience, key stack",
    ],
  },
  startup: {
    intro: "So the copy isn't generic SaaS-speak. The more specific, the less template-y the output.",
    prompts: [
      "Founders & team — names, roles, notable past companies",
      "Real traction (users, revenue, partners) you'd happily share publicly",
      "Why now — your unfair advantage in one line",
    ],
  },
  product: {
    intro: "Real product details replace placeholder copy with concrete benefits.",
    prompts: [
      "Top 3 outcomes for the user (not features)",
      "Pricing model and any real numbers",
      "1–2 real customer quotes or use cases",
    ],
  },
  personal: {
    intro: "Make it feel like you, not a template.",
    prompts: [
      "LinkedIn / GitHub / X / blog",
      "What you're working on now",
      "What people often ask you about",
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

  const handleSkip = () => onSubmit("");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-none border-foreground/10">
        <DialogHeader className="space-y-3">
          <p className="eyebrow">03 / interview</p>
          <DialogTitle className="font-display text-3xl leading-tight">
            One quick pass before we ship.
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">{config.intro}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          <div className="space-y-1.5">
            <label className="eyebrow">{config.prompts[0]}</label>
            <Input
              placeholder="https://linkedin.com/in/… , https://github.com/…"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="eyebrow">{config.prompts[1]}</label>
            <Textarea
              placeholder="Paste a short bio, project list, or About section…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <label className="eyebrow">{config.prompts[2] ?? "Anything else?"}</label>
            <Textarea
              placeholder="Optional — anything else worth surfacing"
              value={extras}
              onChange={(e) => setExtras(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-2 border-t border-border">
          <Button variant="ghost" onClick={handleSkip} className="text-xs text-muted-foreground">
            Skip — use placeholders
          </Button>
          <Button onClick={handleContinue} className="rounded-none">
            Ship it
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
