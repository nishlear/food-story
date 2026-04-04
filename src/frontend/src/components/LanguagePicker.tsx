import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage, LANGUAGES } from '../i18n/context';

export default function LanguagePicker() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Language"
        onClick={() => setOpen(o => !o)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          open ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Globe className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute right-0 top-14 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 w-52"
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                  language === lang.code
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{lang.nativeName}</span>
                {language === lang.code && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
