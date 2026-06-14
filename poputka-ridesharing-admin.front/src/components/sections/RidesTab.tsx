import React, { useState, useMemo, useEffect } from 'react';
import { 
 MapPin, 
 Users, 
 Eye,
 XCircle,
 X,
 Loader2
} from 'lucide-react';
import { Ride, RideStatus } from '../../types';
import { fetchRides, cancelRideInDb } from '../../lib/rides';

interface RidesTabProps {
 onLogAction: (action: string, targetType: 'finance' | 'user_state', targetId: string, details: string) => void;
}

export default function RidesTab({
 onLogAction
}: RidesTabProps) {
 const [rides, setRides] = useState<Ride[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [cancellingId, setCancellingId] = useState<string | null>(null);

 const loadRides = async () => {
   try {
     setLoading(true);
     const data = await fetchRides();
     setRides(data);
     setError(null);
   } catch (e: any) {
     setError(e?.message ?? 'Не удалось загрузить поездки');
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   loadRides();
 }, []);

 const [fromFilter, setFromFilter] = useState('all');
 const [toFilter, setToFilter] = useState('all');
 const [statusFilter, setStatusFilter] = useState<RideStatus | 'all'>('all');
 const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

 // Derive unique cities
 const cities = useMemo(() => {
 const list = new Set<string>();
 rides.forEach(r => {
 list.add(r.fromCity);
 list.add(r.toCity);
 });
 return Array.from(list);
 }, [rides]);

 // Filter rides
 const filteredRides = useMemo(() => {
 return rides.filter(r => {
 const matchFrom = fromFilter === 'all' ? true : r.fromCity === fromFilter;
 const matchTo = toFilter === 'all' ? true : r.toCity === toFilter;
 const matchStatus = statusFilter === 'all' ? true : r.status === statusFilter;
 return matchFrom && matchTo && matchStatus;
 });
 }, [rides, fromFilter, toFilter, statusFilter]);

 const handleCancelRide = async (ride: Ride) => {
 if (!confirm(`Вы действительно хотите принудительно ОТМЕНИТЬ рейс №${ride.id} (${ride.fromCity} - ${ride.toCity})? Все забронированные пассажиры получат 100% возврат оплаты.`)) {
   return;
 }
 try {
   setCancellingId(ride.id);
   await cancelRideInDb(ride.id);
   setRides((prev) =>
     prev.map((r) =>
       r.id === ride.id ? { ...r, status: 'Cancelled' as const, passengers: [] } : r,
     ),
   );
   onLogAction(
     'Отмена поездки админом',
     'finance',
     ride.id,
     `Принудительно отменен рейс №${ride.id} от водителя ${ride.driverName}. Запущена автоматическая процедура возврата средств пассажирам.`,
   );
   if (selectedRide?.id === ride.id) {
     setSelectedRide((prev) =>
       prev ? { ...prev, status: 'Cancelled', passengers: [] } : null,
     );
   }
 } catch (e: any) {
   alert(e?.message ?? 'Не удалось отменить поездку');
 } finally {
   setCancellingId(null);
 }
 };

 return (
 <div id="rides-tab-view" className="space-y-6">
 {/* Title */}
 <div>
 <h2 className="text-xl font-bold text-[#476673]">Поездки</h2>
 <p className="text-sm text-[#8BA6B1]">Активные и завершённые рейсы, отмена с возвратом денег</p>
 </div>

 {loading && (
   <div className="flex items-center justify-center gap-2 py-16 text-[#8BA6B1]">
     <Loader2 className="w-5 h-5 animate-spin" />
     <span className="text-sm">Загружаем поездки...</span>
   </div>
 )}

 {!loading && error && (
   <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-sm">
     {error}
   </div>
 )}

 {!loading && !error && (
   <>
 {/* Cities and status filters */}
 <div className="bg-white p-5 rounded-sm border border-[#D6DCDC] shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
 <div>
 <label className="block text-xs font-bold text-[#476673] mb-1.5 uppercase tracking-wider">Откуда (Пункт А)</label>
 <select
 value={fromFilter}
 onChange={(e) => setFromFilter(e.target.value)}
 className="w-full text-xs p-2.5 bg-[#F3F4F6] rounded-sm border border-[#D6DCDC] text-[#476673]"
 >
 <option value="all">Все города</option>
 {cities.map(c => <option key={`from-${c}`} value={c}>{c}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-[#476673] mb-1.5 uppercase tracking-wider">Куда (Пункт Б)</label>
 <select
 value={toFilter}
 onChange={(e) => setToFilter(e.target.value)}
 className="w-full text-xs p-2.5 bg-[#F3F4F6] rounded-sm border border-[#D6DCDC] text-[#476673]"
 >
 <option value="all">Все города</option>
 {cities.map(c => <option key={`to-${c}`} value={c}>{c}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-[#476673] mb-1.5 uppercase tracking-wider">Текущее состояние рейса</label>
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value as RideStatus | 'all')}
 className="w-full text-xs p-2.5 bg-[#F3F4F6] rounded-sm border border-[#D6DCDC] text-[#476673]"
 >
 <option value="all">Любое состояние</option>
 <option value="Active">В пути / Ожидает</option>
 <option value="Completed">Завершена успешно</option>
 <option value="Cancelled">Отменена</option>
 </select>
 </div>
 </div>

 {/* Main rides catalog */}
 <div className="bg-white rounded-sm border border-[#D6DCDC] shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse text-sm">
 <thead>
 <tr className="bg-gray-50 border-b border-[#D6DCDC] text-xs font-semibold uppercase text-[#476673]/80">
 <th className="p-4 pl-6">Маршрут</th>
 <th className="p-4">Водитель</th>
 <th className="p-4">Дата / Время</th>
 <th className="p-4 text-center">Свободные места</th>
 <th className="p-4 text-right">Стоимость</th>
 <th className="p-4">Статус</th>
 <th className="p-4 pr-6 text-right">Действия</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {filteredRides.length === 0 ? (
 <tr>
 <td colSpan={7} className="p-12 text-center text-[#8BA6B1]">
 Нет зарегистрированных межгородских поездок по заданным фильтрам.
 </td>
 </tr>
 ) : (
 filteredRides.map(ride => (
 <tr key={ride.id} className="hover:bg-gray-50/50 transition-colors">
 {/* Route nodes */}
 <td className="p-4 pl-6">
 <div className="flex items-center gap-2">
 <MapPin className="w-4 h-4 text-[#476673] shrink-0" />
 <div>
 <p className="font-bold text-[#476673]">{ride.fromCity} <span className="text-gray-400 font-normal">→</span> {ride.toCity}</p>
 <p className="text-[11px] text-[#8BA6B1]">{ride.carModel}</p>
 </div>
 </div>
 </td>

 {/* Driver */}
 <td className="p-4">
 <div className="flex items-center gap-2">
 <img 
 src={ride.driverAvatar} 
 alt={ride.driverName} 
 className="w-8 h-8 rounded-full object-cover rounded-sm border border-[#D6DCDC]"
 />
 <span className="font-semibold text-[#476673]">{ride.driverName}</span>
 </div>
 </td>

 {/* Date / Time */}
 <td className="p-4 text-xs text-[#476673] font-mono">
 <div className="flex flex-col">
 <span className="font-bold">{ride.date}</span>
 <span className="text-[#8BA6B1]">{ride.time}</span>
 </div>
 </td>

 {/* Occupied / total seats */}
 <td className="p-4 text-center">
 <div className="flex flex-col items-center">
 <span className="font-bold text-xs text-[#476673] font-mono">{ride.occupiedSeats} / {ride.totalSeats}</span>
 {/* Dot indicator matching screenshot */}
 <div className="flex gap-1 mt-1 justify-center">
 {Array.from({ length: ride.totalSeats }).map((_, idx) => (
 <span 
 key={idx} 
 className={`w-2.5 h-2.5 rounded-full border ${
 idx < ride.occupiedSeats 
 ? 'bg-[#476673] border-[#476673]' 
 : 'bg-white border-[#D6DCDC]'
 }`}
 />
 ))}
 </div>
 </div>
 </td>

 {/* Ride price */}
 <td className="p-4 text-right font-mono font-bold text-[#476673]">
 {ride.price} сом
 </td>

 {/* Status */}
 <td className="p-4">
 <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
 ride.status === 'Active' ? 'bg-amber-100 text-amber-800 rounded-sm border border-amber-200' :
 ride.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
 'bg-rose-100 text-rose-800'
 }`}>
 {ride.status === 'Active' ? 'Активна' :
 ride.status === 'Completed' ? 'Завершена' : 'Отменена'}
 </span>
 </td>

 {/* Actions */}
 <td className="p-4 pr-6 text-right space-x-1">
 <button
 onClick={() => setSelectedRide(ride)}
 title="Посмотреть список пассажиров"
 className="p-1.5 text-gray-500 hover:bg-gray-100 transition-colors inline-block"
 >
 <Eye className="w-4.5 h-4.5" />
 </button>

 {ride.status === 'Active' && (
 <button
 onClick={() => handleCancelRide(ride)}
 disabled={cancellingId === ride.id}
 title="Принудительно отменить рейс"
 className="p-1.5 text-rose-600 hover:bg-rose-50 transition-colors inline-block disabled:opacity-40"
 >
 {cancellingId === ride.id ? (
   <Loader2 className="w-4.5 h-4.5 animate-spin" />
 ) : (
   <XCircle className="w-4.5 h-4.5" />
 )}
 </button>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Modal: Selected Journey Details and Passengers list */}
 {selectedRide && (
 <div id="ride-info-modal" className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
 <div className="bg-white rounded-3xl rounded-sm border border-[#D6DCDC] shadow-2xl w-full max-w-xl overflow-hidden">
 {/* Header */}
 <div className="bg-[#476673] text-white p-6 flex justify-between items-center">
 <div>
 <span className="text-[10px] font-bold tracking-widest uppercase text-[#BFCFC2]">Детали межгородского рейса #{selectedRide.id}</span>
 <h4 className="text-base font-bold mt-1">Рейс: {selectedRide.fromCity} в {selectedRide.toCity}</h4>
 </div>
 <button 
 onClick={() => setSelectedRide(null)}
 className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Body */}
 <div className="p-6 space-y-6">
 {/* Route Node detail cards */}
 <div className="flex items-center gap-4 bg-[#F3F4F6] p-4 rounded-sm border border-[#D6DCDC]">
 <img 
 src={selectedRide.driverAvatar} 
 alt={selectedRide.driverName} 
 className="w-12 h-12 rounded-full object-cover rounded-sm border border-[#D6DCDC]"
 />
 <div>
 <p className="text-xs text-[#8BA6B1]">Организатор (Водитель)</p>
 <p className="text-sm font-bold text-[#476673]">{selectedRide.driverName}</p>
 <p className="text-xs font-mono text-gray-500 mt-0.5">Лицензионный автомобиль: {selectedRide.carModel}</p>
 </div>
 <div className="ml-auto text-right">
 <p className="text-xs text-[#8BA6B1]">Стоимость одного места</p>
 <p className="text-base font-extrabold text-[#476673] font-mono">{selectedRide.price} сом</p>
 </div>
 </div>

 {/* Passenger list */}
 <div>
 <h5 className="text-xs font-bold text-[#476673] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
 <Users className="w-4.5 h-4.5 text-[#8BA6B1]" />
 Список забронированных попутчиков ({selectedRide.passengers.length} человек)
 </h5>

 {selectedRide.passengers.length === 0 ? (
 <div className="py-6 text-center text-xs text-[#8BA6B1] border border-dashed border-[#D6DCDC] bg-gray-50">
 На этот рейс пока нет подтвержденных бронирований.
 </div>
 ) : (
 <div className="space-y-2 max-h-48 overflow-y-auto">
 {selectedRide.passengers.map((pas, i) => (
 <div key={pas.id || i} className="p-3 bg-white rounded-sm border border-[#D6DCDC] flex items-center justify-between text-xs hover:bg-gray-50">
 <div>
 <p className="font-bold text-[#476673]">{pas.name}</p>
 <p className="text-[#8BA6B1] mt-0.5 flex items-center gap-1 font-mono">{pas.phone}</p>
 </div>
 <span className="px-2 py-0.5 rounded text-[10px] bg-sky-100 text-sky-800 font-semibold uppercase">Оплачено</span>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Status info/actions */}
 <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-xs text-[#8BA6B1]">
 <span>Дата: {selectedRide.date} • {selectedRide.time}</span>
 {selectedRide.status === 'Active' && (
 <button
 onClick={() => handleCancelRide(selectedRide)}
 className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-sm border border-rose-200"
 >
 Форс-мажор: Снять рейс
 </button>
 )}
 </div>
 </div>

 <div className="bg-gray-100 p-4 flex justify-end">
 <button
 onClick={() => setSelectedRide(null)}
 className="px-4 py-2 bg-[#476673] text-white text-xs font-bold "
 >
 Закрыть
 </button>
 </div>
 </div>
 </div>
 )}
 </>
 )}
 </div>
 );
}
