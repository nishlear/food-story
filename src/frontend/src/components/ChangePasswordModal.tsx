import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock } from 'lucide-react';
import { useLanguage } from '../i18n/context';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  authHeaders: () => Record<string, string>;
}

export default function ChangePasswordModal({ isOpen, onClose, authHeaders }: Props) {
  const { t } = useLanguage();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError(t.newPasswordsMismatch);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.detail || 'Failed to change password');
        return;
      }
      setSuccess(true);
      setTimeout(handleClose, 1500);
    } catch {
      setError(t.connectionError);
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
            className="absolute top-1/2 left-4 right-4 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t.changePassword}</h3>
              </div>
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {success ? (
                <div className="text-center py-4">
                  <p className="text-green-600 font-semibold">{t.passwordChangedSuccess}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.currentPassword}</label>
                    <input
                      required
                      type="password"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      placeholder="••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.newPassword}</label>
                    <input
                      required
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      placeholder="••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmNewPassword}</label>
                    <input
                      required
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      placeholder="••••••"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors disabled:opacity-60"
                  >
                    {loading ? t.saving : t.savePassword}
                  </button>
                </>
              )}
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
