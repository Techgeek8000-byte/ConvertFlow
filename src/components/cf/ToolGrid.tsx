'use client';

import { motion } from 'framer-motion';
import {
  Database,
  FileText,
  Image,
  Binary,
  Code2,
  Palette,
} from 'lucide-react';
import { tools, categoryLabels, type ConverterTool } from '@/lib/tool-definitions';
import ToolCard from './ToolCard';

interface ToolGridProps {
  searchQuery: string;
  onToolClick: (id: string) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  data: Database,
  text: FileText,
  image: Image,
  encoding: Binary,
  developer: Code2,
  color: Palette,
};

const categoryOrder = ['data', 'text', 'image', 'encoding', 'developer', 'color'];

export default function ToolGrid({ searchQuery, onToolClick }: ToolGridProps) {
  const query = searchQuery.toLowerCase().trim();

  const filtered = query
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          categoryLabels[t.category]?.toLowerCase().includes(query)
      )
    : tools;

  const grouped: Record<string, ConverterTool[]> = {};
  for (const tool of filtered) {
    if (!grouped[tool.category]) grouped[tool.category] = [];
    grouped[tool.category].push(tool);
  }

  const visibleCategories = categoryOrder.filter((cat) => grouped[cat]?.length);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-white mb-2">No tools found</h3>
        <p className="text-sm text-slate-500">
          Try a different search term
        </p>
      </div>
    );
  }

  return (
    <div id="tools" className="space-y-10 scroll-mt-24">
      {visibleCategories.map((category, catIdx) => {
        const Icon = categoryIcons[category] || Code2;
        const catTools = grouped[category];

        return (
          <motion.section
            key={category}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: catIdx * 0.07 }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white">
                {categoryLabels[category] || category}
              </h2>
              <span className="text-xs text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-full">
                {catTools.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {catTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onClick={onToolClick}
                />
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}