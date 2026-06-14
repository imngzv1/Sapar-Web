import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Percent,
  Loader2,
  Wallet,
} from 'lucide-react';
import {
  fetchFinances,
  FinanceStats,
  FinanceTransaction,
  FinanceRefund,
} from '../../lib/finances';

export default function FinancesTab() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [refunds, setRefunds] = useState<FinanceRefund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'tx' | 'ref'>('tx');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchFinances();
        if (!cancelled) {
          setStats(data.stats);
          setTransactions(data.transactions);
          setRefunds(data.refunds);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Не удалось загрузить финансы');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const grossVolume = stats?.grossVolume ?? 0;
  const serviceCommission = stats?.serviceCommission ?? 0;
  const driverPayoutsTotal = stats?.driverPayoutsTotal ?? 0;

  return (
    <div id="finances-tab-view" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#476673]">Финансы</h2>
        <p className="text-sm text-[#8BA6B1]">Транзакции и возвраты пассажирам</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-[#8BA6B1]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Загружаем финансовые данные...</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white px-4 py-3 rounded-sm border border-[#D6DCDC] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#8BA6B1] uppercase truncate">
                  Оборот броней
                </p>
                <p className="text-xl font-bold text-[#476673] mt-0.5">
                  {grossVolume.toLocaleString('ru')} сом
                </p>
                <span className="text-[10px] text-[#8BA6B1] mt-1 block">
                  Сумма всех оплат по бронированиям
                </span>
              </div>
              <div className="p-2 rounded-sm bg-[#F3F4F6] text-[#476673] shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white px-4 py-3 rounded-sm border border-teal-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#8BA6B1] uppercase truncate">
                  Комиссия сервиса
                </p>
                <p className="text-xl font-bold text-[#476673] mt-0.5">
                  {serviceCommission.toLocaleString('ru')} сом
                </p>
                <span className="text-[10px] text-teal-700 mt-1 block">
                  Удержано платформой
                </span>
              </div>
              <div className="p-2 rounded-sm bg-teal-50 text-teal-700 shrink-0 border border-teal-100">
                <Percent className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white px-4 py-3 rounded-sm border border-[#D6DCDC] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#8BA6B1] uppercase truncate">
                  Получено водителями
                </p>
                <p className="text-xl font-bold text-[#476673] mt-0.5">
                  {driverPayoutsTotal.toLocaleString('ru')} сом
                </p>
                <span className="text-[10px] text-[#8BA6B1] mt-1 block">
                  Выплачено водителям за поездки
                </span>
              </div>
              <div className="p-2 rounded-sm bg-[#F3F4F6] text-[#476673] shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex border-b border-[#D6DCDC] gap-6 text-sm">
            <button
              onClick={() => setActiveSubTab('tx')}
              className={`pb-2.5 font-bold transition-all relative ${
                activeSubTab === 'tx' ? 'text-[#476673]' : 'text-[#8BA6B1] hover:text-[#476673]'
              }`}
            >
              История транзакций ({transactions.length})
              {activeSubTab === 'tx' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#476673]" />
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('ref')}
              className={`pb-2.5 font-bold transition-all relative ${
                activeSubTab === 'ref' ? 'text-[#476673]' : 'text-[#8BA6B1] hover:text-[#476673]'
              }`}
            >
              Возвраты пассажирам ({refunds.length})
              {activeSubTab === 'ref' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#476673]" />
              )}
            </button>
          </div>

          <div className="bg-white rounded-sm border border-[#D6DCDC] shadow-sm overflow-hidden">
            {activeSubTab === 'tx' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#D6DCDC] text-xs font-semibold uppercase text-[#476673]/80">
                      <th className="p-4 pl-6">ID транзакции</th>
                      <th className="p-4">Водитель</th>
                      <th className="p-4 font-mono">Дата</th>
                      <th className="p-4">Комиссия</th>
                      <th className="p-4 text-right">Сумма</th>
                      <th className="p-4 pr-6">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-[#8BA6B1]">
                          <p>Транзакций пока нет.</p>
                          <p className="text-[11px] mt-2 text-amber-700/80">
                            Если в Supabase уже есть записи — откройте SQL Editor и выполните
                            файл <span className="font-mono">supabase/rls-transactions.sql</span>
                          </p>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50/50">
                          <td className="p-4 pl-6 font-mono text-xs font-semibold text-[#8BA6B1]">
                            {tx.transactionCode || tx.id.slice(0, 8)}
                          </td>
                          <td className="p-4 text-xs font-semibold text-gray-700">
                            {tx.driverName}
                          </td>
                          <td className="p-4 text-xs text-gray-500 font-mono">{tx.date}</td>
                          <td className="p-4 font-mono font-bold text-teal-700 text-xs">
                            +{tx.commission.toLocaleString('ru')} сом
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-[#476673] text-xs">
                            {tx.amount.toLocaleString('ru')} сом
                          </td>
                          <td className="p-4 pr-6">
                            <span
                              className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                                tx.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.status === 'refunded'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {tx.statusLabel}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeSubTab === 'ref' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#D6DCDC] text-xs font-semibold uppercase text-[#476673]/80">
                      <th className="p-4 pl-6">ID возврата</th>
                      <th className="p-4">Забронированный рейс</th>
                      <th className="p-4">Пассажир-получатель</th>
                      <th className="p-4">Возвращенная сумма</th>
                      <th className="p-4 text-left">Причина возврата</th>
                      <th className="p-4 font-mono">Дата возврата</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {refunds.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-[#8BA6B1]">
                          Возвратов пока нет.
                        </td>
                      </tr>
                    ) : (
                      refunds.map((ref) => (
                        <tr key={ref.id} className="hover:bg-gray-50/50">
                          <td className="p-4 pl-6 font-mono text-xs font-bold text-[#8BA6B1]">
                            {ref.id.slice(0, 8)}…
                          </td>
                          <td className="p-4 font-bold text-xs text-[#476673]">
                            Рейс №{ref.rideId.slice(0, 8)}…
                          </td>
                          <td className="p-4 font-semibold text-xs text-gray-700">
                            {ref.passengerName}
                          </td>
                          <td className="p-4 font-mono font-bold text-[#476673]">
                            {ref.amount.toLocaleString('ru')} сом
                          </td>
                          <td
                            className="p-4 text-xs font-medium text-slate-700 max-w-xs truncate"
                            title={ref.reason}
                          >
                            {ref.reason}
                          </td>
                          <td className="p-4 text-xs font-mono text-[#8BA6B1]">{ref.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
