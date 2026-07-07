'use client';

import { X, Crown, Check, Sparkles, Zap, Clock, Infinity } from 'lucide-react';
import { LEMON_SQUEEZY } from '@/lib/lemonsqueezy';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutModalProps { isOpen: boolean; onClose: () => void; }

const options = [
  { name: 'Weekly', price: '$1/week', description: 'Billed weekly. Cancel anytime.', icon: <Clock className="w-5 h-5 text-rose-400" />, popular: false, features: ['Unlimited conversions', 'All formats', 'Batch processing'] },
  { name: 'Monthly', price: '$2/mo', originalPrice: '$4/mo', description: 'Save 50% vs weekly. Billed monthly.', icon: <Zap className="w-5 h-5 text-rose-400" />, popular: true, features: ['Unlimited conversions', 'All formats', 'Batch processing', 'Priority support'] },
  { name: 'Yearly', price: '$12/yr', originalPrice: '$24/yr', description: 'Save 50% vs monthly. Best for regulars.', icon: <Infinity className="w-5 h-5 text-emerald-400" />, popular: false, features: ['Everything in Monthly', 'Priority support', 'Save $12/year'] },
  { name: 'Lifetime', price: '$25', originalPrice: '$48', description: 'Pay once. Use forever.', icon: <Crown className="w-5 h-5 text-amber-400" />, popular: false, features: ['Everything in Yearly', 'Lifetime access', 'All future updates', 'Best value'] },
];

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-[#141422] border border-white/[0.08] p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05]"><X className="w-5 h-5" /></button>
            <div className="text-center mb-8"><div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center"><Crown className="w-7 h-7 text-rose-400" /></div><h3 className="text-2xl font-extrabold text-white mb-1">Upgrade to Pro</h3><p className="text-sm text-slate-400">Get unlimited power for your conversions</p></div>
            <div className="space-y-3 mb-6">
              {options.map((opt) => (
                <div key={opt.name} className={`relative rounded-xl p-5 border ${opt.popular ? 'bg-gradient-to-r from-rose-500/10 to-purple-500/10 border-rose-500/20' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                  <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2">{opt.icon}<h4 className="text-base font-bold text-white">{opt.name}</h4></div><div className="flex items-center gap-2">{opt.originalPrice && <span className="text-xs text-slate-600 line-through">{opt.originalPrice}</span>}<span className="text-lg font-bold text-white flex-shrink-0">{opt.price}</span></div></div>
                  <p className="text-xs text-slate-500 mb-3">{opt.description}</p>
                  <ul className="space-y-1.5 mb-4">{opt.features.map((f) => (<li key={f} className="flex items-center gap-2 text-xs text-slate-300"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />{f}</li>))}</ul>
                  <button className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 ${opt.popular ? 'cf-pro-gradient text-white' : 'bg-white/[0.08] text-white hover:bg-white/[0.12]'}`}>Get Pro — {opt.price}</button>
                </div>
              ))}
            </div>
            <p className="text-center text-[11px] text-slate-600">Secure checkout via <span className="text-slate-400 font-medium">LemonSqueezy</span></p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
