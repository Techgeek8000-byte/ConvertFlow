'use client';

import { ExternalLink } from 'lucide-react';

const allTools = [
  { name: 'ToolPDF', emoji: '📄', desc: 'Free PDF tools — merge, split, compress, convert.', href: 'https://tool-pdf-six.vercel.app', color: 'from-sky-500/20 to-blue-500/20' },
  { name: 'CalcHub', emoji: '🧮', desc: 'Free calculators for math, finance, health & more.', href: 'https://calc-hub-ashy.vercel.app', color: 'from-emerald-500/20 to-teal-500/20' },
  { name: 'ConvertFlow', emoji: '🔄', desc: 'Free unit converters — length, weight, temperature.', href: 'https://convert-flow-beta.vercel.app', color: 'from-amber-500/20 to-orange-500/20' },
  { name: 'SEOKit', emoji: '🔍', desc: 'Free SEO tools — meta tags, SERP preview & more.', href: 'https://seo-kit-tau.vercel.app', color: 'from-purple-500/20 to-violet-500/20' },
  { name: 'PixelForge AI', emoji: '🎨', desc: 'Free AI image generator — avatars, logos, art & more.', href: 'https://pixelforge-ai-chi.vercel.app', color: 'from-pink-500/20 to-rose-500/20' },
];

interface Props { exclude: string; }

export default function CrossPromo({ exclude }: Props) {
  const tools = allTools.filter(t => t.name !== exclude);
  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <h2 className="text-xl font-bold text-slate-200 text-center mb-8">
        More <span className="text-purple-400">Free Tools</span> by Us
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map(t => (
          <a key={t.name} href={t.href} target="_blank" rel="noopener noreferrer"
            className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{t.emoji}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">{t.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
}