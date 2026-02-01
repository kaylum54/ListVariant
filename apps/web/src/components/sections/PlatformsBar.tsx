'use client';

import { motion } from 'framer-motion';

const platforms = [
  'eBay',
  'Facebook',
  'Gumtree',
  'Etsy',
  'Vinted',
  'Depop',
  'Poshmark',
];

export const PlatformsBar = () => {
  return (
    <section className="py-16 bg-gray-50 border-y border-gray-200" aria-label="Supported marketplace platforms">
      <div className="max-w-7xl mx-auto px-4">
        <motion.p
          className="text-center text-gray-900 font-semibold text-lg mb-2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          List across all major UK marketplaces
        </motion.p>
        <motion.p
          className="text-center text-gray-500 text-sm mb-8"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          One listing. Every platform your buyers already use.
        </motion.p>
        <div className="flex justify-center items-center gap-3 flex-wrap">
          {platforms.map((platform, i) => (
            <motion.span
              key={platform}
              className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 bg-white border border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              {platform}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};
