'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    priceSubtext: 'Forever',
    features: [
      'Up to 10 active listings',
      '3 marketplace connections',
      'Manual image upload',
      'Basic listing templates',
      'Community support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '\u00A314.99',
    priceSubtext: 'Billed monthly',
    features: [
      'Unlimited active listings',
      'All 7 marketplaces',
      'Automatic image sync',
      'Smart auto-fill',
      'Priority support',
      'Bulk listing tools',
    ],
    cta: 'Start Pro Free Trial',
    popular: true,
    badge: 'Most Popular',
  },
  {
    name: 'Business',
    price: '\u00A329.99',
    priceSubtext: 'Billed monthly',
    features: [
      'Everything in Pro',
      'Multiple user accounts',
      'Advanced analytics',
      'Inventory tracking',
      'Dedicated account manager',
      'Custom integrations',
    ],
    cta: 'Start Business Free Trial',
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-28 px-4" aria-labelledby="pricing-heading">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple pricing that grows with you
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Start free. Upgrade when you are ready. No hidden fees, no contracts.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative p-8 rounded-2xl border-2 bg-white transition-all duration-300 ${
                plan.popular
                  ? 'border-indigo-600 shadow-lg scale-[1.02]'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className="text-xl font-semibold text-gray-900">
                {plan.name}
              </h3>
              <div className="mt-4 mb-1">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-6">{plan.priceSubtext}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-gray-600 text-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`inline-flex items-center justify-center w-full h-12 px-6 rounded-xl font-semibold transition-all text-sm ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-900'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
