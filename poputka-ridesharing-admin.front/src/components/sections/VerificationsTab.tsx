import React, { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Check,
  X,
  Phone,
  Mail,
  Car,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  ZoomIn,
  FileText,
} from 'lucide-react';
import {
  DbDriver,
  fetchPendingDrivers,
  approveDriverVerification,
  buildDocumentUrl,
  isPdfPath,
} from '../../lib/drivers';

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

export default function VerificationsTab() {
  const [drivers, setDrivers] = useState<DbDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selected, setSelected] = useState<DbDriver | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingDrivers();
      setDrivers(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Не удалось загрузить заявки');
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
        (d.user?.phone ?? '').includes(q)
      );
    });
  }, [drivers, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleApprove = async (driver: DbDriver) => {
    try {
      setApproving(driver.id);
      await approveDriverVerification(driver.id);
      setSelected(null);
      await load();
    } catch (e: any) {
      alert(`Не удалось одобрить: ${e?.message ?? 'ошибка'}`);
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#476673]">Заявки на проверку</h2>
        <p className="text-sm text-[#8BA6B1]">
          Водители, ожидающие верификации (is_verified = false)
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
          В очереди: <span className="font-bold text-amber-700">{drivers.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-sm border border-[#D6DCDC] flex items-center justify-center text-[#8BA6B1] text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Загружаем заявки...
        </div>
      ) : error ? (
        <div className="bg-white p-8 rounded-sm border border-rose-200 text-sm text-rose-700 text-center">
          {error}
        </div>
      ) : paginated.length === 0 ? (
        <div className="bg-white p-12 rounded-sm border border-dashed border-[#D6DCDC] text-center text-[#8BA6B1] text-sm">
          <FileCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
          Новых заявок нет.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((d: DbDriver) => (
              <Fragment key={d.id}>
                <VerificationCard
                  driver={d}
                  onOpen={() => setSelected(d)}
                  onApprove={() => handleApprove(d)}
                  approving={approving === d.id}
                />
              </Fragment>
            ))}
          </div>

          <div className="p-3 bg-white rounded-sm border border-[#D6DCDC] flex items-center justify-between text-xs text-[#8BA6B1]">
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

      {selected && (
        <VerificationDrawer
          driver={selected}
          onClose={() => setSelected(null)}
          onApprove={() => handleApprove(selected)}
          approving={approving === selected.id}
          onOpenLightbox={(url, label) => setLightbox({ url, label })}
        />
      )}

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/85 z-[70] flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white hover:text-rose-300 bg-black/40 rounded-full p-2 z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {isPdfPath(lightbox.url) ? (
              <iframe
                src={lightbox.url}
                title={lightbox.label}
                className="w-full h-[80vh] bg-white border-2 border-white/20"
              />
            ) : (
              <img
                src={lightbox.url}
                alt={lightbox.label}
                className="max-w-full max-h-[80vh] object-contain border-2 border-white/20"
              />
            )}
            <p className="text-white text-sm font-semibold">{lightbox.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function VerificationCard({
  driver,
  onOpen,
  onApprove,
  approving,
}: {
  driver: DbDriver;
  onOpen: () => void;
  onApprove: () => void;
  approving: boolean;
}) {
  return (
    <div className="bg-white rounded-sm border border-[#D6DCDC] hover:border-amber-400 transition-colors overflow-hidden flex flex-col">
      <div
        onClick={onOpen}
        className="p-4 flex items-center gap-3 cursor-pointer border-b border-[#D6DCDC]"
      >
        <div className="w-12 h-12 rounded-sm bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold shrink-0">
          {initials(driver.user?.name, driver.user?.last_name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[#476673] truncate">{driverFullName(driver)}</p>
          <p className="text-xs text-[#8BA6B1] font-mono truncate">
            {driver.user?.phone ?? '—'}
          </p>
        </div>
        <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
          Ожидает
        </span>
      </div>

      <div className="p-4 space-y-2 flex-1">
        <div className="flex items-center gap-2 text-xs text-[#476673]">
          <Car className="w-3.5 h-3.5 text-[#8BA6B1]" />
          <span className="font-semibold">{driver.brand}</span>
          <span className="text-[#8BA6B1] font-mono">{driver.number}</span>
        </div>
        <p className="text-[11px] text-[#8BA6B1]">
          Подана: <span className="font-mono text-[#476673]">{formatDate(driver.created_at)}</span>
        </p>
      </div>

      <div className="p-3 bg-gray-50 border-t border-[#D6DCDC] flex gap-2">
        <button
          onClick={onOpen}
          className="flex-1 py-1.5 bg-white border border-[#D6DCDC] text-[#476673] text-xs font-semibold hover:bg-[#F3F4F6] transition-colors"
        >
          Открыть
        </button>
        <button
          onClick={onApprove}
          disabled={approving}
          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
        >
          {approving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Одобрить
        </button>
      </div>
    </div>
  );
}

function VerificationDrawer({
  driver,
  onClose,
  onApprove,
  approving,
  onOpenLightbox,
}: {
  driver: DbDriver;
  onClose: () => void;
  onApprove: () => void;
  approving: boolean;
  onOpenLightbox: (url: string, label: string) => void;
}) {
  const documents: Array<{ label: string; path: string | null; required: boolean }> = [
    { label: 'Паспорт', path: driver.photo_passport, required: true },
    { label: 'Водительские права', path: driver.photo_license_car, required: true },
    { label: 'Техпаспорт', path: driver.photo_tech_passport, required: true },
    { label: 'Медсправка', path: driver.photo_medical_certificate, required: false },
    { label: 'Справка о несудимости', path: driver.photo_criminal_record, required: false },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-2xl bg-white border-l border-[#D6DCDC] shadow-2xl z-50 overflow-y-auto">
      <div className="p-6 border-b border-[#D6DCDC] flex items-center justify-between bg-gray-50 sticky top-0 z-10">
        <div>
          <h3 className="text-base font-bold text-[#476673]">Заявка на верификацию</h3>
          <p className="text-xs text-[#8BA6B1]">Проверьте документы перед подтверждением</p>
        </div>
        <button
          onClick={onClose}
          className="text-[#8BA6B1] hover:text-[#476673] text-sm font-bold bg-white px-2.5 py-1.5 rounded-sm border border-[#D6DCDC] cursor-pointer"
        >
          Закрыть
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold">
            {initials(driver.user?.name, driver.user?.last_name)}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-[#476673]">{driverFullName(driver)}</h4>
            <div className="text-xs text-[#476673] space-y-0.5 mt-1">
              <p className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-[#8BA6B1]" />
                <span className="font-mono">{driver.user?.phone ?? '—'}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-[#8BA6B1]" />
                <span className="break-all">{driver.user?.email ?? '—'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#F3F4F6] p-4 rounded-sm border border-[#D6DCDC]">
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#8BA6B1] flex items-center gap-1.5 mb-2">
            <Car className="w-3.5 h-3.5" /> Автомобиль
          </h5>
          <div className="grid grid-cols-3 gap-3 text-xs text-[#476673]">
            <div>
              <p className="text-[#8BA6B1]">Марка</p>
              <p className="font-semibold">{driver.brand}</p>
            </div>
            <div>
              <p className="text-[#8BA6B1]">Номер</p>
              <p className="font-mono font-semibold">{driver.number}</p>
            </div>
            <div>
              <p className="text-[#8BA6B1]">Цвет</p>
              <p className="font-semibold">{driver.color}</p>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#8BA6B1] mb-2">
            Документы
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {documents.map((doc) => (
              <Fragment key={doc.label}>
                <DocumentBigTile
                  label={doc.label}
                  path={doc.path}
                  required={doc.required}
                  onZoom={onOpenLightbox}
                />
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-[#D6DCDC] sticky bottom-0 flex gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2.5 bg-white border border-[#D6DCDC] text-[#476673] font-bold text-xs uppercase hover:bg-[#F3F4F6]"
        >
          Отмена
        </button>
        <button
          onClick={onApprove}
          disabled={approving}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm uppercase disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {approving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Одобрить верификацию
        </button>
      </div>
    </div>
  );
}

function DocumentBigTile({
  label,
  path,
  required,
  onZoom,
}: {
  label: string;
  path: string | null;
  required: boolean;
  onZoom: (url: string, label: string) => void;
}) {
  const url = buildDocumentUrl(path);
  const isPdf = isPdfPath(path);
  const [errored, setErrored] = useState(false);

  if (!path) {
    return (
      <div className="aspect-square bg-[#F3F4F6] border border-dashed border-[#D6DCDC] rounded-sm flex flex-col items-center justify-center text-[10px] text-[#8BA6B1] p-2 text-center">
        <span className="font-semibold mb-1">{label}</span>
        <span className="text-[9px]">{required ? 'Обязательно — не загружено' : 'Не загружено'}</span>
      </div>
    );
  }

  return (
    <div className="group relative aspect-square bg-[#F3F4F6] border border-[#D6DCDC] rounded-sm overflow-hidden">
      {isPdf ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-rose-50">
          <FileText className="w-10 h-10 text-rose-600 mb-2" />
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
          <span className="text-[10px] text-rose-700 font-semibold mb-1">Не удалось загрузить</span>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-[#476673] underline break-all"
            >
              Открыть ссылку
            </a>
          )}
        </div>
      )}
      {url && (isPdf || !errored) && (
        <button
          onClick={() => onZoom(url, label)}
          className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100"
        >
          <ZoomIn className="w-6 h-6" />
        </button>
      )}
      <div className="absolute top-1 left-1 right-1 flex items-center justify-between">
        <span className="bg-white/90 text-[#476673] text-[9px] font-semibold px-1.5 py-0.5 rounded-sm">
          {label}
        </span>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/90 text-[#476673] p-1 rounded-sm hover:bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
