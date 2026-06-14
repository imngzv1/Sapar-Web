import React, { useState, useMemo, useEffect } from 'react';
import { 
 ShieldAlert, 
 XOctagon, 
 Search, 
 Lock,
 Unlock,
 CornerDownRight,
 Loader2
} from 'lucide-react';
import { Complaint, User, ComplaintStatus } from '../../types';
import { fetchComplaints } from '../../lib/complaints';

interface ModerationTabProps {
 users: User[];
 onUnblockUser: (userId: string) => void;
 onLogAction: (action: string, targetType: 'complaint' | 'user_state', targetId: string, details: string) => void;
}

export default function ModerationTab({
 users,
 onUnblockUser,
 onLogAction
}: ModerationTabProps) {
 const [complaints, setComplaints] = useState<Complaint[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

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

 const [complaintFilter, setComplaintFilter] = useState<ComplaintStatus | 'All'>('Pending');
 const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
 const [decisionText, setDecisionText] = useState('');
 const [decisionError, setDecisionError] = useState('');

 // Blacklist query
 const [blacklistSearch, setBlacklistSearch] = useState('');

 // Extract blocked users for the Blacklist board
 const blacklistedUsers = useMemo(() => {
 return users.filter(usr => usr.status === 'blocked' && (
 usr.name.toLowerCase().includes(blacklistSearch.toLowerCase()) ||
 usr.phone.includes(blacklistSearch)
 ));
 }, [users, blacklistSearch]);

 const filteredComplaints = useMemo(() => {
 if (complaintFilter === 'All') return complaints;
 return complaints.filter(c => c.status === complaintFilter);
 }, [complaints, complaintFilter]);

 const submitResolve = (e: React.FormEvent, type: 'resolve' | 'dismiss') => {
 e.preventDefault();
 if (!decisionText.trim()) {
 setDecisionError('Пожалуйста, обязательно введите резолюцию/решение модератора.');
 return;
 }
 if (selectedComplaint) {
   const complaintId = selectedComplaint.id;
   const newStatus = type === 'resolve' ? 'Resolved' as const : 'Dismissed' as const;
   setComplaints((prev) =>
     prev.map((c) =>
       c.id === complaintId ? { ...c, status: newStatus, decision: decisionText } : c,
     ),
   );
   if (type === 'resolve') {
     onLogAction(
       'Вынесено предупреждение / Блок',
       'complaint',
       complaintId,
       `Жалоба №${complaintId} разрешена. Вердикт: ${decisionText}`,
     );
   } else {
     onLogAction(
       'Отклонение жалобы',
       'complaint',
       complaintId,
       `Жалоба №${complaintId} отклонена. Причина: ${decisionText}`,
     );
   }
   setSelectedComplaint(null);
   setDecisionText('');
   setDecisionError('');
 }
 };

 const handleUnban = (usr: User) => {
 if (confirm(`Вы действительно хотите разблокировать и восстановить доступ для ${usr.name}?`)) {
 onUnblockUser(usr.id);
 onLogAction(
 'Досрочный unban из ЧС',
 'user_state',
 usr.id,
 `Пользователь ${usr.name} амнистирован из Чёрного Списка модератором.`
 );
 }
 };

 return (
 <div id="moderation-tab-view" className="space-y-8">
 {/* Title */}
 <div>
 <h2 className="text-xl font-bold text-[#476673]">Жалобы и модерация</h2>
 <p className="text-sm text-[#8BA6B1]">Жалобы пассажиров и водителей, чёрный список</p>
 <p className="text-xs text-[#8BA6B1] mt-1">Отзывы на водителей с оценкой ниже 4 — показывается комментарий пассажира</p>
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
 
 {/* Left Side: Active Complaints */}
 <div className="bg-white p-5 rounded-sm border border-[#D6DCDC] shadow-sm space-y-4">
 <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-wrap gap-2">
 <div>
 <h3 className="text-base font-bold text-[#476673] flex items-center gap-1.5">
 <ShieldAlert className="w-5 h-5 text-rose-500" />
 Поступившие жалобы пользователей
 </h3>
 <p className="text-xs text-[#8BA6B1]">Рассмотрите аргументы и вынесите справедливое решение</p>
 </div>

 {/* Complaint Pill Filter */}
 <div className="flex bg-[#F3F4F6] p-1 rounded-sm border border-[#D6DCDC] text-[11px]">
 <button 
 onClick={() => setComplaintFilter('Pending')}
 className={`px-2.5 py-1 font-bold rounded ${complaintFilter === 'Pending' ? 'bg-[#476673] text-white shadow-xs' : 'text-[#8BA6B1] hover:text-[#476673]'}`}
 >
 Новые
 </button>
 <button 
 onClick={() => setComplaintFilter('Resolved')}
 className={`px-2.5 py-1 font-bold rounded ${complaintFilter === 'Resolved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-[#8BA6B1] hover:text-[#476673]'}`}
 >
 Решенные
 </button>
 <button 
 onClick={() => setComplaintFilter('Dismissed')}
 className={`px-2.5 py-1 font-bold rounded ${complaintFilter === 'Dismissed' ? 'bg-gray-400 text-white shadow-xs' : 'text-[#8BA6B1] hover:text-[#476673]'}`}
 >
 Отклоненные
 </button>
 </div>
 </div>

 {/* Complaints stream */}
 <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
 {filteredComplaints.length === 0 ? (
 <div className="py-12 text-center text-xs text-[#8BA6B1] italic">
 Отсутствуют жалобы в данной группе фильтрации.
 </div>
 ) : (
 filteredComplaints.map(comp => (
 <div 
 key={comp.id}
 onClick={() => {
 setSelectedComplaint(comp);
 setDecisionText('');
 setDecisionError('');
 }}
 className={`p-4 border transition-all cursor-pointer ${
 comp.status === 'Pending' 
 ? 'bg-rose-50/30 border-rose-200 hover:border-rose-400' 
 : 'bg-gray-50/50 border-[#D6DCDC] hover:border-[#8BA6B1]'
 }`}
 >
 <div className="flex justify-between items-start text-xs">
 <div>
 <span className="font-bold text-[#476673] bg-[#D6DCDC]/50 px-2 py-0.5 rounded font-mono">Жалоба №{comp.id}</span>
 <span className="ml-1.5 text-[10px] text-gray-500">{comp.date}</span>
 </div>
 <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
 comp.status === 'Pending' ? 'bg-rose-100 text-rose-800' :
 comp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
 'bg-gray-200 text-gray-700'
 }`}>
 {comp.status === 'Pending' ? 'Новая' :
 comp.status === 'Resolved' ? 'Решено' : 'Отклонено'}
 </span>
 </div>

 <p className="text-xs text-[#476673] font-medium leading-relaxed my-2.5 italic">
 «{comp.text}»
 </p>

 <div className="text-xs space-y-1 text-gray-600 border-t border-dashed border-gray-100 pt-2 flex items-center justify-between flex-wrap">
 <div>
 <span className="text-gray-400">Отправитель:</span> <span className="font-bold text-[#476673]">{comp.reporterName}</span>
 </div>
 <div>
 <span className="text-gray-400">Нарушитель:</span> <span className="font-extrabold text-[#476673] underline">{comp.reportedName} ({comp.reportedRole === 'driver' ? 'Водитель' : 'Пассажир'})</span>
 </div>
 </div>

 {comp.decision && (
 <div className="mt-3 p-2 bg-white rounded rounded-sm border border-gray-100 text-[11px] text-[#476673] flex items-start gap-1 font-mono">
 <CornerDownRight className="w-3.5 h-3.5 text-[#8BA6B1] shrink-0" />
 <div>
 <span className="font-bold">Решение админа:</span> {comp.decision}
 </div>
 </div>
 )}
 </div>
 ))
 )}
 </div>
 </div>

 {/* Right Side: Blacklist Board */}
 <div id="blacklist-board" className="bg-white p-5 rounded-sm border border-rose-200 shadow-sm space-y-4">
 <div className="border-b border-rose-100 pb-3">
 <h3 className="text-base font-bold text-rose-950 flex items-center gap-1.5">
 <Lock className="w-5 h-5 text-rose-600" />
 Чёрный список
 </h3>
 <p className="text-xs text-rose-700/80">Ограниченные пользователи мобильного приложения и причины мер пресечения</p>
 </div>

 {/* Local search in ban-list */}
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
 {blacklistedUsers.length === 0 ? (
 <div className="py-12 text-center text-xs text-rose-400/80 italic border border-dashed border-rose-100 bg-rose-50/10">
 Черный список пуст! Нарушителей не зафиксировано.
 </div>
 ) : (
 blacklistedUsers.map(usr => (
 <div key={usr.id} className="p-4 bg-rose-50/20 border border-rose-150 flex flex-col justify-between hover:bg-rose-50/40 transition-colors">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <img 
 src={usr.avatar} 
 alt={usr.name} 
 className="w-8 h-8 rounded-full object-cover rounded-sm border border-rose-200 shadow-xs"
 />
 <div>
 <span className="text-xs font-bold text-rose-950">{usr.name}</span>
 <p className="text-[10px] text-rose-700 font-mono">{usr.phone}</p>
 </div>
 </div>

 <button
 onClick={() => handleUnban(usr)}
 className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 hover:border-emerald-400 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
 >
 <Unlock className="w-3 h-3 text-emerald-600" />
 Амнистировать
 </button>
 </div>

 <div className="mt-3 p-2.5 bg-white border border-rose-100 text-[11px] text-rose-950 font-mono leading-relaxed">
 <span className="font-bold text-rose-850">Причина нарушения:</span> {usr.blockReason || 'Несанкционированные действия'}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 )}

 {/* Selected complaint detail ruling dialog */}
 {selectedComplaint && (
 <div id="complaint- ruling-modal" className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
 <div className="bg-white border border-rose-100 shadow-2xl w-full max-w-lg overflow-hidden">
 <div className="p-5 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
 <div>
 <span className="text-[10px] font-bold tracking-widest text-[#476673]/60 uppercase font-mono">Разбор инцидента №{selectedComplaint.id}</span>
 <h4 className="text-sm font-bold text-rose-950 mt-1">Жалоба от {selectedComplaint.reporterName}</h4>
 </div>
 <button 
 onClick={() => setSelectedComplaint(null)}
 className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
 >
 <XOctagon className="w-5 h-5 text-[#8BA6B1]" />
 </button>
 </div>

 <form onSubmit={(e) => submitResolve(e, 'resolve')}>
 <div className="p-5 space-y-4">
 <div className="bg-[#F3F4F6] p-4 rounded-sm border border-[#D6DCDC] text-xs">
 <p className="text-gray-400 font-semibold uppercase">Суть заявления:</p>
 <p className="text-[#476673] italic font-medium leading-relaxed mt-1.5">«{selectedComplaint.text}»</p>
 </div>

 <div className="grid grid-cols-2 gap-3 text-xs border-y border-gray-100 py-3">
 <div>
 <span className="text-[#8BA6B1]">Истец (Кто жалуется):</span>
 <p className="font-bold text-[#476673]">{selectedComplaint.reporterName}</p>
 </div>
 <div>
 <span className="text-rose-600 font-semibold">Ответчик (Обвиняемый):</span>
 <p className="font-bold text-rose-950 underline">{selectedComplaint.reportedName}</p>
 </div>
 </div>

 {selectedComplaint.status === 'Pending' ? (
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-[#476673]">Вердикт / Резолюция модератора*</label>
 <textarea
 rows={3}
 value={decisionText}
 onChange={(e) => {
 setDecisionText(e.target.value);
 if (e.target.value.trim()) setDecisionError('');
 }}
 placeholder="Например: Жалоба удовлетворена. С водителем проведена разъяснительная беседа о необходимости соблюдения скоростных ограничений в тоннелях."
 className="w-full text-xs p-3 rounded-sm border border-[#D6DCDC] focus:outline-none focus:ring-2 focus:ring-[#476673]/20"
 ></textarea>
 {decisionError && (
 <p className="text-xs text-rose-600 font-semibold">{decisionError}</p>
 )}
 </div>
 ) : (
 <div className="p-3 bg-emerald-50 rounded-sm border border-emerald-100 text-xs text-emerald-800 font-mono">
 <span className="font-bold">Вынесено решение:</span> {selectedComplaint.decision}
 </div>
 )}
 </div>

 {selectedComplaint.status === 'Pending' && (
 <div className="bg-gray-50 p-4 border-t border-[#D6DCDC] flex justify-between items-center">
 <button
 type="button"
 onClick={(e) => {
 if (!decisionText.trim()) {
 setDecisionError('Сначала напишите обоснование отклонения.');
 return;
 }
 submitResolve(e, 'dismiss');
 }}
 className="px-4 py-2 rounded-sm border border-[#D6DCDC] text-xs font-bold text-[#476673] hover:bg-gray-100 bg-white cursor-pointer"
 >
 Отклонить жалобу
 </button>
 <div className="flex gap-2">
 <button
 type="button"
 onClick={() => setSelectedComplaint(null)}
 className="px-4 py-2 text-xs font-bold text-[#8BA6B1] hover:text-[#476673]"
 >
 Закрыть
 </button>
 <button
 type="submit"
 className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs"
 >
 Удовлетворить и решить
 </button>
 </div>
 </div>
 )}

 {selectedComplaint.status !== 'Pending' && (
 <div className="bg-gray-50 p-4 border-t border-[#D6DCDC] flex justify-end">
 <button
 type="button"
 onClick={() => setSelectedComplaint(null)}
 className="px-4 py-2 bg-[#476673] text-white text-xs font-bold "
 >
 Закрыть окно просмотра
 </button>
 </div>
 )}
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
