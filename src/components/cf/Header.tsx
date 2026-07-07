'use client';

import { useState } from 'react';
import { Menu, X, Crown, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onGoPro?: () => void;
}

const crossLinks = [
  { label: 'ToolPDF', href: 'https://tool-pdf-six.vercel.app' },
  { label: 'CalcHub', href: 'https://calc-hub-ashy.vercel.app' },
  { label: 'SEOKit', href: 'https://seo-kit-tau.vercel.app' },
  { label: 'PixelForge AI', href: 'https://pixelforge-ai-chi.vercel.app' },
];

export default function Header({ onGoPro }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0c0c14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">⚡</span>
            <div className="flex flex-col">
              <span className="text-xl font-bold cf-gradient-text-animated">
                ConvertFlow
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase leading-none">
                A Project by Osama
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#tools"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Home
            </a>

            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/[0.06]">
              {crossLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>

            <button
              onClick={onGoPro}
              className="cf-pro-gradient ml-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <Crown className="w-4 h-4" />
              Go Pro
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/[0.06] bg-[#0c0c14]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <a
                href="#tools"
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-slate-300 hover:text-white transition-colors py-2"
              >
                Home
              </a>

              <div className="border-t border-white/[0.06] pt-3 space-y-3">
                {crossLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors py-1"
                  >
                    {link.label}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>

              <div className="border-t border-white/[0.06] pt-3">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onGoPro?.();
                  }}
                  className="w-full cf-pro-gradient flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <Crown className="w-4 h-4" />
                  Go Pro
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
