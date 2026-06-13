import React, { useState, useMemo } from 'react';
import { 
 DollarSign, 
 ArrowUpRight, 
 ArrowDownRight, 
 Clock, 
 CheckCircle, 
 XCircle, 
 CreditCard,
 Percent,
 TrendingUp,
 RotateCcw
} from 'lucide-react';
import { Transaction, Payout, Refund } from '../../types';

interface FinancesTabProps {
 transactions: Transaction[];
 payouts: Payout[];
 refunds: Refund[];
 onApprovePayout: (payoutId: string) => void;
 onLogAction: (action: string, targetType: 'finance', targetId: string, details: string) => void;
}

export default function FinancesTab({
 transactions,
 payouts,
 refunds,
 onApprovePayout,
 onLogAction
}: FinancesTabProps) {
 const [activeSubTab, setActiveSubTab] = useState<'tx' | 'pay' | 'ref'>('tx');

 // Calculations
 const grossVolume = useMemo(() => {
 return transactions
 .filter(t => t.status === 'Completed' && t.type === 'Payment')
 .reduce((sum, t) => sum + t.amount, 0);
 }, [transactions]);

 const serviceCommission = useMemo(() => {
 return transactions
 .filter(t => t.status === 'Completed')
 .reduce((sum, t) => sum + t.commission, 0);
 }, [transactions]);

 const pendingPayoutsSum = useMemo(() => {
 return payouts
 .filter(p => p.status === 'Pending')
 .reduce((sum, p) => sum + p.amount, 0);
 }, [payouts]);

 const handleApprovePayout = (pay: Payout) => {
 if (confirm(`Выдать разрешение на выплату средств в размере ${pay.amount.toLocaleString('ru')} сом на карту ${pay.bankCard} водителя ${pay.driverName}?`)) {
 onApprovePayout(pay.id);
 onLogAction(
 'Одобрение выплаты',
 'finance',
 pay.id,
 `Проведена выплата водителю ${pay.driverName} в размере ${pay.amount} сом (Реквизиты: ${pay.bankCard}).`
 );
 }
 };

 return (
 <div id="finances-tab-view" className="space-y-6">
 {/* Title */}
 <div>
 <h2 className="text-xl font-bold text-[#476673]">Финансы</h2>
 <p className="text-sm text-[#8BA6B1]">Транзакции, выплаты водителям и возвраты пассажирам</p>
 </div>

 {/* Карточки со счётчиками */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

 <div className="bg-white px-4 py-3 rounded-sm border border-[#D6DCDC] flex items-center justify-between gap-3">
 <div className="min-w-0">
 <p className="text-[11px] font-semibold text-[#8BA6B1] uppercase truncate">Оборот броней</p>
 <p className="text-xl font-bold text-[#476673] mt-0.5">{grossVolume.toLocaleString('ru')} сом</p>
 <span className="text-[10px] text-emerald-700 font-medium inline-flex items-center gap-1 mt-1">
 <TrendingUp className="w-3 h-3" /> +12% за неделю
 </span>
 </div>
 <div className="p-2 rounded-sm bg-[#F3F4F6] text-[#476673] shrink-0">
 <DollarSign className="w-4 h-4" />
 </div>
 </div>

 <div className="bg-white px-4 py-3 rounded-sm border border-teal-200 flex items-center justify-between gap-3">
 <div className="min-w-0">
 <p className="text-[11px] font-semibold text-[#8BA6B1] uppercase truncate">Комиссия сервиса · 10%</p>
 <p className="text-xl font-bold text-[#476673] mt-0.5">{serviceCommission.toLocaleString('ru')} сом</p>
 <span className="text-[10px] text-teal-700 mt-1 block">Растёт с каждой поездкой</span>
 </div>
 <div className="p-2 rounded-sm bg-teal-50 text-teal-700 shrink-0 border border-teal-100">
 <Percent className="w-4 h-4" />
 </div>
 </div>

 <div className="bg-white px-4 py-3 rounded-sm border border-[#D6DCDC] flex items-center justify-between gap-3">
 <div className="min-w-0">
 <p className="text-[11px] font-semibold text-[#8BA6B1] uppercase truncate">К выплате водителям</p>
 <p className="text-xl font-bold text-amber-600 mt-0.5">{pendingPayoutsSum.toLocaleString('ru')} сом</p>
 <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200 inline-block mt-1">
 Ждут подтверждения
 </span>
 </div>
 <div className="p-2 rounded-sm bg-[#F3F4F6] text-amber-600 shrink-0">
 <Clock className="w-4 h-4" />
 </div>
 </div>

 </div>

 {/* Sub tabs selectors */}
 <div className="flex border-b border-[#D6DCDC] gap-6 text-sm">
 <button
 onClick={() => setActiveSubTab('tx')}
 className={`pb-2.5 font-bold transition-all relative ${
 activeSubTab === 'tx' ? 'text-[#476673]' : 'text-[#8BA6B1] hover:text-[#476673]'
 }`}
 >
 История транзакций ({transactions.length})
 {activeSubTab === 'tx' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#476673]" />}
 </button>
 <button
 onClick={() => setActiveSubTab('pay')}
 className={`pb-2.5 font-bold transition-all relative ${
 activeSubTab === 'pay' ? 'text-[#476673]' : 'text-[#8BA6B1] hover:text-[#476673]'
 }`}
 >
 Запросы на выплату водителям ({payouts.filter(p => p.status === 'Pending').length} новые)
 {activeSubTab === 'pay' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#476673]" />}
 </button>
 <button
 onClick={() => setActiveSubTab('ref')}
 className={`pb-2.5 font-bold transition-all relative ${
 activeSubTab === 'ref' ? 'text-[#476673]' : 'text-[#8BA6B1] hover:text-[#476673]'
 }`}
 >
 Возвраты пассажирам ({refunds.length})
 {activeSubTab === 'ref' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#476673]" />}
 </button>
 </div>

 {/* Tab Panels */}
 <div className="bg-white rounded-sm border border-[#D6DCDC] shadow-sm overflow-hidden">
 
 {/* Panel 1: Transactions list */}
 {activeSubTab === 'tx' && (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm border-collapse">
 <thead>
 <tr className="bg-gray-50 border-b border-[#D6DCDC] text-xs font-semibold uppercase text-[#476673]/80">
 <th className="p-4 pl-6">ID транзакции</th>
 <th className="p-4">Отправитель</th>
 <th className="p-4">Получатель</th>
 <th className="p-4">Тип платежа</th>
 <th className="p-4 font-mono">Дата</th>
 <th className="p-4">Комиссия (10%)</th>
 <th className="p-4 text-right">Сумма</th>
 <th className="p-4 pr-6">Статус</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {transactions.map(tx => (
 <tr key={tx.id} className="hover:bg-gray-50/50">
 <td className="p-4 pl-6 font-mono text-xs font-semibold text-[#8BA6B1]">
 {tx.id}
 </td>
 <td className="p-4 text-xs font-semibold text-gray-700">{tx.sender}</td>
 <td className="p-4 text-xs font-semibold text-gray-700">{tx.recipient}</td>
 <td className="p-4">
 <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
 tx.type === 'Payment' ? 'bg-sky-50 text-sky-800 border border-sky-100' :
 tx.type === 'Payout' ? 'bg-teal-50 text-teal-800' :
 'bg-amber-100 text-amber-800'
 }`}>
 {tx.type === 'Payment' ? 'Оплата брони' :
 tx.type === 'Payout' ? 'Выплата' : 'Возврат пассажиру'}
 </span>
 </td>
 <td className="p-4 text-xs text-gray-500 font-mono">{tx.date}</td>
 <td className="p-4 font-mono font-bold text-teal-700 text-xs text-center md:text-left">
 +{tx.commission} сом
 </td>
 <td className="p-4 text-right font-mono font-bold text-[#476673] text-xs">
 {tx.amount.toLocaleString('ru')} сом
 </td>
 <td className="p-4 pr-6">
 <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
 tx.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
 tx.status === 'Refunded' ? 'bg-amber-100 text-amber-800' :
 'bg-gray-200 text-gray-700'
 }`}>
 {tx.status === 'Completed' ? 'Успешно' :
 tx.status === 'Refunded' ? 'Возвращено' : 'Ожидает'}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Panel 2: Payouts for drivers queue */}
 {activeSubTab === 'pay' && (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm border-collapse">
 <thead>
 <tr className="bg-gray-50 border-b border-[#D6DCDC] text-xs font-semibold uppercase text-[#476673]/80">
 <th className="p-4 pl-6">ID выплаты</th>
 <th className="p-4">Водитель</th>
 <th className="p-4">Карта банка КР</th>
 <th className="p-4">Сумма вывода</th>
 <th className="p-4 font-mono">Дата запроса</th>
 <th className="p-4">Статус</th>
 <th className="p-4 pr-6 text-right">Управление действием</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {payouts.map(pay => (
 <tr key={pay.id} className="hover:bg-gray-50/50">
 <td className="p-4 pl-6 font-mono font-bold text-xs text-[#8BA6B1]">{pay.id}</td>
 <td className="p-4 font-semibold text-[#476673]">{pay.driverName}</td>
 <td className="p-4 font-mono text-xs text-[#8BA6B1] flex items-center gap-1.5">
 <CreditCard className="w-4 h-4 text-gray-400" />
 {pay.bankCard}
 </td>
 <td className="p-4 font-mono font-bold text-emerald-700">{pay.amount.toLocaleString('ru')} сом</td>
 <td className="p-4 text-xs font-mono text-[#476673]">{pay.date}</td>
 <td className="p-4">
 <span className={`px-2 py-0.5 text-xs font-bold rounded ${
 pay.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
 pay.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
 }`}>
 {pay.status === 'Completed' ? 'Выплачено' :
 pay.status === 'Pending' ? 'Ожидает модератора' : 'Фейл'}
 </span>
 </td>
 <td className="p-4 pr-6 text-right">
 {pay.status === 'Pending' ? (
 <button
 onClick={() => handleApprovePayout(pay)}
 className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
 >
 Одобрить перевод
 </button>
 ) : (
 <span className="text-xs text-gray-400 font-semibold flex items-center justify-end gap-1">
 <CheckCircle className="w-4 h-4 text-emerald-500" /> Готово
 </span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Panel 3: Passenger Refunds logs */}
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
 <th className="p-4 pr-6">Статус</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {refunds.map(ref => (
 <tr key={ref.id} className="hover:bg-gray-50/50">
 <td className="p-4 pl-6 font-mono text-xs font-bold text-[#8BA6B1]">{ref.id}</td>
 <td className="p-4 font-bold text-xs text-[#476673]">Рейс №{ref.rideId}</td>
 <td className="p-4 font-semibold text-xs text-gray-700">{ref.passengerName}</td>
 <td className="p-4 font-mono font-bold text-[#476673]">{ref.amount} сом</td>
 <td className="p-4 text-xs font-medium text-slate-700 max-w-xs truncate" title={ref.reason}>
 {ref.reason}
 </td>
 <td className="p-4 text-xs font-mono text-[#8BA6B1]">{ref.date}</td>
 <td className="p-4 pr-6">
 <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded rounded-sm border border-amber-200">
 Бэкап-Completed
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 </div>
 </div>
 );
}
