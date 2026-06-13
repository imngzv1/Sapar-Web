import React, { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Eye,
  Star,
  Phone,
  Mail,
  Car,
  ShieldOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Wallet,
  FileText,
} from 'lucide-react';
import {
  DbDriver,
  fetchVerifiedDrivers,
  revokeDriverVerification,
  fetchDriverPayoutSum,
  fetchDriverRides,
  buildDocumentUrl,
  isPdfPath,
} from '../../lib/drivers';
import { DbRideSummary } from '../../lib/users';

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ru-RU');
  } catch {
    return iso;
  }
};

const initials = (name: string | undefined, last: string | null | undefined) => {
  const a = (name ?? '').trim()[0] ?? '?';
  const b = (last ?? '').trim()[0] ?? '';
  return (a + b).toUpperCase();
};

const driverFullName = (d: DbDriver) =>
  d.user ? [d.user.name, d.user.last_name].filter(Boolean).join(' ') : '—';

export default function DriversTab() {
  const [drivers, setDrivers] = useState<DbDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selected, setSelected] = useState<DbDriver | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<DbDriver | null>(null);
  const [revoking, setRevoking] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchVerifiedDrivers();
      setDrivers(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Не удалось загрузить водителей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter((d) => {
      const name = driverFullName(d).toLowerCase();
      return (
        name.includes(q) ||
        d.brand.toLowerCase().includes(q) ||
        d.number.toLowerCase().includes(q) ||
        (d.user?.phone ?? '').includes(q) ||
        (d.user?.email ?? '').toLowerCase().includes(q)
      );
    });
  }, [drivers, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleRevoke = async (driver: DbDriver) => {
    try {
      setRevoking(true);
      await revokeDriverVerification(driver.id);
      setConfirmRevoke(null);
      setSelected(null);
      await load();
    } catch (e: any) {
      alert(`Не удалось отозвать верификацию: ${e?.message ?? 'ошибка'}`);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#476673]">Водители</h2>
        <p className="text-sm text-[#8BA6B1]">
          Только верифицированные водители (is_verified = true)
        </p>
      </div>

      <div className="bg-white p-4 rounded-sm border border-[#D6DCDC] flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8BA6B1]" />
          <input
            type="text"
            placeholder="Поиск по имени, марке, номеру..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] rounded-sm border border-[#D6DCDC] text-sm text-[#476673] placeholder-[#8BA6B1] focus:ring-2 focus:ring-[#476673]/30 focus:outline-none"
          />
        </div>
        <div className="text-xs text-[#8BA6B1]">
          Всего: <span className="font-bold text-[#476673]">{drivers.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-[#D6DCDC] overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-[#8BA6B1] text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Загружаем водителей...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-rose-700">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#D6DCDC] text-xs font-semibold uppercase tracking-wider text-[#476673]/70">
                    <th className="p-4 pl-6">Водитель</th>
                    <th className="p-4">Машина</th>
                    <th className="p-4">Контакты</th>
                    <th className="p-4 text-center">Рейтинг</th>
                    <th className="p-4">Верифицирован</th>
                    <th className="p-4 pr-6 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-[#8BA6B1]">
                        Нет верифицированных водителей.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-sm bg-[#BFCFC2] text-[#476673] flex items-center justify-center text-sm font-bold shrink-0">
                              {initials(d.user?.name, d.user?.last_name)}
                            </div>
                            <div>
                              <p
                                onClick={() => setSelected(d)}
                                className="font-bold text-[#476673] hover:underline cursor-pointer"
                              >
                                {driverFullName(d)}
                              </p>
                              <p className="text-[10px] text-[#8BA6B1] font-mono">
                                {d.id.slice(0, 8)}…
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs text-[#476673]">
                            <p className="font-bold">{d.brand}</p>
                            <p className="text-[#8BA6B1] font-mono">
                              {d.number} · {d.color}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-xs">
                          <p className="font-mono text-[#476673]">{d.user?.phone ?? '—'}</p>
                          <p className="text-[#8BA6B1] truncate max-w-[180px]">
                            {d.user?.email ?? '—'}
                          </p>
                        </td>
                        <td className="p-4 text-center text-xs text-[#476673]">
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {(d.user?.rating ?? 0).toFixed(1)}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-[#476673] font-mono">
                          {formatDate(d.created_at)}
                        </td>
                        <td className="p-4 pr-6 text-right space-x-1">
                          <button
                            title="Открыть карточку"
                            onClick={() => setSelected(d)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 transition-colors inline-block"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Отозвать верификацию"
                            onClick={() => setConfirmRevoke(d)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 transition-colors inline-block"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-gray-50 border-t border-[#D6DCDC] flex items-center justify-between text-xs text-[#8BA6B1]">
              <span>
                Показано {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}–
                {Math.min(filtered.length, currentPage * itemsPerPage)} из {filtered.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-sm border border-[#D6DCDC] bg-white text-[#476673] hover:bg-[#F3F4F6] disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-[#476673] px-2 font-mono">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-sm border border-[#D6DCDC] bg-white text-[#476673] hover:bg-[#F3F4F6] disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selected && (
        <DriverDetailDrawer
          driver={selected}
          onClose={() => setSelected(null)}
          onRevokeRequest={() => setConfirmRevoke(selected)}
        />
      )}

      {confirmRevoke && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-sm border border-rose-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <ShieldOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950">
                  Отозвать верификацию?
                </h3>
                <p className="text-xs text-rose-700/80">
                  Водитель: {driverFullName(confirmRevoke)}
                </p>
              </div>
            </div>
            <div className="p-6 text-xs text-[#476673] leading-relaxed">
              Поле <code className="font-mono">is_verified</code> будет переключено в{' '}
              <code className="font-mono">false</code>. Водитель уйдёт обратно в раздел «Заявки на
              проверку». Это действие можно откатить — заново подтвердить там.
            </div>
            <div className="bg-gray-50 p-4 border-t border-[#D6DCDC] flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmRevoke(null)}
                disabled={revoking}
                className="px-4 py-2 rounded-sm border border-[#D6DCDC] text-xs font-bold text-[#476673] hover:bg-gray-100 bg-white disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={() => handleRevoke(confirmRevoke)}
                disabled={revoking}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
              >
                {revoking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Отозвать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DriverDetailDrawer({
  driver,
  onClose,
  onRevokeRequest,
}: {
  driver: DbDriver;
  onClose: () => void;
  onRevokeRequest: () => void;
}) {
  const [rides, setRides] = useState<DbRideSummary[] | null>(null);
  const [payoutSum, setPayoutSum] = useState<number | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingHistory(true);
        setHistoryError(null);
        const [r, sum] = await Promise.all([
          fetchDriverRides(driver.id),
          fetchDriverPayoutSum(driver.id),
        ]);
        if (!cancelled) {
          setRides(r);
          setPayoutSum(sum);
        }
      } catch (e: any) {
        if (!cancelled) setHistoryError(e?.message ?? 'Не удалось загрузить историю');
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [driver.id]);

  const documents: Array<{ label: string; path: string | null }> = [
    { label: 'Паспорт', path: driver.photo_passport },
    { label: 'Водительские права', path: driver.photo_license_car },
    { label: 'Техпаспорт', path: driver.photo_tech_passport },
    { label: 'Медсправка', path: driver.photo_medical_certificate },
    { label: 'Справка о несудимости', path: driver.photo_criminal_record },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-lg bg-white border-l border-[#D6DCDC] shadow-2xl z-50 overflow-y-auto">
      <div className="p-6 border-b border-[#D6DCDC] flex items-center justify-between bg-gray-50 sticky top-0 z-10">
        <h3 className="text-base font-bold text-[#476673]">Карточка водителя</h3>
        <button
          onClick={onClose}
          className="text-[#8BA6B1] hover:text-[#476673] text-sm font-bold bg-white px-2.5 py-1.5 rounded-sm border border-[#D6DCDC] cursor-pointer"
        >
          Закрыть
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#BFCFC2] text-[#476673] flex items-center justify-center text-2xl font-bold border-4 border-[#8BA6B1]/20">
            {initials(driver.user?.name, driver.user?.last_name)}
          </div>
          <h4 className="text-lg font-bold text-[#476673] mt-3">{driverFullName(driver)}</h4>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full mt-1">
            Верифицирован
          </span>
        </div>

        <div className="bg-[#F3F4F6] p-4 rounded-sm border border-[#D6DCDC] space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#8BA6B1]">Контакты</h5>
          <div className="space-y-2 text-xs text-[#476673]">
            <p className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#8BA6B1] shrink-0" />
              <span className="font-mono">{driver.user?.phone ?? '—'}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#8BA6B1] shrink-0" />
              <span className="break-all">{driver.user?.email ?? '—'}</span>
            </p>
          </div>
        </div>

        <div className="bg-[#F3F4F6] p-4 rounded-sm border border-[#D6DCDC] space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#8BA6B1] flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5" /> Автомобиль
          </h5>
          <div className="text-xs text-[#476673] space-y-1">
            <p>
              <span className="text-[#8BA6B1]">Марка:</span>{' '}
              <span className="font-semibold">{driver.brand}</span>
            </p>
            <p>
              <span className="text-[#8BA6B1]">Номер:</span>{' '}
              <span className="font-mono font-semibold">{driver.number}</span>
            </p>
            <p>
              <span className="text-[#8BA6B1]">Цвет:</span>{' '}
              <span className="font-semibold">{driver.color}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F3F4F6] p-4 rounded-sm border border-[#D6DCDC] text-center">
            <span className="text-xs text-[#8BA6B1] font-semibold">Поездок</span>
            <p className="text-2xl font-bold text-[#476673] mt-1">
              {driver.user?.trips_count ?? 0}
            </p>
          </div>
          <div className="bg-[#F3F4F6] p-4 rounded-sm border border-[#D6DCDC] text-center">
            <span className="text-xs text-[#8BA6B1] font-semibold">Рейтинг</span>
            <p className="text-2xl font-bold text-[#476673] mt-1">
              {(driver.user?.rating ?? 0).toFixed(1)}
            </p>
          </div>
        </div>

        <div className="bg-[#476673] p-4 rounded-sm text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-[#BFCFC2]" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/70">
                Сумма выплат
              </p>
              <p className="text-xl font-bold">
                {payoutSum === null ? '—' : `${payoutSum.toFixed(2)} сом`}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#8BA6B1] mb-2">
            Документы
          </h5>
          <div className="grid grid-cols-2 gap-2">
            {documents.map((doc) => (
              <Fragment key={doc.label}>
                <DocumentTile label={doc.label} path={doc.path} />
              </Fragment>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#8BA6B1] mb-2">
            История поездок
          </h5>
          {loadingHistory ? (
            <div className="p-6 flex items-center justify-center text-[#8BA6B1] text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Загружаем...
            </div>
          ) : historyError ? (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-sm px-3 py-2">
              {historyError}
            </div>
          ) : !rides || rides.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#8BA6B1] border border-dashed border-[#D6DCDC] rounded-sm">
              Поездок нет.
            </div>
          ) : (
            <div className="space-y-2">
              {rides.map((r: DbRideSummary) => (
                <Fragment key={r.id}>
                  <RideCard ride={r} />
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-[#D6DCDC] sticky bottom-0">
        <button
          onClick={onRevokeRequest}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm uppercase flex items-center justify-center gap-2"
        >
          <ShieldOff className="w-4 h-4" />
          Отозвать верификацию
        </button>
      </div>
    </div>
  );
}

function DocumentTile({ label, path }: { label: string; path: string | null }) {
  const url = buildDocumentUrl(path);
  const isPdf = isPdfPath(path);
  const [errored, setErrored] = useState(false);

  if (!path) {
    return (
      <div className="aspect-square bg-[#F3F4F6] border border-dashed border-[#D6DCDC] rounded-sm flex items-center justify-center text-[10px] text-[#8BA6B1] p-2 text-center">
        <span>{label}<br />(не загружено)</span>
      </div>
    );
  }
  return (
    <a
      href={url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square bg-[#F3F4F6] border border-[#D6DCDC] rounded-sm overflow-hidden hover:border-[#476673] transition-colors block"
    >
      {isPdf ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-rose-50">
          <FileText className="w-8 h-8 text-rose-600 mb-1" />
          <span className="text-[10px] text-rose-800 font-bold uppercase">PDF</span>
        </div>
      ) : url && !errored ? (
        <img
          src={url}
          alt={label}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-rose-50">
          <span className="text-[10px] text-rose-700 font-semibold">Ошибка загрузки</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-2">
        <div className="w-full flex items-center justify-between text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100">
          <span>{label}</span>
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>
      <div className="absolute top-1 left-1 bg-white/90 text-[#476673] text-[9px] font-semibold px-1.5 py-0.5 rounded-sm">
        {label}
      </div>
    </a>
  );
}

function RideCard({ ride }: { ride: DbRideSummary }) {
  return (
    <div className="p-3 bg-[#F3F4F6] rounded-sm border border-[#D6DCDC]">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-[#476673] font-semibold flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#8BA6B1]" />
          {ride.from_city?.name ?? `#${ride.from_city_id}`} →{' '}
          {ride.to_city?.name ?? `#${ride.to_city_id}`}
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            ride.status === 'active'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {ride.status === 'active' ? 'Активна' : 'Отменена'}
        </span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#8BA6B1]">
        <span>
          {formatDate(ride.start_date)} · {ride.start_time}
        </span>
        <span className="font-mono text-[#476673] font-semibold">
          {ride.price} сом · {ride.total_seats - ride.free_seats}/{ride.total_seats} мест
        </span>
      </div>
    </div>
  );
}
