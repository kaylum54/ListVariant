'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '\u00A30',
    period: 'forever',
    features: [
      '10 listings per month',
      '2 marketplaces',
      'Basic analytics',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '\u00A314.99',
    period: 'per month',
    features: [
      '100 listings per month',
      'All marketplaces',
      'Full analytics',
      'Bulk operations',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Business',
    price: '\u00A329.99',
    period: 'per month',
    features: [
      'Unlimited listings',
      'All marketplaces',
      'Full analytics',
      'Wholesale catalog access',
      'Discord community role',
      'Priority support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 px-4" aria-labelledby="pricing-heading">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-neutral-600 text-lg max-w-xl mx-auto">
            Start free with 10 listings a month. Upgrade as your furniture business grows.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative p-8 rounded-2xl border-2 bg-white transition-all duration-300 ${
                plan.popular
                  ? 'border-primary-600 shadow-xl shadow-primary-500/10 scale-[1.02]'
                  : 'border-neutral-200 hover:border-primary-200 hover:shadow-lg'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-600 text-white text-sm font-medium px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-xl font-semibold text-neutral-900">
                {plan.name}
              </h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-neutral-900">
                  {plan.price}
                </span>
                <span className="text-neutral-500 ml-1">/{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-neutral-600"
                  >
                    <div className="w-5 h-5 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-secondary-600" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`inline-flex items-center justify-center w-full h-12 px-6 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20'
                    : 'border-2 border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 hover:border-primary-200'
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
