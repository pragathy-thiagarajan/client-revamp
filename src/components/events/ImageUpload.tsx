import { useState, useRef, type ChangeEvent } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
}

const PRESET_BANNERS = [
  {
    name: "Tech & AI Summit",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Music & Live Concert",
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Workshop & Design",
    url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Marathon & Sports",
    url: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Business & Networking",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
  },
];

export const ImageUpload = ({
  value,
  onChange,
  label = "Event Banner Image",
  description = "Upload a high-resolution banner image from your device or paste an image URL.",
}: ImageUploadProps) => {
  const [mode, setMode] = useState<"upload" | "url" | "preset">("upload");
  const [urlInput, setUrlInput] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (PNG, JPG, WEBP, or SVG).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image file size should be less than 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Compress image using canvas if larger than 1200px width
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedData = canvas.toDataURL("image/jpeg", 0.85);
              onChange(compressedData);
              return;
            }
          }
          onChange(result);
        };
        img.src = result;
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleRemove = () => {
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-800">
          {label}
        </label>
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`rounded-md px-2.5 py-1 transition ${
              mode === "upload"
                ? "bg-white font-bold text-violet-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`rounded-md px-2.5 py-1 transition ${
              mode === "url"
                ? "bg-white font-bold text-violet-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Paste URL
          </button>
          <button
            type="button"
            onClick={() => setMode("preset")}
            className={`rounded-md px-2.5 py-1 transition ${
              mode === "preset"
                ? "bg-white font-bold text-violet-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500">{description}</p>

      {uploadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {uploadError}
        </div>
      )}

      {/* Mode 1: File Upload */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
            isDragging
              ? "border-violet-500 bg-violet-50/60"
              : "border-slate-200 bg-slate-50/60 hover:border-violet-400 hover:bg-violet-50/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 group-hover:scale-105 transition">
            <svg
              className="h-6 w-6 text-violet-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            Click to upload image or drag & drop
          </p>
          <p className="mt-1 text-xs text-slate-500">
            PNG, JPG, WEBP or SVG up to 8MB
          </p>
        </div>
      )}

      {/* Mode 2: URL Input */}
      {mode === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Apply URL
          </button>
        </div>
      )}

      {/* Mode 3: Curated Presets */}
      {mode === "preset" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESET_BANNERS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                onChange(preset.url);
                setUrlInput(preset.url);
              }}
              className={`group overflow-hidden rounded-xl border text-left transition ${
                value === preset.url
                  ? "border-violet-600 ring-2 ring-violet-200"
                  : "border-slate-200 hover:border-violet-300"
              }`}
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="h-20 w-full object-cover transition group-hover:scale-105"
              />
              <p className="truncate p-2 text-xs font-semibold text-slate-700">
                {preset.name}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Live Preview & Remove */}
      {value && (
        <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md">
          <img
            src={value}
            alt="Banner preview"
            className="h-48 w-full object-cover sm:h-56"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="rounded-lg bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              Banner Preview Active
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg bg-red-600/90 px-3 py-1 text-xs font-semibold text-white shadow transition hover:bg-red-700"
            >
              Remove Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
