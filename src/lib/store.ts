import { create } from 'zustand';

interface AppState {
  // View
  currentView: 'home' | 'workspace';
  setView: (view: 'home' | 'workspace') => void;

  // Active tool
  activeTool: string | null;
  setActiveTool: (id: string | null) => void;

  // Text conversion
  inputText: string;
  setInputText: (text: string) => void;
  outputText: string;
  setOutputText: (text: string) => void;

  // File conversion
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  processedBlob: Blob | null;
  setProcessedBlob: (blob: Blob | null) => void;

  // Processing state
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;
  progress: number;
  setProgress: (p: number) => void;

  // Premium / usage
  isPremium: boolean;
  dailyUsageCount: number;
  incrementUsage: () => void;
  resetUsage: () => void;

  // Actions
  processText: (options?: string) => Promise<void>;
  processFile: (options?: string, quality?: number) => Promise<void>;
  resetTool: () => void;

  // Checkout modal
  checkoutOpen: boolean;
  setCheckoutOpen: (v: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // View
  currentView: 'home',
  setView: (view) => set({ currentView: view }),

  // Active tool
  activeTool: null,
  setActiveTool: (id) => set({ activeTool: id }),

  // Text
  inputText: '',
  setInputText: (text) => set({ inputText: text }),
  outputText: '',
  setOutputText: (text) => set({ outputText: text }),

  // File
  uploadedFile: null,
  setUploadedFile: (file) => set({ uploadedFile: file }),
  processedBlob: null,
  setProcessedBlob: (blob) => set({ processedBlob: blob }),

  // Processing
  isProcessing: false,
  setIsProcessing: (v) => set({ isProcessing: v }),
  error: null,
  setError: (err) => set({ error: err }),
  progress: 0,
  setProgress: (p) => set({ progress: p }),

  // Premium
  isPremium: false,
  dailyUsageCount: 0,
  incrementUsage: () =>
    set((s) => ({ dailyUsageCount: s.dailyUsageCount + 1 })),
  resetUsage: () => set({ dailyUsageCount: 0 }),

  // Process text
  processText: async (options?: string) => {
    const { activeTool, inputText } = get();
    if (!activeTool) return;

    set({ isProcessing: true, error: null, outputText: '', progress: 10 });
    try {
      // Dynamic import to avoid circular deps — but keep inline for simplicity
      const { runConversion } = await import('@/lib/converters');
      set({ progress: 40 });
      const result = await runConversion(activeTool, inputText, options);
      set({ progress: 90 });
      set({ outputText: result, progress: 100 });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Conversion failed' });
    } finally {
      setTimeout(() => set({ isProcessing: false, progress: 0 }), 300);
    }
  },

  // Process file
  processFile: async (options?: string, quality?: number) => {
    const { activeTool, uploadedFile, inputText } = get();
    if (!activeTool) return;

    set({ isProcessing: true, error: null, processedBlob: null, outputText: '', progress: 10 });
    try {
      const { runFileConversion } = await import('@/lib/converters');
      set({ progress: 30 });

      let result: string | Blob;

      if (uploadedFile) {
        set({ progress: 50 });
        result = await runFileConversion(activeTool, uploadedFile, options, quality);
      } else {
        // text-to-file
        const { runConversion } = await import('@/lib/converters');
        result = await runConversion(activeTool, inputText, options);
      }

      set({ progress: 90 });

      if (result instanceof Blob) {
        set({ processedBlob: result });
      } else {
        set({ outputText: result });
      }

      set({ progress: 100 });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Conversion failed' });
    } finally {
      setTimeout(() => set({ isProcessing: false, progress: 0 }), 300);
    }
  },

  // Reset
  resetTool: () =>
    set({
      inputText: '',
      outputText: '',
      uploadedFile: null,
      processedBlob: null,
      isProcessing: false,
      error: null,
      progress: 0,
    }),

  // Checkout modal
  checkoutOpen: false,
  setCheckoutOpen: (v) => set({ checkoutOpen: v }),
}));