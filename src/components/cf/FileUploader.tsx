'use client';

import { useState, useCallback, useRef, type DragEvent } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploaderProps {
  accept: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // bytes
  files: File[];
  onFilesChange: (files: File[]) => void;
  hint?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function FileUploader({
  accept,
  multiple = false,
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024,
  files,
  onFilesChange,
  hint,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setDragError(null);
      const arr = Array.from(incoming);

      // Check count
      if (arr.length + files.length > maxFiles) {
        setDragError(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
        return;
      }

      // Check size
      const oversized = arr.find((f) => f.size > maxSize);
      if (oversized) {
        setDragError(`File "${oversized.name}" exceeds ${formatSize(maxSize)} limit`);
        return;
      }

      if (multiple) {
        onFilesChange([...files, ...arr]);
      } else {
        onFilesChange(arr.slice(0, 1));
      }
    },
    [files, maxFiles, maxSize, multiple, onFilesChange]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = '';
      }
    },
    [addFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const next = [...files];
      next.splice(index, 1);
      onFilesChange(next);
    },
    [files, onFilesChange]
  );

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-8 text-center ${
          isDragging
            ? 'border-amber-500/50 bg-amber-500/[0.05]'
            : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.03]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isDragging ? 'bg-amber-500/20' : 'bg-white/[0.05]'
            }`}
          >
            <Upload
              className={`w-5 h-5 transition-colors ${
                isDragging ? 'text-amber-400' : 'text-slate-500'
              }`}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">
              {isDragging ? 'Drop here' : 'Drag & drop or click to upload'}
            </p>
            {hint && (
              <p className="text-xs text-slate-600 mt-1">{hint}</p>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {dragError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-rose-400"
          >
            {dragError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <motion.div
              key={`${file.name}-${file.size}-${idx}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-[#12121f] border border-white/[0.06]"
            >
              <FileIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.name}</p>
                <p className="text-[11px] text-slate-500">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}