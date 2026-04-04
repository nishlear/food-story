import React, { useState } from 'react';
import { CurrentUser } from '../types';
import { useLanguage } from '../i18n/context';

interface Props {
  onLogin: (user: CurrentUser) => void;
  onBack: () => void;
}

export default function RegisterForm({ onLogin, onBack }: Props) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(t.passwordMismatch);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.detail || 'Registration failed');
        return;
      }
      onLogin({ username: data.username, role: data.role, token: data.token });
    } catch {
      setError(t.connectionError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.username}</label>
        <input
          required
          autoComplete="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          placeholder={t.chooseUsernamePlaceholder}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
        <input
          required
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          placeholder="••••••"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPassword}</label>
        <input
          required
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
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
        {loading ? t.creatingAccount : t.createAccount}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors py-1"
      >
        {t.alreadyHaveAccount}
      </button>
    </form>
  );
}
