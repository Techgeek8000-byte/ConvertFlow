'use client';

import { Check, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingSectionProps {
  onGoPro?: () => void;
}

const plans = [
  {
    name: 'Free',
    price: null,
    period: null,
    badge: null,
    features: [
      '10 conversions/day',
      'All tools',
      'Basic formats',
    ],
    cta: 'Current Plan',
    highlighted: false,
  },
  {
    name: 'Pro Monthly',
    price: '$2',
    period: '/mo',
    badge: 'Most Popular',
    features: [
      'Unlimited conversions',
      'All formats',
      'Batch processing',
      'Priority support',
      'API access (coming soon)',
    ],
    cta: 'Upgrade',
    highlighted: true,
  },
  {
    name: 'Pro Lifetime',
    price: '$29',
    period: 'one-time',
    badge: 'Best Value',
    features: [
      'Unlimited conversions',
      'All formats',
      'Batch processing',
      'Priority support',
      'API access (coming soon)',
      'All future updates',
    ],
    cta: 'Upgrade',
    highlighted: false,
  },
];

export default function PricingSection({ onGoPro }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
              <Crown className="w-3.5 h-3.5" />
              Upgrade for more power
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Start free, upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </motion.div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-rose-500/10 via-[#1a1a2e] to-[#1a1a2e] border-2 border-rose-500/30 shadow-[0_0_40px_-10px_rgba(244,63,94,0.2)]'
                  : 'bg-[#1a1a2e] border border-white/[0.06]'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-purple-500 text-white">
                    {plan.badge === 'Most Popular' && <Sparkles className="w-3 h-3" />}
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <div className="mb-4">
                <h3 className="text-base font-bold text-white">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.price ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-sm text-slate-500">{plan.period}</span>
                  </div>
                ) : (
                  <div className="text-4xl font-extrabold text-white">Free</div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.highlighted ? (
                <button
                  onClick={onGoPro}
                  className="w-full cf-pro-gradient py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  {plan.cta}
                </button>
              ) : plan.price ? (
                <button
                  onClick={onGoPro}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-slate-300 border border-white/[0.08] hover:bg-white/[0.05] hover:text-white transition-all"
                >
                  {plan.cta}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl text-sm font-medium text-slate-500 border border-white/[0.04] text-center">
                  {plan.cta}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Checkout note */}
        <p className="text-center text-xs text-slate-600 mt-8">
          Secure checkout via <span className="text-slate-400 font-medium">LemonSqueezy</span>
        </p>
      </div>
    </section>
  );
}