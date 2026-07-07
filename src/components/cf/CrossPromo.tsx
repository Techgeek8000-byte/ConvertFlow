'use client';

import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props { exclude?: string; }

const allTools = [
  {
    name: 'ToolPDF',
    emoji: '📄',
    description: 'Merge, split, compress, convert, rotate, watermark, and protect PDFs — all in your browser.',
    url: 'https://tool-pdf-six.vercel.app',
    gradient: 'from-rose-500/20 via-[#1a1a2e] to-[#1a1a2e]',
    borderGradient: 'border-rose-500/20',
    hoverBorder: 'hover:border-rose-500/40',
  },
  {
    name: 'CalcHub',
    emoji: '🧮',
    description: '20+ free calculators for finance, health, math, and everyday use. 100% private.',
    url: 'https://calc-hub-ashy.vercel.app',
    gradient: 'from-emerald-500/20 via-[#1a1a2e] to-[#1a1a2e]',
    borderGradient: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40',
  },
  {
    name: 'SEOKit',
    emoji: '🔍',
    description: 'Free SEO tools — meta tags, SERP preview, keyword density, and more.',
    url: 'https://seo-kit-tau.vercel.app',
    gradient: 'from-purple-500/20 via-[#1a1a2e] to-[#1a1a2e]',
    borderGradient: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/40',
  },
  {
    name: 'PixelForge AI',
    emoji: '🎨',
    description: 'Free AI image generator — avatars, logos, art, and more.',
    url: 'https://pixelforge-ai-chi.vercel.app',
    gradient: 'from-pink-500/20 via-[#1a1a2e] to-[#1a1a2e]',
    borderGradient: 'border-pink-500/20',
    hoverBorder: 'hover:border-pink-500/40',
  },
];

export default function CrossPromo({ exclude }: Props) {
  const tools = exclude ? allTools.filter(t => t.name !== exclude) : allTools;
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            More Tools You&apos;ll Love
          </h2>
          <p className="text-sm text-slate-500">
            From the same maker — more free, privacy-first tools
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((item, i) => (
            <motion.a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`group relative block rounded-2xl bg-gradient-to-b ${item.gradient} border ${item.borderGradient} ${item.hoverBorder} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="flex-shrink-0 mt-1 w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
