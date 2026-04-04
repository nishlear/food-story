import React, { useEffect, useState } from 'react';
import { Trash2, RefreshCw, Star } from 'lucide-react';
import { useLanguage } from '../i18n/context';

interface Props {
  authHeaders: () => Record<string, string>;
}

export default function AdminCommentsTab({ authHeaders }: Props) {
  const { t } = useLanguage();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = () => {
    setLoading(true);
    fetch('/api/admin/comments', { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setComments(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComments(); }, []);

  const handleDelete = async (comment: any) => {
    if (!confirm(t.deleteCommentConfirm)) return;
    await fetch(`/api/vendors/${comment.vendor_id}/comments/${comment.id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    fetchComments();
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
        <h2 className="text-xl font-bold text-gray-900">{t.allComments}</h2>
        <button onClick={fetchComments} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-center text-gray-400 py-8">{t.noCommentsYet}</p>
        )}
        {comments.map(comment => (
          <div key={comment.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800 text-sm">{comment.username}</span>
                  <div className="flex text-orange-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${comment.rating >= star ? 'fill-current' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-1">{comment.body}</p>
                <p className="text-xs text-gray-400">
                  {comment.vendor_name} · {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(comment)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
