'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Shield,
  Crown,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { tools, categoryLabels } from '@/lib/tool-definitions';
import { useStore } from '@/lib/store';
import { runConversion } from '@/lib/converters';
import { incrementUsage, recordRecentTool } from '@/lib/usage-counter';
import ProgressBar from './ProgressBar';
import FileUploader from './FileUploader';
import AdBanner from './AdBanner';
import SocialShare from './SocialShare';

/* ──────────── sub-components ──────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button
      onClick={handle}
      disabled={!text}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function DownloadButton({ blob, filename }: { blob: Blob | null; filename: string }) {
  const handle = useCallback(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [blob, filename]);

  return (
    <button
      onClick={handle}
      disabled={!blob}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Download className="w-4 h-4" />
      Download
    </button>
  );
}

/* ──────────── special tool UIs ──────────── */

function ColorConverterUI() {
  const { inputText, setInputText, outputText, processText } = useStore();
  const [hexInput, setHexInput] = useState(inputText || '#3b82f6');
  const [format, setFormat] = useState<'rgb' | 'hsl' | 'cmyk'>('rgb');

  const isValidHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hexInput);
  const previewColor = isValidHex ? hexInput : '#1a1a2e';

  const convert = () => {
    setInputText(hexInput);
    processText(format);
  };

  const formatButtons: { key: 'rgb' | 'hsl' | 'cmyk'; label: string }[] = [
    { key: 'rgb', label: 'RGB' },
    { key: 'hsl', label: 'HSL' },
    { key: 'cmyk', label: 'CMYK' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Color preview */}
        <div
          className="w-full sm:w-32 h-32 rounded-xl border border-white/[0.08] flex-shrink-0"
          style={{ backgroundColor: previewColor }}
        />
        <div className="flex-1 space-y-4 w-full">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Hex Color</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                placeholder="#3b82f6"
                className="cf-input w-full px-4 py-2.5 text-sm font-mono"
              />
              <input
                type="color"
                value={isValidHex ? hexInput.length === 4 ? `#${hexInput[1]}${hexInput[1]}${hexInput[2]}${hexInput[2]}${hexInput[3]}${hexInput[3]}` : hexInput : '#3b82f6'}
                onChange={(e) => setHexInput(e.target.value)}
                className="w-11 h-11 rounded-lg border border-white/[0.08] cursor-pointer bg-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Convert to</label>
            <div className="flex gap-2">
              {formatButtons.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFormat(f.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    format === f.key
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={convert}
            disabled={!isValidHex}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Convert →
          </button>
        </div>
      </div>
      {outputText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">Result</label>
            <CopyButton text={outputText} />
          </div>
          <div className="cf-textarea p-4 text-sm font-mono text-emerald-400 min-h-[60px]">
            {outputText}
          </div>
        </div>
      )}
    </div>
  );
}

