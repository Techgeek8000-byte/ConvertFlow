import { ExternalLink } from 'lucide-react';

const toolCategoryAnchors = [
  { label: 'Data Format', anchor: 'tools' },
  { label: 'Text & Document', anchor: 'tools' },
  { label: 'Image', anchor: 'tools' },
  { label: 'Encoding & Crypto', anchor: 'tools' },
  { label: 'Developer Tools', anchor: 'tools' },
  { label: 'Color & Design', anchor: 'tools' },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-[#0a0a12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ad banner placeholder */}
        <div className="py-6">
          <div className="cf-ad-placeholder w-full h-[90px] flex items-center justify-center">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider">Advertisement</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-t border-white/[0.04]">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="inline-flex items-center gap-2 mb-3">
              <span className="text-xl">⚡</span>
              <span className="text-lg font-bold cf-gradient-text">ConvertFlow</span>
            </a>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              20+ free file, data, and image converters. Private, fast, and works offline.
            </p>
          </div>

          {/* Tool categories */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Tools
            </h4>
            <ul className="space-y-2">
              {toolCategoryAnchors.map((cat) => (
                <li key={cat.label}>
                  <a
                    href={`#${cat.anchor}`}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {cat.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cross-promo */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              More Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://tool-pdf-six.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  ToolPDF
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://calchub.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  CalcHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/privacy"
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-6 border-t border-white/[0.04] text-center">
          <p className="text-xs text-slate-600">
            © 2025 ConvertFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}