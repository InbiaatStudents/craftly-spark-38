import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import anime from "animejs";
import { Sparkles, Loader2, Beaker, Shield, ChevronDown, ChevronUp, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import ColorPicker from "@/components/ColorPicker";
import FloatingShapes from "@/components/FloatingShapes";
import OnboardingModal, { type ScrapedProfileData } from "@/components/OnboardingModal";
import WebGLBackground from "@/components/WebGLBackground";
import { saveToHistory } from "@/lib/history";
import type { ProjectType, StylePreference, PageGoal, EmotionalTone, GenerationRequest } from "@/types/landing";
import { supabase } from "@/integrations/supabase/client";

const SLIDER_LABELS: Record<string, string[]> = {
  animation: ["Subtle", "Balanced", "Bold", "Experimental"],
  layout: ["Simple", "Structured", "Asymmetric", "Creative Grid"],
  modern: ["Safe", "Modern", "Trendy", "Futuristic"],
};

function sliderLabel(key: string, value: number) {
  const labels = SLIDER_LABELS[key];
  const idx = Math.min(Math.floor(value / 26), labels.length - 1);
  return labels[idx];
}

export default function Index() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [projectType, setProjectType] = useState<ProjectType>("startup");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<StylePreference>("minimal");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [pageGoal, setPageGoal] = useState<PageGoal>("sell");
  const [targetAudience, setTargetAudience] = useState("");
  const [emotionalTone, setEmotionalTone] = useState<EmotionalTone>("trust");
  const [animationIntensity, setAnimationIntensity] = useState(40);
  const [layoutComplexity, setLayoutComplexity] = useState(30);
  const [modernLevel, setModernLevel] = useState(50);
  const [experimentalMode, setExperimentalMode] = useState(false);
  const [productionMode, setProductionMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileData, setProfileData] = useState<ScrapedProfileData | null>(null);
  const [useWebGL, setUseWebGL] = useState(true);

  useEffect(() => {
    if (heroRef.current) {
      anime({
        targets: heroRef.current.querySelectorAll(".hero-anim"),
        opacity: [0, 1],
        translateY: [30, 0],
        delay: anime.stagger(120),
        duration: 800,
        easing: "easeOutCubic",
      });
    }
    if (formRef.current) {
      anime({
        targets: formRef.current,
        opacity: [0, 1],
        scale: [0.96, 1],
        duration: 600,
        delay: 400,
        easing: "easeOutCubic",
      });
    }
  }, []);

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const body: GenerationRequest & { profileData?: ScrapedProfileData } = {
        projectType, title, description, style, primaryColor,
        pageGoal, targetAudience, emotionalTone,
        animationIntensity, layoutComplexity, modernLevel,
        experimentalMode, productionMode,
        profileData: profileData || undefined,
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

      sessionStorage.setItem("landingcraft-result", JSON.stringify({ id, html, title, projectType, style, primaryColor }));
      navigate("/result");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Generation failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileScraped = (data: ScrapedProfileData) => {
    setProfileData(data);
    // Auto-fill title with name if available and title is empty
    if (data.name && !title) {
      setTitle(data.name);
    }
  };

  // Show onboarding prompt for portfolio/personal projects
  const shouldShowOnboardingPrompt = (projectType === "portfolio" || projectType === "personal") && !profileData;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center px-4 py-12 md:py-20">
      {useWebGL ? (
        <WebGLBackground primaryColor={primaryColor} />
      ) : (
        <FloatingShapes />
      )}
      
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onProfileScraped={handleProfileScraped}
        projectType={projectType}
      />

      <div ref={heroRef} className="max-w-2xl text-center mb-12 space-y-4">
        <h1 className="hero-anim text-4xl md:text-6xl font-extrabold tracking-tight">
          Generate{" "}
          <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Stunning
          </span>{" "}
          Landing Pages
        </h1>
        <p className="hero-anim text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
          Describe your project and let AI craft a modern, animated landing page ready to deploy.
        </p>
      </div>

      <div ref={formRef} className="w-full max-w-xl">
        <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8 space-y-6">
            {/* Project Type */}
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="product">Product Landing Page</SelectItem>
                  <SelectItem value="personal">Personal Profile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Profile Import for Portfolio/Personal */}
            {shouldShowOnboardingPrompt && (
              <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Building a {projectType}? Import your profile to replace placeholder content with your real information.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOnboarding(true)}
                  className="w-full"
                >
                  <User className="mr-2 h-4 w-4" />
                  Import from LinkedIn, GitHub, or X
                </Button>
              </div>
            )}

            {/* Profile Status */}
            {profileData && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  Profile imported: {profileData.name || "Profile data"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOnboarding(true)}
                  className="ml-auto h-6 text-xs"
                >
                  Edit
                </Button>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. Acme SaaS Platform" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Briefly describe your project, audience, and key features..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Page Goal */}
            <div className="space-y-2">
              <Label>Page Goal</Label>
              <Select value={pageGoal} onValueChange={(v) => setPageGoal(v as PageGoal)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hire">Get hired / Attract recruiters</SelectItem>
                  <SelectItem value="sell">Sell a product or service</SelectItem>
                  <SelectItem value="collect-emails">Collect emails / Build a list</SelectItem>
                  <SelectItem value="impress">Impress visitors / Showcase work</SelectItem>
                  <SelectItem value="inform">Inform / Educate audience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input
                placeholder="e.g. SaaS founders, tech recruiters, design agencies..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            {/* Emotional Tone */}
            <div className="space-y-2">
              <Label>Emotional Tone</Label>
              <ToggleGroup type="single" value={emotionalTone} onValueChange={(v) => v && setEmotionalTone(v as EmotionalTone)} className="justify-start flex-wrap">
                <ToggleGroupItem value="trust" className="px-3">🤝 Trust</ToggleGroupItem>
                <ToggleGroupItem value="excitement" className="px-3">⚡ Excitement</ToggleGroupItem>
                <ToggleGroupItem value="authority" className="px-3">👑 Authority</ToggleGroupItem>
                <ToggleGroupItem value="warmth" className="px-3">💛 Warmth</ToggleGroupItem>
                <ToggleGroupItem value="urgency" className="px-3">🔥 Urgency</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label>Style Preference</Label>
              <ToggleGroup type="single" value={style} onValueChange={(v) => v && setStyle(v as StylePreference)} className="justify-start">
                <ToggleGroupItem value="minimal" className="px-4">Minimal</ToggleGroupItem>
                <ToggleGroupItem value="dark" className="px-4">Dark</ToggleGroupItem>
                <ToggleGroupItem value="colorful" className="px-4">Colorful</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <ColorPicker value={primaryColor} onChange={setPrimaryColor} />
            </div>

            <Separator />

            {/* Advanced Controls Toggle */}
            <Button
              variant="ghost"
              className="w-full justify-between text-muted-foreground"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="text-sm font-medium">Advanced Controls</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showAdvanced && (
              <div className="space-y-6 animate-fade-in">
                {/* Animation Intensity */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm">Animation Intensity</Label>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {sliderLabel("animation", animationIntensity)}
                    </span>
                  </div>
                  <Slider
                    value={[animationIntensity]}
                    onValueChange={([v]) => setAnimationIntensity(v)}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Layout Complexity */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm">Layout Complexity</Label>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {sliderLabel("layout", layoutComplexity)}
                    </span>
                  </div>
                  <Slider
                    value={[layoutComplexity]}
                    onValueChange={([v]) => setLayoutComplexity(v)}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Modern Level */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm">Modern Level</Label>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {sliderLabel("modern", modernLevel)}
                    </span>
                  </div>
                  <Slider
                    value={[modernLevel]}
                    onValueChange={([v]) => setModernLevel(v)}
                    max={100}
                    step={1}
                  />
                </div>

                <Separator />

                {/* Mode Toggles */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm flex items-center gap-1.5">
                      <Beaker className="h-4 w-4 text-primary" /> Experimental Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">Glassmorphism, brutalist, animated gradients, bold typography</p>
                  </div>
                  <Switch checked={experimentalMode} onCheckedChange={setExperimentalMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-primary" /> Production Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">SEO tags, accessibility, aria labels, OpenGraph, optimized output</p>
                  </div>
                  <Switch checked={productionMode} onCheckedChange={setProductionMode} />
                </div>
              </div>
            )}

            {/* Generate */}
            <Button
              className="w-full h-12 text-base font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Landing Page
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
