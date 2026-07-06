'use client';

import { motion } from 'framer-motion';
import type { ConverterTool } from '@/lib/tool-definitions';

interface ToolCardProps {
  tool: ConverterTool;
  onClick: (id: string) => void;
}

export default function ToolCard({ tool, onClick }: ToolCardProps) {
  return (
    <motion.button
      onClick={() => onClick(tool.id)}
      className="cf-card cf-tool-card group w-full text-left p-4 flex items-start gap-3.5"
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl ${tool.gradient}`}
      >
        {tool.icon}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
            {tool.name}
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 mt-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
        <svg
          className="w-4 h-4 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
}