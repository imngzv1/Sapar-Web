import React, { useState, useMemo } from 'react';
import { 
 Clock, 
 Search, 
 ShieldCheck, 
 Filter, 
 FolderOpen, 
 Activity,
 Calendar
} from 'lucide-react';
import { AdminLog } from '../../types';

interface LogsTabProps {
 logs: AdminLog[];
}

export default function LogsTab({ logs }: LogsTabProps) {
 const [search, setSearch] = useState('');
 const [categoryFilter, setCategoryFilter] = useState<'All' | 'verification' | 'user_state' | 'complaint' | 'city' | 'faq' | 'finance'>('All');

 // Reverse sort logs to show newest action first
 const sortedLogs = useMemo(() => {
 return [...logs].sort((a,b) => b.date.localeCompare(a.date));
 }, [logs]);

 // Filter logs
 const filteredLogs = useMemo(() => {
 return sortedLogs.filter(log => {
 const matchSearch = 
 log.adminName.toLowerCase().includes(search.toLowerCase()) ||
 log.details.toLowerCase().includes(search.toLowerCase()) ||
 log.action.toLowerCase().includes(search.toLowerCase());
 
 const matchCategory = categoryFilter === 'All' ? true : log.targetType === categoryFilter;

 return matchSearch && matchCategory;
 });
 }, [sortedLogs, search, categoryFilter]);

 return (
 <div id="logs-tab-view" className="space-y-6">
 {/* Title */}
 <div>
 <h2 className="text-xl font-bold text-[#476673]">Журнал действий</h2>
 <p className="text-sm text-[#8BA6B1]">Что и когда делали администраторы. Хранится 30 дней.</p>
 </div>

 {/* Local filters in logs */}
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

 {/* Action Category selects */}
 <div className="flex bg-[#F3F4F6] p-1 rounded-sm border border-[#D6DCDC] text-xs">
 <button
 onClick={() => setCategoryFilter('All')}
 className={`px-3 py-1.5 font-bold rounded-md transition-all ${categoryFilter === 'All' ? 'bg-white text-[#476673] shadow-xs' : 'text-[#8BA6B1]'}`}
 >
 Все
 </button>
 <button
 onClick={() => setCategoryFilter('verification')}
 className={`px-3 py-1.5 font-bold rounded-md transition-all ${categoryFilter === 'verification' ? 'bg-white text-[#476673] shadow-xs' : 'text-[#8BA6B1]'}`}
 >
 Верификации
 </button>
 <button
 onClick={() => setCategoryFilter('user_state')}
 className={`px-3 py-1.5 font-bold rounded-md transition-all ${categoryFilter === 'user_state' ? 'bg-white text-rose-700 shadow-xs' : 'text-[#8BA6B1]'}`}
 >
 Блокировки
 </button>
 <button
 onClick={() => setCategoryFilter('finance')}
 className={`px-3 py-1.5 font-bold rounded-md transition-all ${categoryFilter === 'finance' ? 'bg-white text-[#476673] shadow-xs' : 'text-[#8BA6B1]'}`}
 >
 Финансы
 </button>
 </div>
 </div>

 {/* Security Audit Feed list */}
 <div className="bg-white rounded-sm border border-[#D6DCDC] shadow-sm divide-y divide-gray-100 overflow-hidden">
 {filteredLogs.length === 0 ? (
 <div className="p-12 text-center text-xs text-[#8BA6B1]">
 По выбранным фильтрам записей нет.
 </div>
 ) : (
 filteredLogs.map(log => (
 <div key={log.id} className="p-4 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-sans">
 
 <div className="flex items-start gap-3">
 <div className="p-2 bg-slate-100 text-[#476673] rounded-sm border border-[#D6DCDC] shrink-0 mt-0.5">
 <Activity className="w-4 h-4" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <span className="font-bold text-[#476673]">{log.adminName}</span>
 <span className="text-gray-400">•</span>
 <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
 log.targetType === 'verification' ? 'bg-indigo-50 text-indigo-800' :
 log.targetType === 'user_state' ? 'bg-rose-50 text-rose-800' :
 log.targetType === 'complaint' ? 'bg-amber-50 text-amber-800' :
 log.targetType === 'city' ? 'bg-purple-50 text-purple-800' :
 log.targetType === 'finance' ? 'bg-teal-50 text-teal-800 font-bold' :
 'bg-gray-50 text-gray-800'
 }`}>
 {log.action}
 </span>
 </div>
 
 <p className="text-gray-600 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-sm border border-slate-100/50 ">
 {log.details}
 </p>
 </div>
 </div>

 {/* Timestamp column */}
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
