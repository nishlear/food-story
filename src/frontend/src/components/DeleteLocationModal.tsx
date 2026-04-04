import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage, interpolate } from '../i18n/context';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  location: any;
}

export default function DeleteLocationModal({ isOpen, onClose, onConfirm, location }: Props) {
  const { t } = useLanguage();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="absolute top-1/2 left-4 right-4 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.deleteFoodStreet}</h3>
              <p className="text-gray-600 mb-6">
                {interpolate(t.deleteLocationConfirm, { name: location?.name ?? '' })}
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold">{t.cancel}</button>
                <button onClick={() => onConfirm(location?.id)} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold shadow-md shadow-red-600/20">{t.delete}</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
