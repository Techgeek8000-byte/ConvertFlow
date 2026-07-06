'use client';

import { X, Crown, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const options = [
  {
    name: 'Pro Monthly',
    price: '$2/mo',
    badge: 'Most Popular',
    features: ['Unlimited conversions', 'All formats', 'Batch processing'],
    highlighted: true,
  },
  {
    name: 'Pro Lifetime',
    price: '$29 one-time',
    badge: 'Best Value',
    features: [
      'Unlimited conversions',
      'All formats',
      'Batch processing',
      'All future updates',
    ],
    highlighted: false,
  },
];

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-[#141422] border border-white/[0.08] p-8 relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center">
                <Crown className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-1">Upgrade to Pro</h3>
              <p className="text-sm text-slate-400">Get unlimited power for your conversions</p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {options.map((opt) => (
                <div
                  key={opt.name}
                  className={`relative rounded-xl p-5 border transition-colors cursor-pointer ${
                    opt.highlighted
                      ? 'bg-gradient-to-r from-rose-500/10 to-purple-500/10 border-rose-500/20 hover:border-rose-500/40'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  {opt.badge && (
                    <div className="absolute -top-2.5 right-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-purple-500 text-white">
                        {opt.badge === 'Most Popular' && (
                          <Sparkles className="w-2.5 h-2.5" />
                        )}
                        {opt.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="text-base font-bold text-white">{opt.name}</h4>
                    <span className="text-lg font-bold text-white flex-shrink-0">
                      {opt.price}
                    </span>
                  </div>

                  <ul className="space-y-1.5">
                    {opt.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs text-slate-300">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 ${
                      opt.highlighted
                        ? 'cf-pro-gradient text-white'
                        : 'bg-white/[0.08] text-white hover:bg-white/[0.12]'
                    }`}
                  >
                    {/* Placeholder: will be LemonSqueezy checkout link */}
                    Get {opt.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Checkout note */}
            <p className="text-center text-[11px] text-slate-600">
              Secure checkout via <span className="text-slate-400 font-medium">LemonSqueezy</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}