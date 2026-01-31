'use client';

import { motion } from 'framer-motion';
import { Camera, MousePointerClick, Rocket } from 'lucide-react';

const steps = [
  {
    step: '1',
    title: 'Create Your Listing',
    description:
      'Add photos, details, and pricing for your furniture item in one place.',
    icon: Camera,
    color: 'bg-primary-100 text-primary-600',
  },
  {
    step: '2',
    title: 'Choose Platforms',
    description:
      'Select which marketplaces to publish to \u2014 eBay, Facebook, Gumtree, or all three.',
    icon: MousePointerClick,
    color: 'bg-secondary-100 text-secondary-600',
  },
  {
    step: '3',
    title: 'Publish & Manage',
    description:
      'One click publishes everywhere. Track status and manage from your dashboard.',
    icon: Rocket,
    color: 'bg-accent-100 text-accent-600',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-4" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            How It Works
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto text-lg">
            Start cross-listing your furniture in under 2 minutes
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-accent-200" />

          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              {/* Step icon */}
              <div className="relative inline-flex mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${item.color} relative z-10`}
                >
                  <item.icon className="w-7 h-7" />
                </div>
                {/* Step number badge */}
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-neutral-200 rounded-full flex items-center justify-center text-xs font-bold text-neutral-700 z-20">
                  {item.step}
                </div>
              </div>

              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {item.title}
              </h3>
              <p className="text-neutral-600 max-w-xs mx-auto">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
