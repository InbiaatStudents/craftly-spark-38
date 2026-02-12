import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ExternalLink, Clock, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getHistory, deleteFromHistory, clearHistory } from "@/lib/history";
import type { HistoryEntry } from "@/types/landing";

const TYPE_LABELS: Record<string, string> = {
  portfolio: "Portfolio",
  startup: "Startup",
  product: "Product",
  personal: "Personal",
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const handleOpen = (entry: HistoryEntry) => {
    sessionStorage.setItem(
      "landingcraft-result",
      JSON.stringify({
        id: entry.id,
        html: entry.html,
        title: entry.title,
        projectType: entry.projectType,
        style: entry.style,
        primaryColor: entry.primaryColor,
      })
    );
    navigate("/result");
  };

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleClearAll = () => {
    clearHistory();
    setEntries([]);
  };

  return (
    <div className="container max-w-3xl py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">History</h1>
        {entries.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Clock className="mx-auto h-12 w-12 mb-4 opacity-40" />
          <p className="text-lg">No generated pages yet.</p>
          <Button variant="link" onClick={() => navigate("/")}>
            Create your first landing page →
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="border-border/50">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-8 w-8 rounded-full shrink-0 border border-border"
                    style={{ backgroundColor: entry.primaryColor }}
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{entry.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{TYPE_LABELS[entry.projectType] ?? entry.projectType}</span>
                      <span>·</span>
                      <span className="capitalize">{entry.style}</span>
                      <span>·</span>
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleOpen(entry)} title="Open">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} title="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
