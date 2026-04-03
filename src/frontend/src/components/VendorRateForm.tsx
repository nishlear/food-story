import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  vendorId: string;
  authHeaders: () => Record<string, string>;
  onSubmitted: () => void;
}

export default function VendorRateForm({ vendorId, authHeaders, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/vendors/${vendorId}/comments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ rating, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.detail || 'Failed to submit');
        return;
      }
      setRating(0);
      setBody('');
      onSubmitted();
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const display = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className="bg-orange-50 p-4 rounded-2xl space-y-3">
      <p className="font-semibold text-gray-800 text-sm">Leave a Review</p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="transition-transform active:scale-90"
          >
            <Star
              className={`w-7 h-7 transition-colors ${display >= star ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>

      <textarea
        required
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={3}
        placeholder="Share your experience…"
        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none bg-white"
      />

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
