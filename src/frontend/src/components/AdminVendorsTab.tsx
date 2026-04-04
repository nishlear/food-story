import React, { useEffect, useState } from 'react';
import { Trash2, RefreshCw, Star } from 'lucide-react';
import { useLanguage, interpolate } from '../i18n/context';

interface Props {
  authHeaders: () => Record<string, string>;
}

export default function AdminVendorsTab({ authHeaders }: Props) {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerInputs, setOwnerInputs] = useState<Record<string, string>>({});

  const fetchVendors = () => {
    setLoading(true);
    fetch('/api/admin/vendors', { headers: authHeaders() })
      .then(res => res.json())
      .then(data => {
        setVendors(data);
        const inputs: Record<string, string> = {};
        data.forEach((v: any) => { inputs[v.id] = v.owner_username || ''; });
        setOwnerInputs(inputs);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleDelete = async (vendor: any) => {
    if (!confirm(interpolate(t.deleteVendorConfirm, { name: vendor.name }))) return;
    await fetch(`/api/streets/${vendor.street_id}/vendors/${vendor.id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    fetchVendors();
  };

  const handleAssignOwner = async (vendor: any) => {
    const owner_username = ownerInputs[vendor.id] || null;
    await fetch(`/api/streets/${vendor.street_id}/vendors/${vendor.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        name: vendor.name,
        description: vendor.description,
        images: vendor.images,
        owner_username,
        rating: vendor.rating,
        reviews: vendor.reviews,
        x: vendor.x,
        y: vendor.y,
        type: vendor.type,
        address: vendor.address,
      }),
    });
    fetchVendors();
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
        <h2 className="text-xl font-bold text-gray-900">{t.allVendors}</h2>
        <button onClick={fetchVendors} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {vendors.map(vendor => (
          <div key={vendor.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{vendor.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{vendor.street_name} · {vendor.type}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                  <span className="text-xs text-gray-500">{vendor.rating || 0} ({vendor.reviews || 0})</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(vendor)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={ownerInputs[vendor.id] ?? ''}
                onChange={e => setOwnerInputs(prev => ({ ...prev, [vendor.id]: e.target.value }))}
                placeholder={t.assignOwnerPlaceholder}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <button
                onClick={() => handleAssignOwner(vendor)}
                className="bg-orange-500 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                {t.save}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
