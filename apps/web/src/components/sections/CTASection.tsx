'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden" aria-label="Get started with Tom Flips">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800" />

      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to stop copy-pasting listings?
          </h2>
          <p className="text-xl text-primary-200 mb-10 max-w-2xl mx-auto">
            Join hundreds of UK furniture resellers already saving hours every
            week. List once, sell on eBay, Facebook Marketplace, and Gumtree.
          </p>
          <Link href="/register">
            <motion.button
              className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-primary-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-xl transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
