import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UtensilsCrossed, X, AlertTriangle, Pencil, Trash2, Plus } from 'lucide-react';
import { FoodMenuItem } from '../types';
import { useLanguage } from '../i18n/context';

interface Props {
  vendorId: string;
  authHeaders: () => Record<string, string>;
  isOpen: boolean;
  onClose: () => void;
  canManage?: boolean;
}

export default function FoodMenuModal({ vendorId, authHeaders, isOpen, onClose, canManage = false }: Props) {
  const { t } = useLanguage();
  const [items, setItems] = useState<FoodMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodMenuItem | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', image: '' });

  const fetchMenu = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/vendors/${vendorId}/menu`, { headers: authHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError(t.menuLoadError);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) fetchMenu();
  }, [isOpen]);

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '', image: '' });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleSubmitAdd = async () => {
    if (!formData.name || !formData.price) return;
    await fetch(`/api/vendors/${vendorId}/menu`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description || null,
        image: formData.image || null,
      }),
    });
    resetForm();
    fetchMenu();
  };

  const handleSubmitEdit = async () => {
    if (!editingItem || !formData.name || !formData.price) return;
    await fetch(`/api/vendors/${vendorId}/menu/${editingItem.id}`, {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description || null,
        image: formData.image || null,
      }),
    });
    resetForm();
    fetchMenu();
  };

  const handleDelete = async (item: FoodMenuItem) => {
    if (!window.confirm(t.deleteMenuItemConfirm)) return;
    await fetch(`/api/vendors/${vendorId}/menu/${item.id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    fetchMenu();
  };

  const startEdit = (item: FoodMenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: String(item.price),
      description: item.description || '',
      image: item.image || '',
    });
    setShowAddForm(false);
  };

  const startAdd = () => {
    resetForm();
    setEditingItem(null);
    setShowAddForm(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-2xl z-50 flex flex-col"
            style={{ height: '80%' }}
            aria-hidden="true"
          >
            <div className="w-full pt-3 pb-2 flex justify-center">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{t.foodMenu}</h2>
              <div className="flex items-center gap-2">
                {canManage && (
                  <>
                    {!showAddForm && !editingItem && (
                      <button
                        onClick={startAdd}
                        className="p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors"
                        title={t.addFood}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => { setEditMode(!editMode); resetForm(); }}
                      className={`p-2 rounded-full transition-colors text-sm font-medium ${
                        editMode ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {editMode ? t.done : t.editMenu}
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto px-6 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {/* Add form */}
              {showAddForm && (
                <div className="mt-4 p-4 rounded-xl border border-orange-200 bg-orange-50 space-y-3">
                  <input
                    type="text"
                    placeholder={t.itemName}
                    value={formData.name}
                    onChange={e => setFormData(s => ({ ...s, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder={t.itemPrice}
                    value={formData.price}
                    onChange={e => setFormData(s => ({ ...s, price: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  />
                  <textarea
                    placeholder={t.itemDescription}
                    value={formData.description}
                    onChange={e => setFormData(s => ({ ...s, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
                    rows={2}
                  />
                  <input
                    type="text"
                    placeholder={t.itemImage}
                    value={formData.image}
                    onChange={e => setFormData(s => ({ ...s, image: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  />
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleSubmitAdd} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600">
                      {t.save}
                    </button>
                    <button onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300">
                      {t.cancel}
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="space-y-3 py-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100 animate-pulse">
                      <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 p-4 rounded-xl border border-gray-100 animate-pulse opacity-50">
                    <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                </div>
              )}

              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{error}</h3>
                  <button
                    onClick={fetchMenu}
                    className="mt-2 text-orange-500 font-semibold text-sm hover:underline"
                  >
                    {t.tryAgain}
                  </button>
                </div>
              )}

              {!loading && !error && items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <UtensilsCrossed className="w-20 h-20 text-gray-300 mb-4" />
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{t.noMenuItems}</h3>
                  <p className="text-sm text-gray-500">{t.noMenuItemsDesc}</p>
                </div>
              )}

              {!loading && !error && items.length > 0 && (
                <div className="space-y-3 py-4">
                  {items.map(item => (
                    <div key={item.id}>
                      {/* Edit form */}
                      {editingItem?.id === item.id ? (
                        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 space-y-3">
                          <input
                            type="text"
                            placeholder={t.itemName}
                            value={formData.name}
                            onChange={e => setFormData(s => ({ ...s, name: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                          />
                          <input
                            type="number"
                            step="0.01"
                            placeholder={t.itemPrice}
                            value={formData.price}
                            onChange={e => setFormData(s => ({ ...s, price: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                          />
                          <textarea
                            placeholder={t.itemDescription}
                            value={formData.description}
                            onChange={e => setFormData(s => ({ ...s, description: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
                            rows={2}
                          />
                          <input
                            type="text"
                            placeholder={t.itemImage}
                            value={formData.image}
                            onChange={e => setFormData(s => ({ ...s, image: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                          />
                          <div className="flex gap-2 pt-1">
                            <button onClick={handleSubmitEdit} className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600">
                              {t.save}
                            </button>
                            <button onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300">
                              {t.cancel}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Item card */
                        <div className="flex gap-4 p-4 rounded-xl border border-gray-100 shadow-sm bg-white relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <UtensilsCrossed className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h4>
                              <span className="text-orange-500 font-semibold text-sm flex-shrink-0">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                            )}
                          </div>
                          {editMode && canManage && (
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button
                                onClick={() => startEdit(item)}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                title={t.editMenu}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                                title={t.deleteMenuItem}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
