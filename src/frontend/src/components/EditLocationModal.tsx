import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
  location: any;
}

export default function EditLocationModal({ isOpen, onClose, onUpdate, location }: Props) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (location) {
      setName(location.name || '');
      setCity(location.city || '');
      setDescription(location.description || '');
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city) return;
    onUpdate(location.id, { name, city, description });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="absolute top-1/2 left-4 right-4 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Edit Food Street</h3>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Street Name</label><input required value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3" placeholder="e.g. Khao San Road" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input required value={city} onChange={e => setCity(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3" placeholder="e.g. Bangkok" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3" placeholder="Brief description..." /></div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-md shadow-blue-600/20">Update</button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
