'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote:
      'I was spending two hours every evening re-listing furniture across platforms. SyncSellr cut that down to 15 minutes. I actually have my evenings back now.',
    name: 'Sarah Whitfield',
    role: 'Furniture Reseller, Manchester',
  },
  {
    quote:
      'The Gumtree support sold me. No other tool does it. I list to all 7 platforms from one screen and my sales have gone up 40% in three months.',
    name: 'James Okonkwo',
    role: 'Vintage Seller, Birmingham',
  },
  {
    quote:
      'I run a small side hustle flipping homeware. SyncSellr makes me look like a full-time operation. Listing everywhere used to feel impossible — now it takes seconds.',
    name: 'Lucy Brennan',
    role: 'Side Hustle Seller, Bristol',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 px-4 bg-gray-50" aria-labelledby="testimonials-heading">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by UK resellers
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-gray-600 italic leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
