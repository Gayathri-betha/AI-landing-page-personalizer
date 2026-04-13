import { useState } from "react";
import { Monitor, Smartphone, Code, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PagePreviewProps {
  html: string;
  isLoading: boolean;
  loadingText?: string;
}

const PagePreview = ({ html, isLoading, loadingText }: PagePreviewProps) => {
  const [view, setView] = useState<"desktop" | "mobile" | "code">("desktop");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    toast.success("HTML copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenNewTab = () => {
    const w = window.open();
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full gradient-primary animate-pulse" />
          <div className="space-y-2">
            <p className="font-medium text-foreground">Generating personalized page...</p>
            <p className="text-sm text-muted-foreground max-w-md">{loadingText || "Analyzing ad creative and landing page..."}</p>
          </div>
          <div className="w-64 h-1.5 mx-auto rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full gradient-primary animate-shimmer" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex-1 rounded-xl border border-dashed border-border bg-card/50 overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3 p-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
            <Monitor className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Personalized page preview</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Add your ad creative and landing page URL, then click "Generate" to see the personalized result here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-secondary/30">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView("desktop")}
            className={`p-1.5 rounded-md transition-colors ${view === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("mobile")}
            className={`p-1.5 rounded-md transition-colors ${view === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("code")}
            className={`p-1.5 rounded-md transition-colors ${view === "code" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs">
            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied ? "Copied" : "Copy HTML"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenNewTab} className="h-7 text-xs">
            <ExternalLink className="w-3 h-3 mr-1" /> Open
          </Button>
        </div>
      </div>

      {view === "code" ? (
        <div className="flex-1 overflow-auto p-4 bg-foreground/[0.03]">
          <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">{html}</pre>
        </div>
      ) : (
        <div className="flex-1 flex justify-center overflow-auto bg-secondary/20 p-4">
          <iframe
            srcDoc={html}
            className={`bg-card border border-border rounded-lg shadow-soft transition-all ${
              view === "mobile" ? "w-[375px]" : "w-full"
            } h-full min-h-[500px]`}
            sandbox="allow-scripts allow-same-origin"
            title="Personalized landing page preview"
          />
        </div>
      )}
    </div>
  );
};

export default PagePreview;
