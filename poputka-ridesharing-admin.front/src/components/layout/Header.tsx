import React, { useEffect, useState } from 'react';
import { Menu, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';

export default function Header() {
  const setSidebarOpen = useStore((state) => state.setSidebarOpen);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const admin = useAuthStore((s) => s.admin);
  const logout = useAuthStore((s) => s.logout);

  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { count } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false);
      if (!cancelled) setPendingVerificationsCount(count ?? 0);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <header id="admin-toolbar-header" className="h-14 bg-white border-b border-[#D6DCDC] px-5 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3">
        <button
          id="sidebar-toggle-button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-1.5 rounded-sm hover:bg-gray-100 text-[#476673] transition-colors cursor-pointer"
          title="Скрыть/показать меню"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-[#BFCFC2] text-[#476673]">KG</span>
        <span className="text-xs text-[#8BA6B1]">{new Date().toLocaleDateString('ru-RU')}</span>
      </div>

      <div className="flex items-center gap-4">
        {pendingVerificationsCount > 0 && (
          <button
            onClick={() => setActiveTab('verifications')}
            className="hidden sm:flex items-center gap-1.5 bg-rose-50 rounded-sm border border-rose-200 text-rose-700 px-3 py-1 text-xs font-semibold cursor-pointer hover:bg-rose-100 transition-colors"
          >
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Заявок на проверку: {pendingVerificationsCount}</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-semibold text-[#476673]">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{admin?.login ?? 'Ислам'}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#476673] hover:bg-gray-100 px-2 py-1 rounded-sm transition-colors cursor-pointer"
          title="Выйти"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Выйти</span>
        </button>
      </div>
    </header>
  );
}
