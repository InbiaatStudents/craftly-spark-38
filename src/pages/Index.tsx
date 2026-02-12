import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import anime from "animejs";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/hooks/use-toast";
import ColorPicker from "@/components/ColorPicker";
import FloatingShapes from "@/components/FloatingShapes";
import { saveToHistory } from "@/lib/history";
import type { ProjectType, StylePreference, GenerationRequest } from "@/types/landing";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [projectType, setProjectType] = useState<ProjectType>("startup");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<StylePreference>("minimal");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);

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
      const body: GenerationRequest = { projectType, title, description, style, primaryColor };
      const { data, error } = await supabase.functions.invoke("generate-landing", { body });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const html = data.html as string;
      const id = crypto.randomUUID();

      saveToHistory({
        id,
        projectType,
        title,
        style,
        primaryColor,
        html,
        createdAt: new Date().toISOString(),
      });

      // Store the result temporarily for the result page
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center px-4 py-12 md:py-20">
      <FloatingShapes />

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
