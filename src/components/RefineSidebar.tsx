import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Wand2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  html: string;
  onPatched: (newHtml: string) => void;
  open: boolean;
  onToggle: () => void;
}

const QUICK_ACTIONS = [
  "Make all headers 20% smaller",
  "Change the primary color to neon green",
  "Make the hero section more minimal",
  "Add a pricing section with 3 tiers",
  "Make typography bolder and more editorial",
  "Increase whitespace between sections",
];

export default function RefineSidebar({ html, onPatched, open, onToggle }: Props) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleRefine = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-landing", {
        body: { action: "refine", existingHtml: html, instruction: text },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      onPatched(data.html);
      setHistory((h) => [text, ...h].slice(0, 8));
      setInstruction("");
      toast({ title: "Refinement applied" });
    } catch (err: any) {
      toast({
        title: "Refinement failed",
        description: err.message || "Try a different instruction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        onClick={onToggle}
        size="sm"
        className="fixed right-4 bottom-4 z-40 shadow-lg"
      >
        <Wand2 className="mr-1.5 h-4 w-4" />
        Refine
      </Button>
    );
  }

  return (
    <aside className="fixed right-0 top-16 bottom-0 w-80 bg-card border-l border-border shadow-2xl z-40 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Wand2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Refine</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Describe a change
          </label>
          <Textarea
            placeholder="e.g. Make the headers 20% smaller and change the purple to neon green"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            rows={4}
            disabled={loading}
            className="text-sm"
          />
          <Button
            onClick={() => handleRefine(instruction)}
            disabled={loading || !instruction.trim()}
            className="w-full"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Hot-patching...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-4 w-4" />
                Apply change
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Quick actions</p>
          <div className="flex flex-col gap-1.5">
            {QUICK_ACTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleRefine(q)}
                disabled={loading}
                className="text-left text-xs px-2.5 py-2 rounded-md bg-muted hover:bg-muted/70 transition disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Recent edits</p>
            <ul className="space-y-1">
              {history.map((h, i) => (
                <li key={i} className="text-xs text-muted-foreground line-clamp-2 px-2 py-1 border-l-2 border-primary/40">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
