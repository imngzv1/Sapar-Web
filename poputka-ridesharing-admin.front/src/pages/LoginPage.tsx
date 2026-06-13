import React, { useState } from 'react';
import { ShieldCheck, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const doLogin = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) return;
    await doLogin(login.trim(), password);
  };

  return (
    <div className="min-h-screen w-screen bg-[#F3F4F6] flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-sm bg-white border border-[#D6DCDC] rounded-md shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#BFCFC2] flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 text-[#476673]" />
          </div>
          <h1 className="text-lg font-semibold text-[#476673]">Вход в админ-панель</h1>
          <p className="text-xs text-[#8BA6B1] mt-1">Poputka Ridesharing</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#476673] mb-1">Логин</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              className="w-full px-3 py-2 text-sm border border-[#D6DCDC] rounded-sm focus:outline-none focus:border-[#476673] bg-white text-[#476673]"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#476673] mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-3 py-2 text-sm border border-[#D6DCDC] rounded-sm focus:outline-none focus:border-[#476673] bg-white text-[#476673]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-sm px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 bg-[#476673] hover:bg-[#3a545f] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-sm transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
