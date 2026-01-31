'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  ShieldCheck,
  Package,
  LayoutGrid,
  BarChart3,
  Network,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'One-Click Cross-Listing',
    description:
      'Create your listing once and publish to all platforms instantly with our Chrome extension.',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    icon: ShieldCheck,
    title: 'Auto-Delist on Sale',
    description:
      'When an item sells, we automatically remove it from other platforms to prevent double-selling.',
    color: 'bg-secondary-50 text-secondary-600',
  },
  {
    icon: Package,
    title: 'Wholesale Catalog',
    description:
      "Access Tom's wholesale furniture catalog with pre-loaded photos and descriptions.",
    color: 'bg-accent-50 text-accent-600',
  },
  {
    icon: LayoutGrid,
    title: 'Inventory Management',
    description:
      'Track all your items, costs, and profits in one centralized dashboard.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description:
      'See which platforms sell best, track profit margins, and optimize your listings.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Network,
    title: 'Multi-Platform Support',
    description:
      'eBay, Facebook Marketplace, and Gumtree \u2014 with more platforms coming soon.',
    color: 'bg-cyan-50 text-cyan-600',
  },
];

export const FeaturesGrid = () => {
  return (
    <section id="features" className="py-24 px-4 bg-neutral-50" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Everything you need to scale your furniture business
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto text-lg">
            Powerful tools built specifically for furniture resellers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color} mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
