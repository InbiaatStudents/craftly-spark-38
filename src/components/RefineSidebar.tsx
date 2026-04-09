import { useState } from "react";
import { Send, Loader2, Wand2, Type, Palette, Layout, Sparkles, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RefineSidebarProps {
  open: boolean;
  onClose: () => void;
  currentHtml: string;
  onHtmlUpdated: (html: string) => void;
  title: string;
}

interface RefineHistoryItem {
  id: string;
  prompt: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: "Smaller headers", icon: Type, prompt: "Make all headers 20% smaller" },
  { label: "More spacing", icon: Layout, prompt: "Add more whitespace between sections" },
  { label: "Bolder CTAs", icon: Sparkles, prompt: "Make the call-to-action buttons larger and more prominent" },
  { label: "Softer colors", icon: Palette, prompt: "Make the color palette more muted and subtle" },
];

export default function RefineSidebar({
  open,
  onClose,
  currentHtml,
  onHtmlUpdated,
  title,
}: RefineSidebarProps) {
  const [refinePrompt, setRefinePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RefineHistoryItem[]>([]);
  const [headerScale, setHeaderScale] = useState([100]);
  const [spacingScale, setSpacingScale] = useState([100]);

  const handleRefine = async (prompt: string) => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a refinement instruction", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-landing", {
        body: {
          refineMode: true,
          refinePrompt: prompt,
          existingHtml: currentHtml,
          title,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newHtml = data.html as string;
      onHtmlUpdated(newHtml);

      // Add to history
      setHistory(prev => [
        { id: crypto.randomUUID(), prompt, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);

      setRefinePrompt("");
      toast({ title: "Refinement applied!", description: "Your changes have been applied to the preview." });
    } catch (err: any) {
      console.error("Refine error:", err);
      toast({
        title: "Refinement failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleRefine(prompt);
  };

  const applyScaleChanges = () => {
    const scalePrompt = [];
    if (headerScale[0] !== 100) {
      const change = headerScale[0] > 100 ? "larger" : "smaller";
      const percent = Math.abs(headerScale[0] - 100);
      scalePrompt.push(`Make all headers ${percent}% ${change}`);
    }
    if (spacingScale[0] !== 100) {
      const change = spacingScale[0] > 100 ? "more" : "less";
      const percent = Math.abs(spacingScale[0] - 100);
      scalePrompt.push(`Add ${percent}% ${change} whitespace between sections`);
    }
    if (scalePrompt.length > 0) {
      handleRefine(scalePrompt.join(" and "));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed right-0 top-16 bottom-0 w-80 border-l border-border bg-background/95 backdrop-blur-sm shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Refine Page</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Natural Language Input */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Describe your changes</Label>
            <Textarea
              placeholder="e.g., Make the headers 20% smaller and change the purple to neon green..."
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <Button
              onClick={() => handleRefine(refinePrompt)}
              disabled={loading || !refinePrompt.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Actions</Label>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={loading}
                  className="justify-start text-xs h-auto py-2 px-3"
                >
                  <action.icon className="h-3 w-3 mr-1.5 shrink-0" />
                  <span className="truncate">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Visual Sliders */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Visual Adjustments</Label>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Header Size</span>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                  {headerScale[0]}%
                </span>
              </div>
              <Slider
                value={headerScale}
                onValueChange={setHeaderScale}
                min={60}
                max={140}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Section Spacing</span>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                  {spacingScale[0]}%
                </span>
              </div>
              <Slider
                value={spacingScale}
                onValueChange={setSpacingScale}
                min={60}
                max={140}
                step={5}
              />
            </div>

            {(headerScale[0] !== 100 || spacingScale[0] !== 100) && (
              <Button
                onClick={applyScaleChanges}
                disabled={loading}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Apply Scale Changes
              </Button>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Recent Changes</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistory([])}
                    className="h-6 text-xs text-muted-foreground"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-md bg-muted/50 text-xs"
                    >
                      <p className="text-foreground line-clamp-2">{item.prompt}</p>
                      <p className="text-muted-foreground mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer tip */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Changes are applied without regenerating the entire page
        </p>
      </div>
    </div>
  );
}
