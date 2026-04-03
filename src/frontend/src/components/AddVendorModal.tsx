import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (vendor: any) => void;
  coordinates: { x: number; y: number; lat?: number; lon?: number } | null;
  mode: 'add' | 'request';
}

export default function AddVendorModal({ isOpen, onClose, onAdd, coordinates, mode }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('5.0');

  const title = mode === 'add' ? 'Add Vendor' : 'Request Vendor';
  const submitLabel = mode === 'add' ? 'Add Vendor' : 'Submit Request';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAdd({
      id: Date.now().toString(),
      name,
      description,
      rating: parseFloat(rating),
      reviews: 0,
      x: coordinates?.x || 50,
      y: coordinates?.y || 50,
      ...(coordinates?.lat != null ? { lat: coordinates.lat, lon: coordinates.lon } : {}),
      type: 'food',
      address: 'New Location',
      images: []
    });
    setName(''); setDescription(''); setRating('5.0');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="absolute top-1/2 left-4 right-4 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label><input required value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3" placeholder="e.g. Pad Thai Master" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3" placeholder="Brief description..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Initial Rating</label><input type="number" step="0.1" min="1" max="5" required value={rating} onChange={e => setRating(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3" /></div>
              <button type="submit" className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold mt-4">{submitLabel}</button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
