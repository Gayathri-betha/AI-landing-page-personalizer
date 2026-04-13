import { useState } from "react";
import { Sparkles, Globe, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AdInput from "@/components/AdInput";
import PagePreview from "@/components/PagePreview";

const Index = () => {
  const [adData, setAdData] = useState<{ type: "url" | "image"; value: string } | null>(null);
  const [landingUrl, setLandingUrl] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleGenerate = async () => {
    if (!adData) {
      toast.error("Please add an ad creative first");
      return;
    }
    if (!landingUrl.trim()) {
      toast.error("Please enter a landing page URL");
      return;
    }

    setIsLoading(true);
    setGeneratedHtml("");
    setLoadingText("Fetching and analyzing your landing page...");

    try {
      const { data, error } = await supabase.functions.invoke("personalize-page", {
        body: {
          adCreative: adData,
          landingPageUrl: landingUrl.trim(),
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to generate personalized page");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setGeneratedHtml(data.html);
      toast.success("Personalized page generated!");
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  const canGenerate = adData && landingUrl.trim();

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-surface)" }}>
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Troopod</span>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            AI-Powered Landing Page Personalization
          </p>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Personalize Your Landing Pages{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
              Instantly
            </span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Input your ad creative and landing page URL. Our AI analyzes both and generates a CRO-optimized, 
            personalized version that matches your ad messaging.
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* Input Panel */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft space-y-6">
              <AdInput onAdData={setAdData} adData={adData} />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Landing Page URL</h3>
                </div>
                <Input
                  placeholder="https://example.com/landing-page"
                  value={landingUrl}
                  onChange={(e) => setLandingUrl(e.target.value)}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isLoading}
                className="w-full gradient-primary text-primary-foreground border-0 h-11 font-semibold text-base disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Personalized Page
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>

            {/* How it works */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-semibold text-foreground mb-3 text-sm">How it works</h3>
              <ol className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  "AI fetches & analyzes your landing page structure",
                  "Extracts key messaging & intent from your ad creative",
                  "Applies CRO best practices to align page with ad",
                  "Generates personalized HTML preserving original layout",
                ].map((step, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full gradient-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Preview Panel */}
          <PagePreview html={generatedHtml} isLoading={isLoading} loadingText={loadingText} />
        </div>
      </main>
    </div>
  );
};

export default Index;
