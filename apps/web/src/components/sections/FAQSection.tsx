'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How does SyncSellr work?',
    answer:
      'SyncSellr combines a web dashboard with a Chrome extension. You create your listing in the dashboard, then our extension automatically fills in forms and uploads images on each marketplace. For eBay and Etsy, we use direct API connections for even faster listing.',
  },
  {
    question: 'Which marketplaces are supported?',
    answer:
      'SyncSellr supports 7 UK marketplaces: eBay, Facebook Marketplace, Gumtree, Etsy, Vinted, Depop, and Poshmark. We are the first UK platform to include Gumtree.',
  },
  {
    question: 'Do I need API keys?',
    answer:
      'No. For most marketplaces, our Chrome extension handles everything through browser automation. eBay and Etsy use OAuth, which means you just click "Connect" and authorise access. No developer accounts or API keys required.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. Your login credentials are never stored on our servers. The Chrome extension works locally in your browser. We use industry-standard encryption for all data in transit and at rest.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'SyncSellr is free to start with up to 10 listings and 3 marketplaces. Our Pro plan at \u00A314.99/mo unlocks all 7 marketplaces and unlimited listings. Business plans start at \u00A329.99/mo for teams and advanced features.',
  },
  {
    question: 'What about Gumtree support?',
    answer:
      'SyncSellr is the first UK cross-listing tool to support Gumtree. Our Chrome extension automates the full listing process on Gumtree, including category selection, location, and image uploads. No other UK tool offers this.',
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 px-4" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.question}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4">
                  <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
