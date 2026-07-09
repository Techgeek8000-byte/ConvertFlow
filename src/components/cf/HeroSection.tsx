'use client';

import { useState, useEffect } from 'react';
import { Search, Shield, Zap, WifiOff, Gift, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTotalUsage, getUsageCounts } from '@/lib/usage-counter';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const badges = [
  { icon: Gift, label: '100% Free', sub: 'daily limit' },
  { icon: Lock, label: 'No Upload Needed', sub: 'for text tools' },
  { icon: Zap, label: 'Lightning Fast', sub: '' },
];

const stats = [
  { value: '20+', label: 'Tools' },
  { value: '100%', label: 'Private' },
  { value: 'Works', label: 'Offline' },
];

export default function HeroSection({ searchQuery, onSearchChange }: HeroSectionProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [totalUsage, setTotalUsage] = useState(0);

  useEffect(() => {
    setTotalUsage(getTotalUsage());
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-amber-500/[0.07] via-orange-500/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
        >
          Convert Anything,{' '}
          <span className="cf-gradient-text-animated">Instantly</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          20+ free file, data, and image converters. Files never leave your device.
        </motion.p>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {badges.map((badge) => (
            <span
              key={badge.label}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] border border-white/[0.08] text-slate-300"
            >
              <badge.icon className="w-3.5 h-3.5 text-amber-400" />
              {badge.label}
              {badge.sub && (
                <span className="text-slate-500">({badge.sub})</span>
              )}
            </span>
          ))}
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 max-w-xl mx-auto"
        >
          <div
            className={`relative flex items-center rounded-xl border transition-all duration-300 ${
              isFocused
                ? 'border-amber-500/40 shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)]'
                : 'border-white/[0.08] hover:border-white/[0.14]'
            } bg-[#1a1a2e]`}
          >
            <Search className="absolute left-4 w-5 h-5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search converters…"
              className="w-full bg-transparent pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex items-center justify-center gap-8 sm:gap-12"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5">
              {stat.label === 'Tools' && (
                <Zap className="w-4 h-4 text-amber-400" />
              )}
              {stat.label === 'Private' && (
                <Shield className="w-4 h-4 text-emerald-400" />
              )}
              {stat.label === 'Offline' && (
                <WifiOff className="w-4 h-4 text-orange-400" />
              )}
              <div className="text-left">
                <div className="text-sm font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </div>
          ))}
          {totalUsage > 0 && (
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div className="text-left">
                <div className="text-sm font-bold text-white">{totalUsage}</div>
                <div className="text-xs text-slate-500">Conversions</div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}