'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    step: '1',
    title: 'Create Your Listing',
    description:
      'Add your photos, title, description, and price once in the SyncSellr dashboard.',
  },
  {
    step: '2',
    title: 'Select Marketplaces',
    description:
      'Choose which platforms to publish to. Pick all 7 or just the ones you want.',
  },
  {
    step: '3',
    title: 'Publish Everywhere',
    description:
      'Hit publish and SyncSellr sends your listing to every selected marketplace in seconds.',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-gray-200" />

          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              {/* Step number circle */}
              <div className="relative inline-flex mb-6">
                <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold relative z-10">
                  {item.step}
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