function CaseConverterUI() {
  const { inputText, setInputText, outputText, processText } = useStore();
  const [caseType, setCaseType] = useState('uppercase');

  const caseTypes = [
    { key: 'uppercase', label: 'UPPER' },
    { key: 'lowercase', label: 'lower' },
    { key: 'titlecase', label: 'Title' },
    { key: 'sentencecase', label: 'Sentence' },
    { key: 'camelcase', label: 'camelCase' },
    { key: 'snakecase', label: 'snake_case' },
    { key: 'kebabcase', label: 'kebab-case' },
    { key: 'togglecase', label: 'tOGGLE' },
  ];

  const convert = () => {
    processText(caseType);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Input</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to convert case…"
            rows={8}
            className="cf-textarea w-full px-4 py-3 text-sm resize-none"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">Output</label>
            <CopyButton text={outputText} />
          </div>
          <div className="cf-textarea p-4 text-sm min-h-[196px] text-slate-200">
            {outputText || <span className="text-slate-600">Result will appear here…</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {caseTypes.map((c) => (
          <button
            key={c.key}
            onClick={() => setCaseType(c.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              caseType === c.key
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <button
        onClick={convert}
        disabled={!inputText.trim()}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Convert →
      </button>
    </div>
  );
}

function HashGeneratorUI() {
  const { inputText, setInputText, outputText, processText } = useStore();
  const [algorithm, setAlgorithm] = useState('SHA-256');

  const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

  const convert = () => {
    processText(algorithm);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400">Input Text</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to hash…"
          rows={6}
          className="cf-textarea w-full px-4 py-3 text-sm resize-none"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {algorithms.map((a) => (
          <button
            key={a}
            onClick={() => setAlgorithm(a)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              algorithm === a
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      <button
        onClick={convert}
        disabled={!inputText.trim()}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Generate Hash →
      </button>
      {outputText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">{algorithm} Hash</label>
            <CopyButton text={outputText} />
          </div>
          <div className="cf-textarea p-4 text-sm font-mono text-emerald-400 break-all min-h-[60px]">
            {outputText}
          </div>
        </div>
      )}
    </div>
  );
}

function JsonFormatterUI() {
  const { inputText, setInputText, outputText, processText } = useStore();

  const actions = [
    { key: 'format', label: 'Format' },
    { key: 'minify', label: 'Minify' },
    { key: 'validate', label: 'Validate' },
  ];

  const handleAction = (action: string) => {
    processText(action);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Input JSON</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='{"key": "value"}'
            rows={12}
            className="cf-textarea w-full px-4 py-3 text-sm font-mono resize-none"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">Output</label>
            <CopyButton text={outputText} />
          </div>
          <div className="cf-textarea p-4 text-sm font-mono min-h-[300px] text-slate-200 overflow-auto max-h-96">
            {outputText || <span className="text-slate-600">Formatted JSON will appear here…</span>}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {actions.map((a) => (
          <button
            key={a.key}
            onClick={() => handleAction(a.key)}
            disabled={!inputText.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EpochConverterUI() {
  const { inputText, setInputText, outputText, processText } = useStore();
  const [mode, setMode] = useState<'toDate' | 'toTimestamp'>('toDate');

  const convert = () => {
    processText(mode);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setMode('toDate')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            mode === 'toDate'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
          }`}
        >
          Timestamp → Date
        </button>
        <button
          onClick={() => setMode('toTimestamp')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            mode === 'toTimestamp'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
          }`}
        >
          Date → Timestamp
        </button>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400">
          {mode === 'toDate' ? 'Unix Timestamp' : 'Date / Time'}
        </label>
        <input
          type={mode === 'toTimestamp' ? 'datetime-local' : 'text'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={mode === 'toDate' ? '1700000000' : ''}
          className="cf-input w-full px-4 py-2.5 text-sm font-mono"
        />
      </div>
      <button
        onClick={convert}
        disabled={!inputText.trim()}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Convert →
      </button>
      {outputText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">Result</label>
            <CopyButton text={outputText} />
          </div>
          <div className="cf-textarea p-4 text-sm font-mono text-emerald-400 min-h-[60px]">
            {outputText}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageConverterUI() {
  const { uploadedFile, setUploadedFile, processedBlob, isProcessing, error, processFile } = useStore();
  const [targetFormat, setTargetFormat] = useState('png');
  const [quality, setQuality] = useState(90);

  const formats = ['png', 'jpeg', 'webp', 'bmp', 'gif'];

  const handleConvert = async () => {
    if (!uploadedFile) return;
    await processFile(targetFormat, quality);
  };

  const suggestedName = uploadedFile
    ? uploadedFile.name.replace(/\.[^.]+$/, '') + '.' + targetFormat
    : 'converted.' + targetFormat;

  return (
    <div className="space-y-6">
      <FileUploader
        accept="image/*"
        multiple={false}
        maxFiles={1}
        maxSize={50 * 1024 * 1024}
        files={uploadedFile ? [uploadedFile] : []}
        onFilesChange={(files) => setUploadedFile(files[0] || null)}
        hint="PNG, JPEG, WebP, BMP, GIF — up to 50 MB"
      />

      {uploadedFile && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Target Format</label>
            <div className="flex flex-wrap gap-2">
              {formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setTargetFormat(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium uppercase transition-all ${
                    targetFormat === f
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {(targetFormat === 'jpeg' || targetFormat === 'webp') && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Converting…
              </>
            ) : (
              'Convert Image →'
            )}
          </button>

          {processedBlob && (
            <DownloadButton blob={processedBlob} filename={suggestedName} />
          )}
        </div>
      )}

      {error && <ErrorDisplay message={error} />}
    </div>
  );
}

/* ──────────── shared ──────────── */

function ErrorDisplay({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20"
    >
      <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-rose-400">Error</p>
        <p className="text-xs text-rose-400/80 mt-0.5">{message}</p>
      </div>
    </motion.div>
  );
}

function DailyLimitModal({
  remaining,
  onGoPro,
  onClose,
}: {
  remaining: number;
  onGoPro: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-[#1a1a2e] border border-white/[0.08] p-8 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 flex items-center justify-center">
          <span className="text-3xl">🔥</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Daily Limit Reached</h3>
        <p className="text-sm text-slate-400 mb-6">
          You&apos;ve used all {10 - remaining} free conversions today. Upgrade to Pro for
          unlimited conversions!
        </p>
        <div className="space-y-3">
          <button
            onClick={onGoPro}
            className="w-full cf-pro-gradient py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Go Pro — Unlimited
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Maybe Tomorrow
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PremiumUpsell() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-amber-500/10 border border-white/[0.06]">
      <Crown className="w-5 h-5 text-rose-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white">Upgrade for more</p>
        <p className="text-[11px] text-slate-500">Unlimited conversions, batch processing, all formats</p>
      </div>
      <a
        href="#pricing"
        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
      >
        Go Pro
      </a>
    </div>
  );
}

/* ──────────── loading skeletons ──────────── */

function TextOutputSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-3 bg-white/[0.06] rounded w-1/4" />
      <div className="cf-textarea p-4 space-y-2 min-h-[300px]">
        <div className="h-3 bg-white/[0.06] rounded w-3/4" />
        <div className="h-3 bg-white/[0.06] rounded w-1/2" />
        <div className="h-3 bg-white/[0.06] rounded w-5/6" />
        <div className="h-3 bg-white/[0.06] rounded w-2/3" />
        <div className="h-3 bg-white/[0.06] rounded w-1/2" />
        <div className="h-3 bg-white/[0.06] rounded w-4/5" />
        <div className="h-3 bg-white/[0.06] rounded w-1/3" />
      </div>
    </div>
  );
}

function FileOutputSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-white/[0.06] rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
          <div className="h-3 bg-white/[0.06] rounded w-24" />
        </div>
      </div>
    </div>
  );
}

/* ──────────── main component ──────────── */

export default function ToolWorkspace() {
  const {
    activeTool,
    inputText,
    setInputText,
    outputText,
    isProcessing,
    error,
    progress,
    processedBlob,
    uploadedFile,
    setUploadedFile,
    setView,
    resetTool,
    incrementUsage,
    isPremium,
    dailyUsageCount,
    processText,
    processFile,
  } = useStore();

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [pendingConvert, setPendingConvert] = useState<(() => void) | null>(null);

  // Track last output to detect conversion completion
  const prevOutputRef = useRef<string>('');

  useEffect(() => {
    // When outputText changes from empty to non-empty and we were processing, conversion completed
    if (outputText && !isProcessing && outputText !== prevOutputRef.current && activeTool) {
      incrementUsage(activeTool);
      recordRecentTool(activeTool);
      toast.success('Conversion complete!', {
        description: `Your ${tool?.name || 'conversion'} is ready.`,
      });
    }
    prevOutputRef.current = outputText;
  }, [outputText, isProcessing, activeTool, tool?.name]);

  // Also detect blob completion
  const prevBlobRef = useRef<Blob | null>(null);
  useEffect(() => {
    if (processedBlob && !isProcessing && processedBlob !== prevBlobRef.current && activeTool) {
      incrementUsage(activeTool);
      recordRecentTool(activeTool);
      toast.success('Conversion complete!', {
        description: `Your ${tool?.name || 'file'} is ready.`,
      });
    }
    prevBlobRef.current = processedBlob;
  }, [processedBlob, isProcessing, activeTool, tool?.name]);

  const tool = useMemo(() => tools.find((t) => t.id === activeTool), [activeTool]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTool]);

  const checkLimitAndRun = useCallback(
    (fn: () => void) => {
      if (isPremium) {
        fn();
        return;
      }
      if (dailyUsageCount >= 10) {
        setShowLimitModal(true);
        setPendingConvert(() => fn);
        return;
      }
      incrementUsage();
      fn();
    },
    [isPremium, dailyUsageCount, incrementUsage]
  );

  const handleConvertText = useCallback(() => {
    if (!activeTool || !inputText.trim()) return;
    checkLimitAndRun(() => processText());
  }, [activeTool, inputText, processText, checkLimitAndRun]);

  const handleConvertFile = useCallback(() => {
    if (!activeTool || !uploadedFile) return;
    checkLimitAndRun(() => processFile());
  }, [activeTool, uploadedFile, processFile, checkLimitAndRun]);

  if (!tool) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Tool not found.</p>
        <button
          onClick={() => setView('home')}
          className="mt-4 text-amber-400 text-sm hover:underline"
        >
          Go back home
        </button>
      </div>
    );
  }

  const isSpecial = tool.type === 'special';
  const isTextToText = tool.type === 'text-to-text';
  const isFileToFile = tool.type === 'file-to-file';
  const isFileToText = tool.type === 'file-to-text';
  const isTextToFile = tool.type === 'text-to-file';

  const renderSpecialUI = () => {
    const id = tool.id;
    if (id.includes('color')) return <ColorConverterUI />;
    if (id.includes('case')) return <CaseConverterUI />;
    if (id.includes('hash')) return <HashGeneratorUI />;
    if (id.includes('json')) return <JsonFormatterUI />;
    if (id.includes('epoch')) return <EpochConverterUI />;
    if (tool.category === 'image') return <ImageConverterUI />;
    // fallback: generic text-to-text
    return <GenericTextToTextUI />;
  };

  const GenericTextToTextUI = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400">Input</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Enter ${tool.name.toLowerCase()} input…`}
          rows={12}
          className="cf-textarea w-full px-4 py-3 text-sm resize-none"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-400">Output</label>
          {!isProcessing && outputText && <CopyButton text={outputText} />}
        </div>
        {isProcessing ? (
          <TextOutputSkeleton />
        ) : (
          <div className="cf-textarea p-4 text-sm min-h-[300px] text-slate-200 overflow-auto max-h-96">
            {outputText || <span className="text-slate-600">Result will appear here…</span>}
          </div>
        )}
      </div>
    </div>
  );

  const remaining = Math.max(0, 10 - dailyUsageCount);

  return (
    <>
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => {
              resetTool();
              setView('home');
            }}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-500">Files never leave your device</span>
          </div>
        </div>

        {/* Tool header */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${tool.gradient}`}
          >
            {tool.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{tool.name}</h1>
            <p className="text-xs text-slate-500">
              {categoryLabels[tool.category]} • {tool.type.replace(/-/g, ' ')}
            </p>
          </div>
        </div>

        {/* Usage counter */}
        {!isPremium && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${(dailyUsageCount / 10) * 100}%` }}
              />
            </div>
            <span className="flex-shrink-0">
              {remaining} of 10 free conversions remaining today
            </span>
          </div>
        )}

        {/* Ad banner above */}
        <AdBanner label="workspace-top" />

        {/* Error */}
        <AnimatePresence>
          {error && <ErrorDisplay message={error} />}
        </AnimatePresence>

        {/* Progress */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProgressBar progress={progress} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tool UI */}
        {isSpecial ? (
          renderSpecialUI()
        ) : isTextToText ? (
          <div className="space-y-4">
            <GenericTextToTextUI />
            <button
              onClick={handleConvertText}
              disabled={isProcessing || !inputText.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Converting…
                </span>
              ) : (
                'Convert →'
              )}
            </button>
          </div>
        ) : isFileToFile ? (
          <div className="space-y-4">
            <FileUploader
              accept="*/*"
              multiple={false}
              maxFiles={1}
              maxSize={50 * 1024 * 1024}
              files={uploadedFile ? [uploadedFile] : []}
              onFilesChange={(files) => setUploadedFile(files[0] || null)}
              hint="Upload any file — up to 50 MB"
            />
            <button
              onClick={handleConvertFile}
              disabled={isProcessing || !uploadedFile}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Converting…
                </span>
              ) : (
                'Convert →'
              )}
            </button>
            {processedBlob && (
              <DownloadButton
                blob={processedBlob}
                filename={uploadedFile ? `converted-${uploadedFile.name}` : 'converted-file'}
              />
            )}
          </div>
        ) : isFileToText ? (
          <div className="space-y-4">
            <FileUploader
              accept="*/*"
              multiple={false}
              maxFiles={1}
              maxSize={50 * 1024 * 1024}
              files={uploadedFile ? [uploadedFile] : []}
              onFilesChange={(files) => setUploadedFile(files[0] || null)}
              hint="Upload a file to extract text"
            />
            <button
              onClick={handleConvertFile}
              disabled={isProcessing || !uploadedFile}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing…
                </span>
              ) : (
                'Extract Text →'
              )}
            </button>
            {outputText && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">Extracted Text</label>
                  <CopyButton text={outputText} />
                </div>
                <div className="cf-textarea p-4 text-sm text-slate-200 overflow-auto max-h-96">
                  {outputText}
                </div>
              </div>
            )}
          </div>
        ) : isTextToFile ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Input</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Enter ${tool.name.toLowerCase()} input…`}
                rows={10}
                className="cf-textarea w-full px-4 py-3 text-sm resize-none"
              />
            </div>
            <button
              onClick={handleConvertText}
              disabled={isProcessing || !inputText.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Converting…
                </span>
              ) : (
                'Convert & Download →'
              )}
            </button>
            {processedBlob && (
              <DownloadButton blob={processedBlob} filename="converted.txt" />
            )}
          </div>
        ) : null}

        {/* Premium upsell */}
        {!isPremium && (outputText || processedBlob) && (
          <div className="pt-2">
            <PremiumUpsell />
          </div>
        )}

        {/* Social share */}
        {(outputText || processedBlob) && (
          <div className="pt-2">
            <SocialShare
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={`I just used ${tool.name} on ConvertFlow — check it out!`}
            />
          </div>
        )}

        {/* Ad banner below */}
        <AdBanner label="workspace-bottom" />
      </div>

      {/* Daily limit modal */}
      <AnimatePresence>
        {showLimitModal && (
          <DailyLimitModal
            remaining={remaining}
            onGoPro={() => {
              setShowLimitModal(false);
              // Trigger Go Pro flow (parent handles via store)
            }}
            onClose={() => setShowLimitModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}