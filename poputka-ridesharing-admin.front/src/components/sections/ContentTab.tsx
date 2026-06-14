import React, { Fragment, useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  DbCity,
  fetchCities,
  createCity,
  updateCity,
  deleteCity,
} from '../../lib/cities';
import { AdminLog } from '../../types';

interface ContentTabProps {
  onLogAction: (
    action: string,
    targetType: AdminLog['targetType'],
    targetId: string,
    details: string,
  ) => void;
}

export default function ContentTab({ onLogAction }: ContentTabProps) {
  const [cities, setCities] = useState<DbCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [newName, setNewName] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DbCity | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchCities();
      setCities(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Не удалось загрузить города');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.regoin ?? '').toLowerCase().includes(q),
    );
  }, [cities, search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setAddError('Введите название города');
      return;
    }
    if (cities.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setAddError('Такой город уже есть');
      return;
    }
    try {
      setAdding(true);
      await createCity(name, newRegion);
      onLogAction('Город добавлен', 'city', name, `Добавлен город «${name}».`);
      setNewName('');
      setNewRegion('');
      setAddError(null);
      await load();
    } catch (e: any) {
      setAddError(e?.message ?? 'Не удалось добавить');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (c: DbCity) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditRegion(c.regoin ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditRegion('');
  };

  const saveEdit = async (id: number) => {
    const name = editName.trim();
    if (!name) return;
    try {
      setSavingEdit(true);
      await updateCity(id, name, editRegion);
      onLogAction('Город изменён', 'city', String(id), `Город обновлён: «${name}».`);
      cancelEdit();
      await load();
    } catch (e: any) {
      alert(`Не удалось сохранить: ${e?.message ?? 'ошибка'}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (city: DbCity) => {
    try {
      setDeletingId(city.id);
      await deleteCity(city.id);
      onLogAction('Город удалён', 'city', String(city.id), `Удалён город «${city.name}».`);
      setConfirmDelete(null);
      await load();
    } catch (e: any) {
      alert(`Не удалось удалить: ${e?.message ?? 'ошибка. Возможно, есть связанные поездки.'}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#476673]">Города</h2>
        <p className="text-sm text-[#8BA6B1]">
          Управление справочником городов, между которыми возможны поездки
        </p>
      </div>

      <div className="bg-white p-5 rounded-sm border border-[#D6DCDC]">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-[#476673]">Добавить город</h3>
        </div>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (addError) setAddError(null);
            }}
            placeholder="Название города *"
            className="flex-1 px-3 py-2 text-sm border border-[#D6DCDC] rounded-sm focus:outline-none focus:border-[#476673] bg-white text-[#476673]"
          />
          <input
            type="text"
            value={newRegion}
            onChange={(e) => setNewRegion(e.target.value)}
            placeholder="Регион (необязательно)"
            className="flex-1 px-3 py-2 text-sm border border-[#D6DCDC] rounded-sm focus:outline-none focus:border-[#476673] bg-white text-[#476673]"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-sm disabled:opacity-50 inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Добавить
          </button>
        </form>
        {addError && (
          <p className="text-xs text-rose-700 mt-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {addError}
          </p>
        )}
      </div>

      <div className="bg-white p-4 rounded-sm border border-[#D6DCDC] flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8BA6B1]" />
          <input
            type="text"
            placeholder="Поиск по названию или региону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] rounded-sm border border-[#D6DCDC] text-sm text-[#476673] placeholder-[#8BA6B1] focus:ring-2 focus:ring-[#476673]/30 focus:outline-none"
          />
        </div>
        <div className="text-xs text-[#8BA6B1]">
          Всего: <span className="font-bold text-[#476673]">{cities.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-[#D6DCDC] overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-[#8BA6B1] text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Загружаем города...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-rose-700">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#D6DCDC] text-xs font-semibold uppercase tracking-wider text-[#476673]/70">
                  <th className="p-4 pl-6 w-16">ID</th>
                  <th className="p-4">Название</th>
                  <th className="p-4">Регион</th>
                  <th className="p-4 pr-6 text-right w-40">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-[#8BA6B1]">
                      Городов нет.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c: DbCity) => (
                    <Fragment key={c.id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-6 text-xs font-mono text-[#8BA6B1]">{c.id}</td>
                        <td className="p-4">
                          {editingId === c.id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-[#476673] rounded-sm focus:outline-none bg-white text-[#476673]"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-[#8BA6B1]" />
                              <span className="font-semibold text-[#476673]">{c.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-sm text-[#476673]">
                          {editingId === c.id ? (
                            <input
                              type="text"
                              value={editRegion}
                              onChange={(e) => setEditRegion(e.target.value)}
                              placeholder="—"
                              className="w-full px-2 py-1 text-sm border border-[#476673] rounded-sm focus:outline-none bg-white text-[#476673]"
                            />
                          ) : (
                            <span className={c.regoin ? '' : 'text-[#8BA6B1]'}>
                              {c.regoin || '—'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right space-x-1">
                          {editingId === c.id ? (
                            <>
                              <button
                                onClick={() => saveEdit(c.id)}
                                disabled={savingEdit}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors inline-block disabled:opacity-50"
                                title="Сохранить"
                              >
                                {savingEdit ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 text-gray-500 hover:bg-gray-100 transition-colors inline-block"
                                title="Отмена"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(c)}
                                className="p-1.5 text-[#476673] hover:bg-[#F3F4F6] transition-colors inline-block"
                                title="Редактировать"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(c)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 transition-colors inline-block"
                                title="Удалить"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm border border-rose-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950">Удалить город?</h3>
                <p className="text-xs text-rose-700/80">{confirmDelete.name}</p>
              </div>
            </div>
            <div className="p-6 text-xs text-[#476673] leading-relaxed">
              Если на этот город есть ссылки в таблице поездок, база вернёт ошибку и удаление не
              пройдёт.
            </div>
            <div className="bg-gray-50 p-4 border-t border-[#D6DCDC] flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deletingId === confirmDelete.id}
                className="px-4 py-2 rounded-sm border border-[#D6DCDC] text-xs font-bold text-[#476673] hover:bg-gray-100 bg-white disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
              >
                {deletingId === confirmDelete.id && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
