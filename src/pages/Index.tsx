import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import anime from "animejs";
import { ArrowRight, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import ColorPicker from "@/components/ColorPicker";
import OnboardingChat from "@/components/OnboardingChat";
import { saveToHistory } from "@/lib/history";
import type { ProjectType, StylePreference, PageGoal, EmotionalTone } from "@/types/landing";
import { supabase } from "@/integrations/supabase/client";

const SLIDER_LABELS: Record<string, string[]> = {
  animation: ["Subtle", "Balanced", "Bold", "Experimental"],
  layout: ["Simple", "Structured", "Asymmetric", "Editorial grid"],
  modern: ["Safe", "Modern", "Trendy", "Futuristic"],
};

function sliderLabel(key: string, value: number) {
  const labels = SLIDER_LABELS[key];
  const idx = Math.min(Math.floor(value / 26), labels.length - 1);
  return labels[idx];
}

const TONE_OPTIONS: { value: EmotionalTone; label: string }[] = [
  { value: "trust", label: "Trust" },
  { value: "excitement", label: "Excitement" },
  { value: "authority", label: "Authority" },
  { value: "warmth", label: "Warmth" },
  { value: "urgency", label: "Urgency" },
];

export default function Index() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  const [projectType, setProjectType] = useState<ProjectType>("startup");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<StylePreference>("minimal");
  const [primaryColor, setPrimaryColor] = useState("#b85c2a");
  const [pageGoal, setPageGoal] = useState<PageGoal>("sell");
  const [targetAudience, setTargetAudience] = useState("");
  const [emotionalTones, setEmotionalTones] = useState<EmotionalTone[]>(["trust"]);
  const [animationIntensity, setAnimationIntensity] = useState(40);
  const [layoutComplexity, setLayoutComplexity] = useState(50);
  const [modernLevel, setModernLevel] = useState(60);
  const [experimentalMode, setExperimentalMode] = useState(false);
  const [productionMode, setProductionMode] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (heroRef.current) {
      anime({
        targets: heroRef.current.querySelectorAll(".reveal"),
        opacity: [0, 1],
        translateY: [12, 0],
        delay: anime.stagger(70),
        duration: 700,
        easing: "easeOutQuart",
      });
    }
  }, []);

  const toggleTone = (tone: EmotionalTone) => {
    setEmotionalTones((prev) =>
      prev.includes(tone) ? prev.filter((t) => t !== tone) : [...prev, tone],
    );
  };

  const handleGenerateClick = () => {
    if (!title.trim()) {
      toast({ title: "Add a title before we ship.", variant: "destructive" });
      return;
    }
    if (emotionalTones.length === 0) {
      toast({ title: "Pick at least one tone.", variant: "destructive" });
      return;
    }
    setShowOnboarding(true);
  };

  const runGeneration = async (personalContext: string) => {
    setShowOnboarding(false);
    setLoading(true);
    try {
      const body = {
        projectType, title, description, style, primaryColor,
        pageGoal, targetAudience, emotionalTones,
        animationIntensity, layoutComplexity, modernLevel,
        experimentalMode, productionMode,
        personalContext,
      };
      const { data, error } = await supabase.functions.invoke("generate-landing", { body });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const html = data.html as string;
      const id = crypto.randomUUID();

      saveToHistory({
        id, projectType, title, style, primaryColor, html,
        createdAt: new Date().toISOString(),
      });

      sessionStorage.setItem(
        "landingcraft-result",
        JSON.stringify({ id, html, title, projectType, style, primaryColor }),
      );
      navigate("/result");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed.";
      console.error(err);
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div className="container max-w-6xl px-6 pt-16 pb-24 md:pt-24">
        {/* Editorial header — asymmetric, left-aligned, serif display */}
        <div ref={heroRef} className="grid grid-cols-12 gap-6 mb-20 md:mb-28">
          <div className="col-span-12 md:col-span-8">
            <p className="reveal eyebrow mb-6">Issue 04 — landing pages with taste</p>
            <h1 className="reveal font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6">
              Landing pages,<br />
              <em className="text-primary">composed</em> not generated.
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 md:pt-4">
            <p className="reveal text-base md:text-[15px] text-muted-foreground leading-relaxed max-w-xs">
              Most AI builders ship templates. We ship art-directed pages — real copy,
              real forms, working anchors, and zero stock-photo grin.
            </p>
            <div className="reveal mt-6 flex items-center gap-4 text-xs text-muted-foreground tabular">
              <span><span className="text-foreground font-medium">2,847</span> pages shipped</span>
              <span className="text-border">·</span>
              <span><span className="text-foreground font-medium">94%</span> kept first draft</span>
            </div>
          </div>
        </div>

        {/* Form — flat, no border, just whitespace and hairlines */}
        <div className="grid grid-cols-12 gap-6 md:gap-12">
          {/* Left rail — section label */}
          <aside className="col-span-12 md:col-span-3 md:sticky md:top-24 md:self-start">
            <p className="eyebrow">01 / brief</p>
            <p className="font-display text-3xl mt-2 leading-tight">
              Tell us what<br />you're building.
            </p>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              The more specific you are, the less generic the output.
              Vague briefs make vague pages.
            </p>
          </aside>

          {/* Form column */}
          <div className="col-span-12 md:col-span-9 space-y-10">
            {/* Project type & title — paired */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="eyebrow">Project</Label>
                <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portfolio">Portfolio</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="product">Product page</SelectItem>
                    <SelectItem value="personal">Personal site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="eyebrow">Working title</Label>
                <Input
                  placeholder="Northwind Studio, Heron CRM, Margot Bell — design"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="eyebrow">What is it, in plain English</Label>
              <Textarea
                placeholder="Skip the marketing copy. Just say what it does and who it's for."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="hairline" />

            {/* Goal & audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="eyebrow">Page goal</Label>
                <Select value={pageGoal} onValueChange={(v) => setPageGoal(v as PageGoal)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hire">Get hired</SelectItem>
                    <SelectItem value="sell">Sell something</SelectItem>
                    <SelectItem value="collect-emails">Collect emails</SelectItem>
                    <SelectItem value="impress">Impress visitors</SelectItem>
                    <SelectItem value="inform">Inform / educate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="eyebrow">Audience</Label>
                <Input
                  placeholder="Series-A founders, recruiters at design agencies…"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>

            {/* Tones — multi-select */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Label className="eyebrow">Emotional tones — pick any</Label>
                <span className="text-[11px] text-muted-foreground tabular">
                  {emotionalTones.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((t) => {
                  const active = emotionalTones.includes(t.value);
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => toggleTone(t.value)}
                      className={`px-3 py-1.5 text-sm border transition-all ${
                        active
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-foreground border-border hover:border-foreground/40"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hairline" />

            {/* Style + color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="eyebrow">Style</Label>
                <ToggleGroup
                  type="single"
                  value={style}
                  onValueChange={(v) => v && setStyle(v as StylePreference)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="minimal" className="px-4">Minimal</ToggleGroupItem>
                  <ToggleGroupItem value="dark" className="px-4">Dark</ToggleGroupItem>
                  <ToggleGroupItem value="colorful" className="px-4">Colorful</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-2">
                <Label className="eyebrow">Primary color</Label>
                <ColorPicker value={primaryColor} onChange={setPrimaryColor} />
              </div>
            </div>

            <div className="hairline" />

            {/* Advanced */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left group"
            >
              <span>
                <p className="eyebrow">02 / direction</p>
                <p className="font-display text-2xl mt-1">Fine-tune the feel</p>
              </span>
              {showAdvanced ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition" />
              )}
            </button>

            {showAdvanced && (
              <div className="space-y-8 animate-fade-in">
                {[
                  { key: "animation", label: "Animation intensity", value: animationIntensity, set: setAnimationIntensity },
                  { key: "layout", label: "Layout complexity", value: layoutComplexity, set: setLayoutComplexity },
                  { key: "modern", label: "Modernity", value: modernLevel, set: setModernLevel },
                ].map((s) => (
                  <div key={s.key} className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <Label className="text-sm font-medium">{s.label}</Label>
                      <span className="text-xs text-muted-foreground tabular">
                        {sliderLabel(s.key, s.value)} · {s.value}
                      </span>
                    </div>
                    <Slider
                      value={[s.value]}
                      onValueChange={([v]) => s.set(v)}
                      max={100}
                      step={1}
                    />
                  </div>
                ))}

                <div className="hairline" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <Switch checked={experimentalMode} onCheckedChange={setExperimentalMode} />
                    <span>
                      <p className="text-sm font-medium">Experimental mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Bigger swings — brutalist accents, oversized type, kinetic motion.
                      </p>
                    </span>
                  </label>
                  <label className="flex items-start gap-4 cursor-pointer">
                    <Switch checked={productionMode} onCheckedChange={setProductionMode} />
                    <span>
                      <p className="text-sm font-medium">Production mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        SEO, OpenGraph, JSON-LD, ARIA, optimised assets.
                      </p>
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="hairline" />

            {/* CTA */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Next step: a 30-second interview to replace placeholder copy with your actual story.
              </p>
              <Button
                onClick={handleGenerateClick}
                disabled={loading}
                size="lg"
                className="rounded-none px-6 h-12 text-sm font-medium tracking-wide"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Composing
                  </>
                ) : (
                  <>
                    Continue to interview
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <OnboardingChat
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSubmit={runGeneration}
        projectType={projectType}
      />
    </div>
  );
}
