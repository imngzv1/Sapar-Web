import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  XOctagon,
  Search,
  Lock,
  Unlock,
  Loader2,
  Star,
  Phone,
} from 'lucide-react';
import { Complaint } from '../../types';
import { fetchComplaints, markReviewAsReviewed } from '../../lib/complaints';
import { DbDriver, fetchBlockedDrivers, unblockDriver } from '../../lib/drivers';

interface ModerationTabProps {
  onLogAction: (action: string, targetType: 'complaint' | 'user_state', targetId: string, details: string) => void;
}

const driverFullName = (d: DbDriver) =>
  d.user ? [d.user.name, d.user.last_name].filter(Boolean).join(' ') : '—';

const driverInitials = (d: DbDriver) => {
  const a = (d.user?.name ?? '').trim()[0] ?? '?';
  const b = (d.user?.last_name ?? '').trim()[0] ?? '';
  return (a + b).toUpperCase();
};

export default function ModerationTab({ onLogAction }: ModerationTabProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [blacklistSearch, setBlacklistSearch] = useState('');
  const [blockedDrivers, setBlockedDrivers] = useState<DbDriver[]>([]);
  const [blacklistLoading, setBlacklistLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setBlacklistLoading(true);
        const data = await fetchBlockedDrivers();
        if (!cancelled) setBlockedDrivers(data);
      } catch {
        if (!cancelled) setBlockedDrivers([]);
      } finally {
        if (!cancelled) setBlacklistLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchComplaints();
        if (!cancelled) {
          setComplaints(data);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Не удалось загрузить жалобы');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBlockedDrivers = useMemo(() => {
    const q = blacklistSearch.trim().toLowerCase();
    if (!q) return blockedDrivers;
    return blockedDrivers.filter((d) => {
      const name = driverFullName(d).toLowerCase();
      return name.includes(q) || (d.user?.phone ?? '').includes(q);
    });
  }, [blockedDrivers, blacklistSearch]);

  const handleReview = async () => {
    if (!selectedComplaint) return;
    try {
      setReviewing(true);
      setReviewError(null);
      await markReviewAsReviewed(selectedComplaint.id);
      setComplaints((prev) => prev.filter((c) => c.id !== selectedComplaint.id));
      onLogAction(
        'Жалоба рассмотрена',
        'complaint',
        selectedComplaint.id,
        `Админ рассмотрел жалобу от ${selectedComplaint.reporterName} на ${selectedComplaint.reportedName}. Статус отзыва: reviewed.`,
      );
      setSelectedComplaint(null);
    } catch (e: any) {
      setReviewError(e?.message ?? 'Не удалось обновить статус отзыва');
    } finally {
      setReviewing(false);
    }
  };

  const handleUnblock = async (driver: DbDriver) => {
    if (!confirm(`Разблокировать водителя ${driverFullName(driver)}?`)) return;
    try {
      setUnblockingId(driver.id);
      await unblockDriver(driver.id);
      setBlockedDrivers((prev) => prev.filter((d) => d.id !== driver.id));
      onLogAction(
        'Разблокировка водителя',
        'user_state',
        driver.id,
        `Водитель ${driverFullName(driver)} разблокирован (is_blocked = false).`,
      );
    } catch (e: any) {
      alert(e?.message ?? 'Не удалось разблокировать водителя');
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <div id="moderation-tab-view" className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#476673]">Жалобы и модерация</h2>
        <p className="text-sm text-[#8BA6B1]">Жалобы пассажиров и водителей, чёрный список</p>
        <p className="text-xs text-[#8BA6B1] mt-1">
          Отзывы на водителей: оценка ниже 4, статус new
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-[#8BA6B1]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Загружаем жалобы...</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white p-5 rounded-sm border border-[#D6DCDC] shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#476673] flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Поступившие жалобы пользователей
              </h3>
              <p className="text-xs text-[#8BA6B1]">
                Нажмите «Рассмотреть», чтобы отметить жалобу как reviewed в базе
              </p>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {complaints.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8BA6B1] italic">
                  Нет новых жалоб для рассмотрения.
                </div>
              ) : (
                complaints.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => {
                      setSelectedComplaint(comp);
                      setReviewError(null);
                    }}
                    className="p-4 border transition-all cursor-pointer bg-rose-50/30 border-rose-200 hover:border-rose-400"
                  >
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-bold text-[#476673] bg-[#D6DCDC]/50 px-2 py-0.5 rounded font-mono">
                          Жалоба №{comp.id.slice(0, 8)}…
                        </span>
                        <span className="ml-1.5 text-[10px] text-gray-500">{comp.date}</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-rose-100 text-rose-800">
                        Новая
                      </span>
                    </div>

                    {comp.rating != null && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-bold">{comp.rating} / 5</span>
                      </div>
                    )}

                    <p className="text-xs text-[#476673] font-medium leading-relaxed my-2.5 italic">
                      «{comp.text}»
                    </p>

                    <div className="text-xs space-y-2 text-gray-600 border-t border-dashed border-gray-100 pt-2">
                      <div>
                        <span className="text-gray-400">От кого:</span>{' '}
                        <span className="font-bold text-[#476673]">{comp.reporterName}</span>
                        <PhoneLink phone={comp.reporterPhone} stopPropagation />
                      </div>
                      <div>
                        <span className="text-gray-400">На кого:</span>{' '}
                        <span className="font-extrabold text-[#476673] underline">
                          {comp.reportedName} (Водитель)
                        </span>
                        <PhoneLink phone={comp.reportedPhone} stopPropagation />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div id="blacklist-board" className="bg-white p-5 rounded-sm border border-rose-200 shadow-sm space-y-4">
            <div className="border-b border-rose-100 pb-3">
              <h3 className="text-base font-bold text-rose-950 flex items-center gap-1.5">
                <Lock className="w-5 h-5 text-rose-600" />
                Чёрный список
              </h3>
              <p className="text-xs text-rose-700/80">
                Заблокированные водители (is_blocked = true)
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400" />
              <input
                type="text"
                placeholder="Поиск по заблокированным лицам..."
                value={blacklistSearch}
                onChange={(e) => setBlacklistSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-rose-50/30 rounded-sm border border-rose-200 text-rose-950 placeholder-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {blacklistLoading ? (
                <div className="py-12 flex items-center justify-center text-[#8BA6B1] text-xs gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Загружаем...
                </div>
              ) : filteredBlockedDrivers.length === 0 ? (
                <div className="py-12 text-center text-xs text-rose-400/80 italic border border-dashed border-rose-100 bg-rose-50/10">
                  Чёрный список пуст.
                </div>
              ) : (
                filteredBlockedDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="p-4 bg-rose-50/20 border border-rose-150 flex items-center justify-between hover:bg-rose-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-sm bg-[#BFCFC2] text-[#476673] flex items-center justify-center text-[10px] font-bold shrink-0">
                        {driverInitials(driver)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-rose-950">{driverFullName(driver)}</span>
                        <p className="text-[10px] text-rose-700 font-mono">{driver.user?.phone ?? '—'}</p>
                        <p className="text-[10px] text-rose-600/80">
                          {driver.brand} · {driver.number}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnblock(driver)}
                      disabled={unblockingId === driver.id}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 hover:border-emerald-400 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {unblockingId === driver.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Unlock className="w-3 h-3 text-emerald-600" />
                      )}
                      Разблокировать
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-rose-100 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#476673]/60 uppercase font-mono">
                  Разбор инцидента
                </span>
                <h4 className="text-sm font-bold text-rose-950 mt-1">
                  Жалоба от {selectedComplaint.reporterName}
                </h4>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XOctagon className="w-5 h-5 text-[#8BA6B1]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-[#F3F4F6] p-4 rounded-sm border border-[#D6DCDC] text-xs">
                <p className="text-gray-400 font-semibold uppercase">Суть заявления:</p>
                <p className="text-[#476673] italic font-medium leading-relaxed mt-1.5">
                  «{selectedComplaint.text}»
                </p>
                {selectedComplaint.rating != null && (
                  <p className="mt-2 flex items-center gap-1 text-amber-700 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    Оценка: {selectedComplaint.rating} / 5
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-y border-gray-100 py-3">
                <div>
                  <span className="text-[#8BA6B1]">От кого:</span>
                  <p className="font-bold text-[#476673]">{selectedComplaint.reporterName}</p>
                  <PhoneLink phone={selectedComplaint.reporterPhone} />
                </div>
                <div>
                  <span className="text-rose-600 font-semibold">На кого:</span>
                  <p className="font-bold text-rose-950 underline">{selectedComplaint.reportedName}</p>
                  <PhoneLink phone={selectedComplaint.reportedPhone} />
                </div>
              </div>

              {reviewError && (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-sm px-3 py-2">
                  {reviewError}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 border-t border-[#D6DCDC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                disabled={reviewing}
                className="px-4 py-2 text-xs font-bold text-[#8BA6B1] hover:text-[#476673] disabled:opacity-50"
              >
                Закрыть
              </button>
              <button
                type="button"
                onClick={handleReview}
                disabled={reviewing}
                className="px-4 py-2 bg-[#476673] hover:bg-[#3a5560] text-xs font-bold text-white shadow-xs disabled:opacity-50 inline-flex items-center gap-2"
              >
                {reviewing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Рассмотреть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhoneLink({ phone, stopPropagation }: { phone?: string; stopPropagation?: boolean }) {
  if (!phone || phone === '—') {
    return <p className="text-[10px] text-[#8BA6B1] font-mono mt-0.5">—</p>;
  }

  return (
    <a
      href={`tel:${phone.replace(/\s/g, '')}`}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
      className="inline-flex items-center gap-1 text-[10px] font-mono text-[#476673] hover:text-rose-700 hover:underline mt-0.5"
    >
      <Phone className="w-3 h-3 text-[#8BA6B1] shrink-0" />
      {phone}
    </a>
  );
}
