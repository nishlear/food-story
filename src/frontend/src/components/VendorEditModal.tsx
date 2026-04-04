import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Store, MapPin } from 'lucide-react';
import { CurrentUser } from '../types';
import { useLanguage } from '../i18n/context';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vendor: any;
  streetId: string;
  authHeaders: () => Record<string, string>;
  onUpdated: () => void;
  hasMap?: boolean;
  currentUser?: CurrentUser | null;
  onSetPinLocation?: () => void;
}

export default function VendorEditModal({ isOpen, onClose, vendor, streetId, authHeaders, onUpdated, hasMap, currentUser, onSetPinLocation }: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vendor) {
      setName(vendor.name || '');
      setDescription(vendor.description || '');
      setImages((vendor.images || []).join('\n'));
    }
  }, [vendor]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const imageList = images.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await fetch(`/api/streets/${streetId}/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name, description, images: imageList }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.detail || 'Failed to update vendor');
        return;
      }
      onUpdated();
      handleClose();
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute top-1/2 left-4 right-4 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t.editVendor}</h3>
              </div>
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.imageUrlsLabel}</label>
                <textarea
                  value={images}
                  onChange={e => setImages(e.target.value)}
                  rows={3}
                  placeholder={t.imageUrlsPlaceholder}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none text-sm font-mono"
                />
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors disabled:opacity-60"
              >
                {loading ? t.saving : t.saveChanges}
              </button>

              {currentUser?.role === 'admin' && hasMap && onSetPinLocation && (
                <button
                  type="button"
                  onClick={() => { onSetPinLocation(); handleClose(); }}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  {t.setLocationOnMap}
                </button>
              )}
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
