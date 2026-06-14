import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Activity,
  Calendar,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { AdminLog } from '../../types';
import { fetchAdminLogs } from '../../lib/adminLogs';
import { useStore } from '../../store/useStore';

type CategoryFilter = 'All' | 'verification' | 'user_state' | 'complaint' | 'city';

const CATEGORY_LABELS: Record<Exclude<CategoryFilter, 'All'>, string> = {
  verification: 'Верификации',
  user_state: 'Блокировки',
  complaint: 'Жалобы',
  city: 'Города',
};

export default function LogsTab() {
  const activeTab = useStore((s) => s.activeTab);
  const localLogs = useStore((s) => s.logs);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  const mergeWithLocal = useCallback((serverLogs: AdminLog[]) => {
    const serverIds = new Set(serverLogs.map((l) => l.id));
    const pending = localLogs.filter((l) => !serverIds.has(l.id));
    return [...serverLogs, ...pending].sort((a, b) => b.date.localeCompare(a.date));
  }, [localLogs]);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingLocalFallback(false);
      const data = await fetchAdminLogs();
      setLogs(mergeWithLocal(data));
    } catch (e: any) {
      setUsingLocalFallback(true);
      setLogs(localLogs);
      setError(
        e?.message ??
          'Не удалось загрузить журнал с сервера — показаны локальные записи из браузера.',
      );
    } finally {
      setLoading(false);
    }
  }, [localLogs, mergeWithLocal]);

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab, loadLogs]);

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => b.date.localeCompare(a.date)),
    [logs],
  );

  const filteredLogs = useMemo(() => {
    return sortedLogs.filter((log) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        log.adminName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q);
      const matchCategory = categoryFilter === 'All' ? true : log.targetType === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [sortedLogs, search, categoryFilter]);

  return (
    <div id="logs-tab-view" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#476673]">Журнал действий</h2>
          <p className="text-sm text-[#8BA6B1]">
            Действия администраторов. Хранятся в папке logs/ на сервере (30 дней).
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#476673] border border-[#D6DCDC] rounded-sm bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {error && (
        <div
          className={`border text-sm p-4 rounded-sm ${
            usingLocalFallback
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {error}
          <p className="text-xs mt-2 opacity-80">
            Запустите бэкенд: <span className="font-mono">cd back; npm run dev</span>
            {usingLocalFallback && ' — после запуска нажмите «Обновить».'}
          </p>
        </div>
      )}

      <div className="bg-white p-4 rounded-sm border border-[#D6DCDC] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8BA6B1]" />
          <input
            type="text"
            placeholder="Поиск по админу или описанию"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] rounded-sm border border-[#D6DCDC] text-sm text-[#476673] focus:outline-none"
          />
        </div>

        <div className="flex bg-[#F3F4F6] p-1 rounded-sm border border-[#D6DCDC] text-xs flex-wrap">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1.5 font-bold rounded-md transition-all ${
              categoryFilter === 'All' ? 'bg-white text-[#476673] shadow-xs' : 'text-[#8BA6B1]'
            }`}
          >
            Все
          </button>
          {(Object.entries(CATEGORY_LABELS) as [Exclude<CategoryFilter, 'All'>, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`px-3 py-1.5 font-bold rounded-md transition-all ${
                  categoryFilter === key ? 'bg-white text-[#476673] shadow-xs' : 'text-[#8BA6B1]'
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="bg-white rounded-sm border border-[#D6DCDC] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-[#8BA6B1] text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Загружаем журнал...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8BA6B1]">
            По выбранным фильтрам записей нет.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-sans"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 text-[#476673] rounded-sm border border-[#D6DCDC] shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#476673]">{log.adminName}</span>
                    <span className="text-gray-400">•</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                        log.targetType === 'verification'
                          ? 'bg-indigo-50 text-indigo-800'
                          : log.targetType === 'user_state'
                            ? 'bg-rose-50 text-rose-800'
                            : log.targetType === 'complaint'
                              ? 'bg-amber-50 text-amber-800'
                              : log.targetType === 'city'
                                ? 'bg-purple-50 text-purple-800'
                                : 'bg-gray-50 text-gray-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-sm border border-slate-100/50">
                    {log.details}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 flex items-center gap-1.5 text-gray-400 font-mono text-[10px] md:self-center">
                <Calendar className="w-3.5 h-3.5" />
                <span>{log.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
