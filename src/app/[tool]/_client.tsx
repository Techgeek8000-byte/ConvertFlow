'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import Header from '@/components/cf/Header';
import ToolWorkspace from '@/components/cf/ToolWorkspace';
import Footer from '@/components/cf/Footer';

interface ToolMeta { title: string; description: string; keywords: string[]; intro?: string; faqs?: { question: string; answer: string }[]; }

export default function ToolPageClient({ toolSlug, toolMeta }: { toolSlug: string; toolMeta?: ToolMeta }) {
  const setActiveTool = useStore((s) => s.setActiveTool);
  const setView = useStore((s) => s.setView);

  useEffect(() => { if (toolMeta) { setActiveTool(toolSlug); setView('workspace'); } }, [toolSlug, toolMeta, setActiveTool, setView]);

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
      <main className="flex-1">
        {toolMeta.intro && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-2">
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.06]">
              <h1 className="text-xl font-bold text-slate-200 mb-2">{toolMeta.title ? (toolMeta.title.split(' — ')[0] || toolMeta.title) : ''}</h1>
              <p className="text-sm text-slate-400 leading-relaxed">{toolMeta.intro}</p>
            </div>
          </div>
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ToolWorkspace /></div>
        {toolMeta.faqs && toolMeta.faqs.length > 0 && (
          <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity: toolMeta.faqs.map(f => ({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))})}} />
            <section className="mt-8 mb-4 max-w-4xl mx-auto px-4 sm:px-6">
              <h2 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {toolMeta.faqs.map((faq, i) => (
                  <details key={i} className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] group">
                    <summary className="text-sm font-medium text-slate-300 cursor-pointer hover:text-white transition-colors list-none [&::-webkit-details-marker]:hidden">{faq.question}</summary>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
