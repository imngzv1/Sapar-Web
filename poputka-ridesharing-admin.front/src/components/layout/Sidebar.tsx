import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Car,
  DollarSign,
  BarChart3,
  MapPin,
  ClipboardList,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';

export default function Sidebar() {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const setSidebarOpen = useStore((state) => state.setSidebarOpen);
  const admin = useAuthStore((s) => s.admin);

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

  const menuItems = [
    { id: 'dashboard', name: 'Панель управления', icon: LayoutDashboard },
    { id: 'verifications', name: 'Верификация водителей', icon: FileCheck, badge: pendingVerificationsCount },
    { id: 'users', name: 'Пользователи', icon: Users },
    { id: 'drivers', name: 'Водители', icon: Car },
    { id: 'rides', name: 'Поездки', icon: ClipboardList },
    { id: 'moderation', name: 'Жалобы', icon: ShieldAlert },
    { id: 'finances', name: 'Финансы', icon: DollarSign },
    { id: 'analytics', name: 'Аналитика', icon: BarChart3 },
    { id: 'content', name: 'Города', icon: MapPin },
    { id: 'logs', name: 'Журнал действий', icon: Clock },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const adminInitial = (admin?.login ?? 'А').slice(0, 2).toUpperCase();

  return (
    <div id="sidebar-container" className="w-72 bg-[#476673] flex flex-col h-full shrink-0 select-none">
      <div id="sidebar-admin-profile" className="px-3 py-3 mx-3 mt-3 mb-2 bg-white/5 flex items-center gap-3 border border-white/10">
        <div className="w-9 h-9 rounded-sm bg-[#8BA6B1] flex items-center justify-center text-white font-semibold text-sm">
          {adminInitial}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-white truncate">{admin?.login ?? 'Админ'}</p>
          <p className="text-xs text-white/60 truncate">Модератор</p>
        </div>
        <span className="ml-auto flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      <nav id="sidebar-nav" className="flex-1 px-2 mt-2 space-y-0.5 overflow-y-auto w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#8BA6B1] text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/60'}`} />
              <span className="truncate">{item.name}</span>
              {item.badge !== undefined && item.badge > 0 ? (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-[#BFCFC2] text-[#476673]">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

    </div>
  );
}
