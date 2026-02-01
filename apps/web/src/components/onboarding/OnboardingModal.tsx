'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Puzzle,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Globe,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const BROWSER_PLATFORMS = [
  { id: 'facebook', name: 'Facebook Marketplace', loginUrl: 'https://www.facebook.com/marketplace', color: 'bg-blue-700' },
  { id: 'gumtree', name: 'Gumtree', loginUrl: 'https://www.gumtree.com/login', color: 'bg-green-600' },
  { id: 'vinted', name: 'Vinted', loginUrl: 'https://www.vinted.co.uk/member/login', color: 'bg-teal-500' },
  { id: 'depop', name: 'Depop', loginUrl: 'https://www.depop.com/login', color: 'bg-red-500' },
  { id: 'poshmark', name: 'Poshmark', loginUrl: 'https://poshmark.co.uk/login', color: 'bg-pink-500' },
];

const stepVariants = {
  enter: { x: 50, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -50, opacity: 0 },
};

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [checkedPlatforms, setCheckedPlatforms] = useState<Record<string, boolean>>({});
  const [connectingEbay, setConnectingEbay] = useState(false);
  const [connectingEtsy, setConnectingEtsy] = useState(false);

  // Check for extension marker
  useEffect(() => {
    if (!isOpen) return;
    const check = () => {
      const marker = document.getElementById('tom-flips-extension-marker');
      setExtensionDetected(!!marker);
    };
    check();
    const interval = setInterval(check, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleTogglePlatform = useCallback((platformId: string) => {
    setCheckedPlatforms((prev) => ({ ...prev, [platformId]: !prev[platformId] }));
  }, []);

  const handleConnectEbay = useCallback(async () => {
    setConnectingEbay(true);
    try {
      const { data } = await api.get('/connections/ebay/auth-url');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch {
      // Silently fail
    } finally {
      setConnectingEbay(false);
    }
  }, []);

  const handleConnectEtsy = useCallback(async () => {
    setConnectingEtsy(true);
    try {
      const { data } = await api.get('/connections/etsy/auth-url');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch {
      // Silently fail
    } finally {
      setConnectingEtsy(false);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full mx-4 relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-8 bg-blue-600'
                      : i < step
                        ? 'w-2 bg-blue-400'
                        : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step-0"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <StepExtension
                    extensionDetected={extensionDetected}
                    onNext={() => setStep(1)}
                  />
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step-1"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <StepMarketplaces
                    checkedPlatforms={checkedPlatforms}
                    onToggle={handleTogglePlatform}
                    onNext={() => setStep(2)}
                    onBack={() => setStep(0)}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <StepApiMarketplaces
                    connectingEbay={connectingEbay}
                    connectingEtsy={connectingEtsy}
                    onConnectEbay={handleConnectEbay}
                    onConnectEtsy={handleConnectEtsy}
                    onComplete={onComplete}
                    onBack={() => setStep(1)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Step 1: Install Extension ─── */
function StepExtension({
  extensionDetected,
  onNext,
}: {
  extensionDetected: boolean;
  onNext: () => void;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Puzzle className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Install the Browser Extension
      </h2>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        The Tom Flips browser extension handles cross-listing to Facebook Marketplace,
        Gumtree, Vinted, Depop, and Poshmark. It works alongside this dashboard to
        automate your listings.
      </p>

      {/* Status card */}
      {extensionDetected ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium text-green-800">Extension Installed</p>
            <p className="text-xs text-green-600">The Tom Flips extension is detected and ready.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium text-amber-800">Extension Not Detected</p>
            <p className="text-xs text-amber-600">
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-700"
              >
                Install from the Chrome Web Store
              </a>
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-6 py-2.5 font-medium transition-colors inline-flex items-center justify-center gap-2"
      >
        Next
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Step 2: Log Into Marketplaces ─── */
function StepMarketplaces({
  checkedPlatforms,
  onToggle,
  onNext,
  onBack,
}: {
  checkedPlatforms: Record<string, boolean>;
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Globe className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Log Into Your Marketplaces
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Make sure you&apos;re logged into the platforms you want to sell on.
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {BROWSER_PLATFORMS.map((platform) => (
          <div
            key={platform.id}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggle(platform.id)}
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                  checkedPlatforms[platform.id]
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {checkedPlatforms[platform.id] && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                {platform.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-900">{platform.name}</span>
            </div>
            <a
              href={platform.loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Open
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-6 py-2.5 font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-6 py-2.5 font-medium transition-colors inline-flex items-center justify-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3: Connect API Marketplaces ─── */
function StepApiMarketplaces({
  connectingEbay,
  connectingEtsy,
  onConnectEbay,
  onConnectEtsy,
  onComplete,
  onBack,
}: {
  connectingEbay: boolean;
  connectingEtsy: boolean;
  onConnectEbay: () => void;
  onConnectEtsy: () => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Zap className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Connect API Marketplaces (Optional)
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          eBay and Etsy use official APIs for faster, more reliable listings.
        </p>
      </div>

      <div className="space-y-3 mb-4">
        {/* eBay card */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">eBay</p>
              <p className="text-xs text-gray-500">Official eBay API integration</p>
            </div>
          </div>
          <button
            onClick={onConnectEbay}
            disabled={connectingEbay}
            className="text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {connectingEbay ? 'Connecting...' : 'Connect eBay'}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Etsy card */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Etsy</p>
              <p className="text-xs text-gray-500">Official Etsy API integration</p>
            </div>
          </div>
          <button
            onClick={onConnectEtsy}
            disabled={connectingEtsy}
            className="text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {connectingEtsy ? 'Connecting...' : 'Connect Etsy'}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mb-6">
        You can skip this and connect later from Settings.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-6 py-2.5 font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-6 py-2.5 font-medium transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
