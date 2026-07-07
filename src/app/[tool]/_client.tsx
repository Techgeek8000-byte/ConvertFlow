'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import Header from '@/components/cf/Header';
import ToolWorkspace from '@/components/cf/ToolWorkspace';
import Footer from '@/components/cf/Footer';

interface ToolMeta { title: string; description: string; keywords: string[]; }

export default function ToolPageClient({ toolSlug, toolMeta }: { toolSlug: string; toolMeta?: ToolMeta }) {
  const setActiveTool = useStore((s) => s.setActiveTool);
  const setView = useStore((s) => s.setView);

  useEffect(() => {
    if (toolMeta) { setActiveTool(toolSlug); setView('workspace'); }
  }, [toolSlug, toolMeta, setActiveTool, setView]);

  if (!toolMeta) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0c0c14 0%, #141422 100%)' }}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center"><h1 className="text-2xl font-bold text-slate-300">Converter not found</h1><p className="text-slate-500 mt-2">This converter tool does not exist.</p></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0c0c14 0%, #141422 100%)' }}>
      <Header />
      <main className="flex-1"><div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ToolWorkspace /></div></main>
      <Footer />
    </div>
  );
}
