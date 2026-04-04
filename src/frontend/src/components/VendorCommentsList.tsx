import React from 'react';
import { Star, Trash2 } from 'lucide-react';
import { Comment, CurrentUser } from '../types';
import { useLanguage } from '../i18n/context';

interface Props {
  comments: Comment[];
  currentUser: CurrentUser | null;
  vendorId: string;
  authHeaders: () => Record<string, string>;
  onDeleted: () => void;
}

export default function VendorCommentsList({ comments, currentUser, vendorId, authHeaders, onDeleted }: Props) {
  const { t } = useLanguage();
  const handleDelete = async (commentId: string) => {
    try {
      await fetch(`/api/vendors/${vendorId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      onDeleted();
    } catch {
      // silently fail
    }
  };

  if (comments.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-4">{t.noReviewsYet}</p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <div key={comment.id} className="bg-gray-50 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{comment.username}</span>
              <div className="flex text-orange-400">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${comment.rating >= star ? 'fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{comment.body}</p>
        </div>
      ))}
    </div>
  );
}
