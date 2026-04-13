import { useState, useRef } from "react";
import { Upload, Link, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdInputProps {
  onAdData: (data: { type: "url" | "image"; value: string }) => void;
  adData: { type: "url" | "image"; value: string } | null;
}

const AdInput = ({ onAdData, adData }: AdInputProps) => {
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [urlValue, setUrlValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onAdData({ type: "image", value: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onAdData({ type: "url", value: urlValue.trim() });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Image className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Ad Creative</h3>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "url"
              ? "gradient-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <Link className="w-3.5 h-3.5" /> URL
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "upload"
              ? "gradient-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload
        </button>
      </div>

      {adData ? (
        <div className="relative rounded-lg border border-border overflow-hidden bg-secondary/30">
          {adData.type === "image" ? (
            <img src={adData.value} alt="Ad creative" className="w-full h-40 object-contain" />
          ) : (
            <div className="p-3 text-sm text-muted-foreground truncate">
              {adData.value}
            </div>
          )}
          <button
            onClick={() => onAdData(null as any)}
            className="absolute top-2 right-2 p-1 rounded-full bg-foreground/80 text-background hover:bg-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : mode === "url" ? (
        <div className="flex gap-2">
          <Input
            placeholder="Paste ad creative URL (image link)..."
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleUrlSubmit} size="sm" className="gradient-primary text-primary-foreground border-0">
            Add
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to upload ad image</p>
          <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WebP up to 5MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default AdInput;
