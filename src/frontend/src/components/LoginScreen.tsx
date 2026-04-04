import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CurrentUser } from '../types';
import RegisterForm from './RegisterForm';
import { useLanguage } from '../i18n/context';

interface Props {
  onLogin: (user: CurrentUser) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError(t.invalidCredentials);
        return;
      }
      const data = await res.json();
      onLogin({ username: data.username, role: data.role, token: data.token });
    } catch {
      setError(t.connectionError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm mx-6 bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <span className="text-3xl">🍜</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Food Story</h1>
          <p className="text-gray-500 text-sm mt-1">
            {showRegister ? t.createAccountSubtitle : t.signInSubtitle}
          </p>
        </div>

        {showRegister ? (
          <RegisterForm onLogin={onLogin} onBack={() => setShowRegister(false)} />
        ) : (
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.username}</label>
              <input
                required
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder={t.usernamePlaceholder}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold mt-2 shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {loading ? t.signingIn : t.signIn}
            </button>

            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors py-1"
            >
              {t.noAccount}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
