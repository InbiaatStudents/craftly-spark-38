import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Download, Monitor, Tablet, Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { exportAs } from "@/lib/exportFormats";
import type { ExportFormat } from "@/types/landing";

interface ResultData {
  id: string;
  html: string;
  title: string;
  projectType: string;
  style: string;
  primaryColor: string;
}

const VIEWPORTS = [
  { key: "desktop", icon: Monitor, width: "100%" },
  { key: "tablet", icon: Tablet, width: "768px" },
  { key: "mobile", icon: Smartphone, width: "390px" },
] as const;

export default function Result() {
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultData | null>(null);
  const [viewport, setViewport] = useState<string>("desktop");
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("html");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("landingcraft-result");
    if (!raw) {
      navigate("/");
      return;
    }
    setResult(JSON.parse(raw));
  }, [navigate]);

  const handleCopy = async () => {
    if (!result) return;
    const { content } = exportAs(exportFormat, result.html, result.title);
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const { content, filename, mime } = exportAs(exportFormat, result.html, result.title);
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!result) return null;

  const currentVP = VIEWPORTS.find((v) => v.key === viewport)!;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border p-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">{result.title}</span>
        </div>

        <div className="flex items-center gap-1">
          {VIEWPORTS.map((vp) => (
            <Button
              key={vp.key}
              variant={viewport === vp.key ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewport(vp.key)}
              title={vp.key}
            >
              <vp.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="html">Raw HTML</SelectItem>
              <SelectItem value="react">React Component</SelectItem>
              <SelectItem value="nextjs">Next.js Page</SelectItem>
              <SelectItem value="tailwind">Tailwind Project</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-1 h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="preview" className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-2 w-fit">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="flex-1 flex justify-center p-4 bg-muted/30">
          <div
            className="bg-background border border-border rounded-lg overflow-hidden shadow-lg transition-all duration-300"
            style={{ width: currentVP.width, maxWidth: "100%", height: "100%" }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={result.html}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              title="Landing page preview"
            />
          </div>
        </TabsContent>

        <TabsContent value="code" className="flex-1 overflow-auto p-4">
          <pre className="rounded-lg bg-muted p-4 text-sm overflow-auto h-full">
            <code className="text-foreground whitespace-pre-wrap break-words">
              {exportAs(exportFormat, result.html, result.title).content}
            </code>
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}
