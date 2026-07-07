'use client';

const allTools = [
  { name: 'ToolPDF', emoji: '📄', desc: 'Free PDF tools — merge, split, compress, convert.', href: 'https://tool-pdf-six.vercel.app' },
  { name: 'CalcHub', emoji: '🧮', desc: 'Free calculators for math, finance, health & more.', href: 'https://calc-hub-ashy.vercel.app' },
  { name: 'ConvertFlow', emoji: '🔄', desc: 'Free unit converters — length, weight, temperature.', href: 'https://convert-flow-beta.vercel.app' },
  { name: 'SEOKit', emoji: '🔍', desc: 'Free SEO tools — meta tags, SERP preview & more.', href: 'https://seo-kit-tau.vercel.app' },
  { name: 'PixelForge AI', emoji: '🎨', desc: 'Free AI image generator — avatars, logos, art & more.', href: 'https://pixelforge-ai-chi.vercel.app' },
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
            className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{t.emoji}</span>
              <span className="text-xs text-slate-600">↗</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-200">{t.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
}