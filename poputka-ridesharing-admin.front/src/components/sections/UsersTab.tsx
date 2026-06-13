import React, { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Star,
  Phone,
  Mail,
  Calendar,
  Car,
  User as UserIcon,
  Loader2,
  MapPin,
  Hash,
} from 'lucide-react';
import {
  DbUser,
  DbRideSummary,
  DbBooking,
  fetchUsers,
  fetchUserDrivenRides,
  fetchUserBookings,
} from '../../lib/users';

type RoleFilter = 'all' | 'driver' | 'passenger';

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ru-RU');
  } catch {
    return iso;
  }
};

const initials = (name: string, last: string | null) => {
  const a = (name ?? '').trim()[0] ?? '?';
  const b = (last ?? '').trim()[0] ?? '';
  return (a + b).toUpperCase();
};

const fullName = (u: DbUser) => [u.name, u.last_name].filter(Boolean).join(' ');

const rideStatusLabel = (s: string) =>
  s === 'active' ? 'Активна' : s === 'cancelled' ? 'Отменена' : s;

const bookingStatusLabel = (s: string) => {
  switch (s) {
    case 'pending':
      return 'Ожидает';
    case 'confirmed':
      return 'Подтверждена';
    case 'cancelled':
      return 'Отменена';
    case 'completed':
      return 'Завершена';
    default:
      return s;
  }
};

