'use client';

import { motion } from 'framer-motion';

export const SolutionSection = () => {
  return (
    <section className="py-20 md:py-28 px-4 bg-gray-50" aria-labelledby="solution-heading">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="solution-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Meet SyncSellr: list once, sell everywhere
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            SyncSellr connects all your marketplaces in one place. Create a listing once with your photos, description, and price. Then push it to any combination of 7 UK marketplaces with a single click. No switching tabs. No re-typing. No wasted hours.
          </p>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-3 rounded-xl text-sm font-medium">
            The first UK cross-listing platform to support Gumtree — plus eBay, Facebook Marketplace, Etsy, Vinted, Depop, and Poshmark.
          </div>
        </motion.div>
      </div>
    </section>
  );
};
