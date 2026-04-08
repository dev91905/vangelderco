import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/theme";

interface ImageUploaderProps { value: string | null; onChange: (url: string | null) => void; label?: string; compact?: boolean; }

const ImageUploader = ({ value, onChange, label: labelText = "Image", compact = false }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file);
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files?.[0]; if (file) upload(file); }, [upload]);

  if (compact && value) {
    return (
      <div className="relative group">
        <img src={value} alt="" className="w-full h-24 object-cover rounded-xl" style={{ border: t.border(0.06) }} />
        <button onClick={() => onChange(null)} className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: t.ink(1) }}>
          <X className="w-3 h-3" style={{ color: t.cream }} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!compact && labelText && <span className="text-[11px] uppercase tracking-[0.06em] block" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>{labelText}</span>}
      {value ? (
        <div className="relative group">
          <img src={value} alt="" className="w-full h-48 object-cover rounded-xl" style={{ border: t.border(0.06) }} />
          <button onClick={() => onChange(null)} className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: t.ink(1) }}>
            <X className="w-4 h-4" style={{ color: t.cream }} />
          </button>
        </div>
      ) : (
        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-2 p-6 cursor-pointer transition-colors rounded-xl"
          style={{ border: `1px dashed ${dragOver ? t.ink(0.3) : t.ink(0.12)}`, background: dragOver ? t.surface.subtle : "transparent" }}
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) upload(file); }; input.click(); }}>
          {uploading ? (
            <span className="text-sm" style={{ color: t.ink(0.4), fontFamily: t.sans }}>Uploading...</span>
          ) : (
            <>
              <Upload className="w-5 h-5" style={{ color: t.ink(0.2) }} />
              <span className="text-[12px]" style={{ color: t.ink(0.3), fontFamily: t.sans }}>Drop image or click to upload</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
