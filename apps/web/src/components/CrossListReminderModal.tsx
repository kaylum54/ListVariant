'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ExternalLink } from 'lucide-react';

interface CrossListReminderModalProps {
  isOpen: boolean;
  platform: { id: string; name: string; loginUrl: string } | null;
  onClose: () => void;
  onContinue: (dontShowAgain: boolean) => void;
}

export function CrossListReminderModal({
  isOpen,
  platform,
  onClose,
  onContinue,
}: CrossListReminderModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen || !platform) return null;

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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Quick Reminder</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Make sure you&apos;re logged into{' '}
                  <span className="font-medium text-gray-700">{platform.name}</span>{' '}
                  in this browser before continuing.
                </p>
              </div>
            </div>

            <a
              href={platform.loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-5"
            >
              Open {platform.name}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => setDontShowAgain(!dontShowAgain)}
                className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors ${
                  dontShowAgain
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {dontShowAgain && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-gray-600">
                Don&apos;t show this again for {platform.name}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2.5 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onContinue(dontShowAgain)}
                className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg px-4 py-2.5 font-medium text-sm transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
