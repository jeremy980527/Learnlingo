"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, FileText, Image as ImageIcon, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { uploadMaterial } from "@/lib/api/upload-material";
import { ACCEPTED_MIME_TYPES, isSupportedFileType } from "@/lib/parsing";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  if (type === "application/pdf") return <FileText className="text-red-500" />;
  if (type.startsWith("image/")) return <ImageIcon className="text-secondary-500" />;
  return <FileText className="text-ink-500" />;
}

export function Dropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const validateAndSetFile = useCallback((file: File) => {
    setError(null);
    if (!isSupportedFileType(file.type)) {
      setError("不支援的檔案格式，請上傳 PDF、圖片（PNG/JPG/WEBP）或純文字檔。");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("檔案大小不可超過 15MB。");
      return;
    }
    setSelectedFile(file);
  }, []);

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) validateAndSetFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await uploadMaterial(selectedFile, setProgress);
      router.push(`/materials/${result.materialId}/processing`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上傳失敗，請稍後再試。");
      setIsUploading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging
            ? "var(--color-primary-500)"
            : "var(--color-ink-200)",
        }}
        transition={{ duration: 0.15 }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-4 border-dashed bg-white px-6 py-16 text-center transition-colors",
          isDragging && "bg-primary-50",
        )}
      >
        <motion.div
          animate={isDragging ? { y: [-4, 4, -4] } : { y: 0 }}
          transition={{ repeat: isDragging ? Infinity : 0, duration: 1 }}
        >
          <UploadCloud size={56} className="text-primary-500" strokeWidth={1.5} />
        </motion.div>
        <div>
          <p className="text-lg font-extrabold text-ink-900">
            拖曳檔案到這裡，或點擊選擇檔案
          </p>
          <p className="mt-1 text-sm font-medium text-ink-500">
            支援 PDF、圖片（PNG/JPG/WEBP）、純文字檔，最大 15MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_MIME_TYPES.join(",")}
          onChange={handleFileInput}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 overflow-hidden rounded-2xl bg-red-100 px-4 py-3 text-sm font-bold text-red-600"
          >
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col gap-4 rounded-3xl border-2 border-ink-200 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-100">
                <FileIcon type={selectedFile.type} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-ink-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs font-semibold text-ink-500">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
              {!isUploading && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="rounded-full p-1.5 text-ink-300 hover:bg-ink-100 hover:text-ink-700"
                  aria-label="移除檔案"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {isUploading ? (
              <ProgressBar value={progress} label={`上傳中... ${progress}%`} />
            ) : (
              <Button fullWidth onClick={handleUpload}>
                開始生成學習地圖
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
