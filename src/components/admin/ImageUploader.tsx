import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  compact?: boolean;
}

const ImageUploader = ({ value, onChange, label = "Image", compact = false }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file);
    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }, [upload]);

  if (compact && value) {
    return (
      <div className="relative group">
        <img src={value} alt="" className="w-full h-24 object-cover rounded" style={{ border: "1px solid hsl(0 0% 15%)" }} />
        <button
          onClick={() => onChange(null)}
          className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "hsl(0 80% 48%)" }}
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!compact && (
        <label className="text-[10px] tracking-[0.15em] uppercase block" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.4)" }}>
          {label}
        </label>
      )}
      {value ? (
        <div className="relative group">
          <img src={value} alt="" className="w-full h-48 object-cover" style={{ border: "1px solid hsl(0 0% 15%)" }} />
          <button
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "hsl(0 80% 48%)" }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-2 p-6 cursor-pointer transition-colors"
          style={{
            border: `1px dashed ${dragOver ? "hsl(0 80% 48%)" : "hsl(0 0% 20%)"}`,
            background: dragOver ? "hsl(0 80% 48% / 0.05)" : "transparent",
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) upload(file);
            };
            input.click();
          }}
        >
          {uploading ? (
            <span className="text-xs" style={{ color: "hsl(0 0% 100% / 0.5)", fontFamily: "'JetBrains Mono', monospace" }}>
              Uploading...
            </span>
          ) : (
            <>
              <Upload className="w-5 h-5" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
              <span className="text-[10px]" style={{ color: "hsl(0 0% 100% / 0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
                Drop image or click to upload
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
