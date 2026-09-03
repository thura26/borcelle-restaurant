import { useState } from "react";
import { Upload, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function ImageUploader({
  value,
  onChange,
  label = "Upload Image",
}: {
  value: string | null;
  onChange: (v: string | null, err?: string) => void;
  label?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { isDark } = useTheme();

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      const msg = "Only image files allowed";
      setError(msg);
      onChange(value, msg);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      const msg = "Image too large (max 5MB)";
      setError(msg);
      onChange(value, msg);
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      if (data.length > 5 * 1024 * 1024) {
        const msg = "Base64 too large (max 5MB)";
        setError(msg);
        onChange(value, msg);
        return;
      }
      onChange(data);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div>
      <p className={`font-poppins font-medium text-[13px] mb-1.5 ${isDark ? "text-white" : "text-dark"}`}>{label} <span className={`font-normal ${isDark ? "text-white/60" : "text-muted"}`}>(JPG/PNG, max 5MB)</span></p>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center w-full py-6 px-4 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${value ? (isDark ? "border-emerald-500/40 bg-emerald-500/10" : "border-green-300 bg-green-50/50") : dragOver ? (isDark ? "border-primary/50 bg-primary/10" : "border-primary bg-primary/5") : isDark ? "border-white/20 bg-white/5 hover:bg-white/10" : "border-primary/30 bg-white hover:bg-primary/5"}`}
      >
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
        {value ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <img src={value} alt="preview" className={`w-full max-w-[220px] max-h-[220px] object-contain rounded-xl shadow-sm border ${isDark ? "border-white/10" : "border-dark/10"}`} />
            <span className={`font-poppins font-semibold text-xs px-3 py-1.5 rounded-full ${isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-green-100 text-green-700"}`}>✓ Uploaded — tap to change</span>
          </div>
        ) : (
          <>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? "bg-white/10 text-white" : "bg-primary/10 text-primary"}`}>
              <Upload size={20} className="w-5 h-5" />
            </div>
            <span className={`font-poppins font-semibold text-sm mt-3 ${isDark ? "text-white" : "text-dark"}`}>Tap or drag to upload</span>
            <span className={`font-poppins text-xs mt-1 ${isDark ? "text-white/60" : "text-muted"}`}>JPG, PNG — 5MB max</span>
          </>
        )}
      </label>
      {value && (
        <button type="button" onClick={() => { onChange(null); setError(null); }} className="mt-2 font-poppins text-red-400 text-xs underline flex items-center gap-1 hover:text-red-500">
          <X size={12} /> Remove image
        </button>
      )}
      {error && <p className={`font-poppins text-xs mt-2 rounded-xl px-3 py-2 border ${isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-500 border-red-200"}`}>{error}</p>}
    </div>
  );
}