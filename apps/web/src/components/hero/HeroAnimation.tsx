'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { EbayLogo, FacebookLogo, GumtreeLogo } from '../icons/PlatformLogos';

const ListingCard = ({ isAnimating }: { isAnimating: boolean }) => (
  <motion.div
    className="relative w-56 md:w-64 bg-white rounded-2xl shadow-2xl overflow-hidden"
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{
      opacity: 1,
      y: 0,
      scale: 1,
      boxShadow: isAnimating
        ? '0 25px 50px -12px rgba(97, 114, 243, 0.4)'
        : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent z-10"
      animate={{ opacity: isAnimating ? 1 : 0.5 }}
    />

    <div className="h-32 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
      <motion.div
        animate={{ scale: isAnimating ? [1, 1.02, 1] : 1 }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg className="w-14 h-14 text-neutral-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" role="img">
          <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v2H4V5zm0 4h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" />
        </svg>
      </motion.div>
    </div>

    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
          Furniture
        </span>
        <span className="text-xs text-neutral-400">Just now</span>
      </div>
      <h3 className="font-semibold text-neutral-900 mb-1 text-sm">Grey Corner Sofa</h3>
      <p className="text-xs text-neutral-500 mb-3">DFS, excellent condition</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-neutral-900">{'\u00A3'}299</span>
        <motion.div
          className="flex -space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 1 : 0.5 }}
        >
          <div className="w-4 h-4 rounded-full bg-[#E53238] border-2 border-white" />
          <div className="w-4 h-4 rounded-full bg-[#1877F2] border-2 border-white" />
          <div className="w-4 h-4 rounded-full bg-[#72EF36] border-2 border-white" />
        </motion.div>
      </div>
    </div>
  </motion.div>
);

const PlatformDestination = ({
  platform,
  Icon,
  delay,
  connected,
}: {
  platform: string;
  Icon: React.ComponentType<{ className?: string }>;
  delay: number;
  connected: boolean;
}) => {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.8, duration: 0.4 }}
    >
      <motion.div
        className="relative"
        animate={{
          scale: connected ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="w-12 h-12" />
        <motion.div
          className="absolute -right-1 -bottom-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: connected ? 1 : 0, opacity: connected ? 1 : 0 }}
          transition={{ delay: 0.2 }}
        >
          <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
      </motion.div>
      <span className="text-sm font-medium text-neutral-700">{platform}</span>
    </motion.div>
  );
};

export const HeroAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [connected, setConnected] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    if (isInView) {
      const animTimer = setTimeout(() => setIsAnimating(true), 800);
      const connTimer = setTimeout(() => setConnected(true), 2200);
      return () => {
        clearTimeout(animTimer);
        clearTimeout(connTimer);
      };
    }
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xl mx-auto h-[420px] flex items-center justify-center"
      role="img"
      aria-label="Animation showing a furniture listing being cross-posted to eBay, Facebook Marketplace, and Gumtree simultaneously"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-200/30 blur-3xl"
          animate={{
            scale: isAnimating ? [1, 1.2, 1] : 1,
            opacity: isAnimating ? [0.3, 0.5, 0.3] : 0.3,
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {/* Layout: card on left, platforms on right */}
      <div className="relative z-10 flex items-center gap-8 md:gap-12">
        {/* Central listing card */}
        <ListingCard isAnimating={isAnimating} />

        {/* Connection lines + platforms */}
        <div className="flex flex-col gap-6">
          {/* Animated connection dots */}
          {isAnimating && (
            <motion.div
              className="absolute left-[240px] md:left-[272px] top-1/2 -translate-y-1/2 flex flex-col gap-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.2 }}
                >
                  {[0, 1, 2, 3, 4].map((dot) => (
                    <motion.div
                      key={dot}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i === 0
                          ? 'bg-[#E53238]'
                          : i === 1
                          ? 'bg-[#1877F2]'
                          : 'bg-[#72EF36]'
                      }`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0.5], scale: 1 }}
                      transition={{
                        delay: 0.5 + i * 0.2 + dot * 0.1,
                        duration: 0.4,
                      }}
                    />
                  ))}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Platform icons */}
          <div className="flex flex-col gap-6 ml-16 md:ml-20">
            <PlatformDestination
              platform="eBay"
              Icon={EbayLogo}
              delay={0.5}
              connected={connected}
            />
            <PlatformDestination
              platform="Facebook"
              Icon={FacebookLogo}
              delay={0.7}
              connected={connected}
            />
            <PlatformDestination
              platform="Gumtree"
              Icon={GumtreeLogo}
              delay={0.9}
              connected={connected}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
