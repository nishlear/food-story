import React, { useEffect, useState } from 'react';
import { UtensilsCrossed, RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '../i18n/context';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
}

interface VendorMenuGroup {
  vendor_id: string;
  vendor_name: string;
  street_name: string;
  items: MenuItem[];
}

interface Props {
  authHeaders: () => Record<string, string>;
}

export default function AdminMenuTab({ authHeaders }: Props) {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<VendorMenuGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [addToVendor, setAddToVendor] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', image: '' });

  const fetchGroups = () => {
    setLoading(true);
    fetch('/api/admin/menu', { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setGroups(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '', image: '' });
    setAddToVendor(null);
    setEditItem(null);
  };

  const handleSubmitAdd = async (vendorId: string) => {
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
    fetchGroups();
  };

  const handleSubmitEdit = async (vendorId: string) => {
    if (!editItem || !formData.name || !formData.price) return;
    await fetch(`/api/vendors/${vendorId}/menu/${editItem.id}`, {
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
    fetchGroups();
  };

  const handleDelete = async (vendorId: string, item: MenuItem) => {
    if (!window.confirm(t.deleteMenuItemConfirm)) return;
    await fetch(`/api/vendors/${vendorId}/menu/${item.id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    fetchGroups();
  };

  const startEdit = (item: MenuItem) => {
    setEditItem(item);
    setAddToVendor(null);
    setFormData({
      name: item.name,
      price: String(item.price),
      description: item.description || '',
      image: item.image || '',
    });
  };

  const startAdd = (vendorId: string) => {
    resetForm();
    setAddToVendor(vendorId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t.menuTab}</h2>
        <button
          onClick={fetchGroups}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <UtensilsCrossed className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-sm">{t.noMenuItemsTab}</p>
        </div>
      )}

      <div className="space-y-4">
        {groups.map(group => (
          <div key={group.vendor_id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{group.vendor_name}</h3>
                <p className="text-xs text-gray-400">{group.street_name} · {group.items.length} items</p>
              </div>
              <button
                onClick={() => startAdd(group.vendor_id)}
                className="p-1.5 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors"
                title={t.addFood}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add form */}
            {addToVendor === group.vendor_id && (
              <div className="mb-3 p-3 rounded-xl border border-orange-200 bg-orange-50 space-y-2">
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
                  <button
                    onClick={() => handleSubmitAdd(group.vendor_id)}
                    className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600"
                  >
                    {t.save}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {group.items.map(item => (
                <div key={item.id}>
                  {/* Edit form */}
                  {editItem?.id === item.id ? (
                    <div className="p-3 rounded-xl border border-blue-200 bg-blue-50 space-y-2">
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
                        <button
                          onClick={() => handleSubmitEdit(group.vendor_id)}
                          className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600"
                        >
                          {t.save}
                        </button>
                        <button
                          onClick={resetForm}
                          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Item row */
                    <div className="flex items-center justify-between gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 group">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <UtensilsCrossed className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-gray-400 truncate">{item.description}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-orange-500 flex-shrink-0">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title={t.editMenu}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(group.vendor_id, item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title={t.deleteMenuItem}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