export default function UsersTab() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selected, setSelected] = useState<DbUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        if (!cancelled) {
          setUsers(data);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Не удалось загрузить пользователей');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        (u.last_name ?? '').toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'driver' ? !!u.is_driver : !u.is_driver);
      return matchesQuery && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  return (
    <div id="users-tab-container" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#476673]">Пользователи</h2>
        <p className="text-sm text-[#8BA6B1]">Список всех зарегистрированных пользователей из базы</p>
      </div>

      <div className="bg-white p-4 rounded-sm border border-[#D6DCDC] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8BA6B1]" />
          <input
            type="text"
            placeholder="Поиск по имени, фамилии, телефону или email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] rounded-sm border border-[#D6DCDC] text-sm text-[#476673] placeholder-[#8BA6B1] focus:ring-2 focus:ring-[#476673]/30 focus:outline-none"
          />
        </div>

        <div className="flex bg-[#F3F4F6] p-1 rounded-sm border border-[#D6DCDC] text-xs">
          {([
            ['all', 'Все'],
            ['passenger', 'Пассажиры'],
            ['driver', 'Водители'],
          ] as [RoleFilter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setRoleFilter(key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 font-semibold rounded-md transition-all ${
                roleFilter === key
                  ? 'bg-white text-[#476673] shadow-xs'
                  : 'text-[#8BA6B1] hover:text-[#476673]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-sm border border-[#D6DCDC] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-[#8BA6B1] text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Загружаем пользователей...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-rose-700">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#D6DCDC] text-xs font-semibold uppercase tracking-wider text-[#476673]/70">
                    <th className="p-4 pl-6">Пользователь</th>
                    <th className="p-4">Контакты</th>
                    <th className="p-4">Роль</th>
                    <th className="p-4 text-center">Поездок</th>
                    <th className="p-4 text-center">Рейтинг</th>
                    <th className="p-4">Регистрация</th>
                    <th className="p-4 pr-6 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-[#8BA6B1]">
                        Нет пользователей по заданным критериям.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-sm bg-[#BFCFC2] text-[#476673] flex items-center justify-center text-sm font-bold shrink-0">
                              {initials(u.name, u.last_name)}
                            </div>
                            <div>
                              <p
                                onClick={() => setSelected(u)}
                                className="font-bold text-[#476673] hover:underline cursor-pointer"
                              >
                                {fullName(u)}
                              </p>
                              <p className="text-[10px] text-[#8BA6B1] font-mono">{u.id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs text-[#476673] space-y-0.5">
                            <p className="font-mono">{u.phone}</p>
                            <p className="text-[#8BA6B1] truncate max-w-[200px]">{u.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              u.is_driver
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-[#D6DCDC] text-[#476673]'
                            }`}
                          >
                            {u.is_driver ? 'Водитель' : 'Пассажир'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-xs text-[#476673]">
                          {u.trips_count ?? 0}
                        </td>
                        <td className="p-4 text-center text-xs text-[#476673]">
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {(u.rating ?? 0).toFixed(1)}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-[#476673] font-mono">
                          {formatDate(u.created_at)}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            title="Открыть профиль"
                            onClick={() => setSelected(u)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 transition-colors inline-block"
                          >
                            <Eye className="w-4 h-4" />
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

      {selected && <UserDetailDrawer user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function UserDetailDrawer({ user, onClose }: { user: DbUser; onClose: () => void }) {
  const [tab, setTab] = useState<'driver' | 'passenger'>(user.is_driver ? 'driver' : 'passenger');
  const [drivenRides, setDrivenRides] = useState<DbRideSummary[] | null>(null);
  const [bookings, setBookings] = useState<DbBooking[] | null>(null);
  const [loadingDriver, setLoadingDriver] = useState(false);
  const [loadingPassenger, setLoadingPassenger] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setHistoryError(null);
        setLoadingDriver(true);
        setLoadingPassenger(true);
        const [d, b] = await Promise.all([
          fetchUserDrivenRides(user.id),
          fetchUserBookings(user.id),
        ]);
        if (!cancelled) {
          setDrivenRides(d);
          setBookings(b);
        }
      } catch (e: any) {
        if (!cancelled) setHistoryError(e?.message ?? 'Не удалось загрузить историю');
      } finally {
        if (!cancelled) {
          setLoadingDriver(false);
          setLoadingPassenger(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-lg bg-white border-l border-[#D6DCDC] shadow-2xl z-50 overflow-y-auto flex flex-col">
      <div className="p-6 border-b border-[#D6DCDC] flex items-center justify-between bg-gray-50 sticky top-0 z-10">
        <h3 className="text-base font-bold text-[#476673]">Профиль пользователя</h3>
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
            {initials(user.name, user.last_name)}
          </div>
          <h4 className="text-lg font-bold text-[#476673] mt-3">{fullName(user)}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                user.is_driver ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {user.is_driver ? 'Водитель' : 'Пассажир'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {(user.rating ?? 0).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="bg-[#F3F4F6] p-4 rounded-sm border border-[#D6DCDC] space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#8BA6B1]">Контакты</h5>
          <div className="space-y-2 text-xs text-[#476673]">
            <p className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#8BA6B1] shrink-0" />
              <span className="font-mono">{user.phone}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#8BA6B1] shrink-0" />
              <span className="break-all">{user.email}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#8BA6B1] shrink-0" />
              <span>Зарегистрирован: {formatDate(user.created_at)}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Hash className="w-4 h-4 text-[#8BA6B1] shrink-0" />
              <span className="font-mono text-[10px] break-all">{user.id}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F3F4F6] p-4 rounded-sm border border-[#D6DCDC] text-center">
            <span className="text-xs text-[#8BA6B1] font-semibold">Поездок (counter)</span>
            <p className="text-2xl font-bold text-[#476673] mt-1">{user.trips_count ?? 0}</p>
          </div>
          <div className="bg-[#F3F4F6] p-4 rounded-sm border border-[#D6DCDC] text-center">
            <span className="text-xs text-[#8BA6B1] font-semibold">Рейтинг</span>
            <p className="text-2xl font-bold text-[#476673] mt-1">
              {(user.rating ?? 0).toFixed(1)}
            </p>
          </div>
        </div>

        <div>
          <div className="flex bg-[#F3F4F6] p-1 rounded-sm border border-[#D6DCDC] text-xs mb-3">
            <button
              onClick={() => setTab('driver')}
              className={`flex-1 px-3 py-1.5 font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                tab === 'driver'
                  ? 'bg-white text-[#476673] shadow-xs'
                  : 'text-[#8BA6B1] hover:text-[#476673]'
              }`}
            >
              <Car className="w-3.5 h-3.5" /> Как водитель
              {drivenRides && (
                <span className="text-[10px] text-[#8BA6B1]">({drivenRides.length})</span>
              )}
            </button>
            <button
              onClick={() => setTab('passenger')}
              className={`flex-1 px-3 py-1.5 font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                tab === 'passenger'
                  ? 'bg-white text-[#476673] shadow-xs'
                  : 'text-[#8BA6B1] hover:text-[#476673]'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" /> Как пассажир
              {bookings && (
                <span className="text-[10px] text-[#8BA6B1]">({bookings.length})</span>
              )}
            </button>
          </div>

          {historyError && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-sm px-3 py-2 mb-2">
              {historyError}
            </div>
          )}

          {tab === 'driver' ? (
            loadingDriver ? (
              <HistoryLoading />
            ) : !drivenRides || drivenRides.length === 0 ? (
              <HistoryEmpty text="Этот пользователь не публиковал поездок." />
            ) : (
              <div className="space-y-2">
                {drivenRides.map((r: DbRideSummary) => (
                  <Fragment key={r.id}>
                    <RideCard ride={r} />
                  </Fragment>
                ))}
              </div>
            )
          ) : loadingPassenger ? (
            <HistoryLoading />
          ) : !bookings || bookings.length === 0 ? (
            <HistoryEmpty text="Этот пользователь не бронировал поездок." />
          ) : (
            <div className="space-y-2">
              {bookings.map((b: DbBooking) => (
                <Fragment key={b.id}>
                  <BookingCard booking={b} />
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryLoading() {
  return (
    <div className="p-6 flex items-center justify-center text-[#8BA6B1] text-xs gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      Загружаем историю...
    </div>
  );
}

function HistoryEmpty({ text }: { text: string }) {
  return (
    <div className="py-8 text-center text-xs text-[#8BA6B1] border border-dashed border-[#D6DCDC] rounded-sm">
      {text}
    </div>
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
          {rideStatusLabel(ride.status)}
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

function BookingCard({ booking }: { booking: DbBooking }) {
  const r = booking.ride;
  return (
    <div className="p-3 bg-[#F3F4F6] rounded-sm border border-[#D6DCDC]">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-[#476673] font-semibold flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#8BA6B1]" />
          {r ? (
            <>
              {r.from_city?.name ?? `#${r.from_city_id}`} →{' '}
              {r.to_city?.name ?? `#${r.to_city_id}`}
            </>
          ) : (
            'Поездка удалена'
          )}
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            booking.status === 'confirmed' || booking.status === 'completed'
              ? 'bg-emerald-100 text-emerald-800'
              : booking.status === 'cancelled'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {bookingStatusLabel(booking.status)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#8BA6B1]">
        <span>
          {r ? `${formatDate(r.start_date)} · ${r.start_time}` : formatDate(booking.created_at)}
        </span>
        <span className="font-mono text-[#476673] font-semibold">
          {booking.seats_count} мест{r ? ` · ${r.price * booking.seats_count} сом` : ''}
        </span>
      </div>
    </div>
  );
}
