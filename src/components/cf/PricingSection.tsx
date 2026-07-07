'use client';

import { Check, Crown, Zap, Star, Clock, Infinity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingSectionProps { onGoPro?: () => void; }

const plans = [
  { name: 'Free', price: null, period: null, badge: null, features: ['10 conversions/day', 'All tools', 'Basic formats'], cta: 'Current Plan', highlighted: false, icon: <Star className="w-5 h-5 text-rose-400" /> },
  { name: 'Weekly', price: '$1', period: '/week', badge: null, features: ['Unlimited conversions', 'All formats', 'Batch processing'], cta: 'Get Weekly', highlighted: false, icon: <Clock className="w-5 h-5 text-rose-400" /> },
  { name: 'Monthly', price: '$2', period: '/mo', originalPrice: '$4', badge: 'SAVE 50%', features: ['Unlimited conversions', 'All formats', 'Batch processing', 'Priority support', 'API access (soon)'], cta: 'Get Monthly', highlighted: true, icon: <Zap className="w-5 h-5 text-rose-400" /> },
  { name: 'Yearly', price: '$12', period: '/year', originalPrice: '$24', badge: 'SAVE 50%', features: ['Everything in Monthly', 'Priority support', 'Save $12/year', 'All future tools'], cta: 'Get Yearly', highlighted: false, icon: <Infinity className="w-5 h-5 text-rose-400" /> },
  { name: 'Lifetime', price: '$25', period: 'one-time', originalPrice: '$48', badge: 'BEST VALUE', features: ['Everything in Yearly', 'Lifetime access', 'No recurring payments', 'All future updates', 'Best value'], cta: 'Get Lifetime', highlighted: false, icon: <Crown className="w-5 h-5 text-amber-400" /> },
];

export default function PricingSection({ onGoPro }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4"><Crown className="w-3.5 h-3.5" /> Upgrade for more power</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Start free, upgrade when you need more. No hidden fees.</p>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }} className={`relative rounded-2xl p-4 flex flex-col ${plan.highlighted ? 'bg-gradient-to-b from-rose-500/10 via-[#1a1a2e] to-[#1a1a2e] border-2 border-rose-500/30 shadow-[0_0_40px_-10px_rgba(244,63,94,0.2)]' : 'bg-[#1a1a2e] border border-white/[0.06]'}`}>
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white rounded-full shadow-lg ${plan.badge === 'BEST VALUE' ? 'bg-amber-500 shadow-amber-500/25' : 'bg-rose-500'}`}>{plan.badge === 'SAVE 50%' && <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />}{plan.badge}</div>
              )}
              <div className="flex items-center gap-2 mb-3">{plan.icon}<h3 className="text-sm font-semibold text-white">{plan.name}</h3></div>
              <div className="mb-4">{plan.price ? (<div className="flex items-baseline gap-1">{plan.originalPrice && <span className="text-xs text-slate-600 line-through">{plan.originalPrice}</span>}<span className="text-3xl font-extrabold text-white">{plan.price}</span><span className="text-xs text-slate-500">{plan.period}</span></div>) : <div className="text-3xl font-extrabold text-white">Free</div>}</div>
              <ul className="space-y-2 mb-6 flex-1">{plan.features.map((f) => (<li key={f} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" /><span className="text-xs text-slate-300">{f}</span></li>))}</ul>
              {plan.name === 'Free' ? <div className="w-full py-2.5 text-xs text-center text-slate-500 border border-white/[0.04] rounded-xl">Current Plan</div> : <button onClick={onGoPro} className={`w-full py-2.5 text-xs font-semibold text-white rounded-xl transition-opacity hover:opacity-90 ${plan.highlighted ? 'cf-pro-gradient' : 'bg-white/[0.08] hover:bg-white/[0.12]'}`}>{plan.cta}</button>}
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-600 mt-8">Secure checkout via <span className="text-slate-400 font-medium">LemonSqueezy</span></p>
      </div>
    </section>
  );
}
