'use client';

import { motion } from 'framer-motion';
import { Zap, Store, Bot, ImagePlus, MapPin, Plug } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'One-Click Listing',
    description:
      'Create your listing once and publish it to multiple marketplaces simultaneously. No more copy-pasting between tabs.',
  },
  {
    icon: Store,
    title: '7 Marketplaces',
    description:
      'Reach buyers on eBay, Facebook, Gumtree, Etsy, Vinted, Depop, and Poshmark from a single dashboard.',
  },
  {
    icon: Bot,
    title: 'Smart Auto-Fill',
    description:
      "Our Chrome extension fills in each marketplace's forms automatically. It handles the quirks of every platform so you don't have to.",
  },
  {
    icon: ImagePlus,
    title: 'Image Sync',
    description:
      'Upload your photos once. SyncSellr sends them to every platform in the right format and dimensions automatically.',
  },
  {
    icon: MapPin,
    title: 'Gumtree Ready',
    description:
      'We are the first UK tool to support Gumtree cross-listing. Reach local buyers that other platforms miss entirely.',
  },
  {
    icon: Plug,
    title: 'Simple Setup',
    description:
      'Install the extension, connect your accounts, and start listing. No API keys or developer setup needed for most platforms.',
  },
];

export const FeaturesGrid = () => {
  return (
    <section id="features" className="py-20 md:py-28 px-4 bg-gray-50" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to list faster
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Powerful tools built for UK marketplace resellers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
