'use client';

import { motion } from 'framer-motion';
import { Copy, Layers, TrendingDown } from 'lucide-react';

const painPoints = [
  {
    icon: Copy,
    title: 'Repetitive Listings',
    description:
      'You copy-paste the same title, description, and price across every platform. One item can take 30+ minutes to list everywhere. That is time you should spend sourcing.',
  },
  {
    icon: Layers,
    title: 'Platform Overload',
    description:
      'Each marketplace has different forms, different rules, and different image requirements. Keeping track of seven platforms means seven sets of problems.',
  },
  {
    icon: TrendingDown,
    title: 'Missed Sales',
    description:
      'Every platform you skip is a buyer you never reach. But listing everywhere manually is unsustainable. So you settle for two or three and hope for the best.',
  },
];

export const ProblemSection = () => {
  return (
    <section className="py-20 md:py-28 px-4" aria-labelledby="problem-heading">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="problem-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cross-listing is eating your time alive
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            You find a great piece to resell. Then you spend the next 45 minutes uploading the same photos, writing the same description, and filling in the same details on platform after platform. That time adds up fast. Most UK resellers waste 5 to 10 hours a week just duplicating listings they have already created.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <point.icon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {point.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
