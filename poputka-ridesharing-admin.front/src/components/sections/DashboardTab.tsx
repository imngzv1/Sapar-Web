import React, { useEffect, useState } from 'react';
import {
  Users,
  Car,
  FileClock,
  Map,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Compass,
  DollarSign,
  Loader2
} from 'lucide-react';
import { User, Driver, VerificationRequest, Ride } from '../../types';
import { fetchDashboardStats, DashboardStats } from '../../lib/dashboard';

interface DashboardTabProps {
  users: User[];
  drivers: Driver[];
  verificationRequests: VerificationRequest[];
  rides: Ride[];
  setActiveTab: (tab: string) => void;
}

export default function DashboardTab({
  users,
  drivers,
  verificationRequests,
  rides,
  setActiveTab
}: DashboardTabProps) {
  const [chartDays, setChartDays] = useState<'7' | '30'>('7');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatsLoading(true);
        const data = await fetchDashboardStats();
        if (!cancelled) {
          setStats(data);
          setStatsError(null);
        }
      } catch (e: any) {
        if (!cancelled) setStatsError(e?.message ?? 'Не удалось загрузить статистику');
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalUsers = stats?.totalUsers ?? 0;
  const totalDrivers = stats?.totalDrivers ?? 0;
  const pendingVerifications = stats?.pendingVerifications ?? 0;
  const activeRides = stats?.activeRides ?? 0;

  // Render SVG Charts based on last 7 or 30 days
  // Modeled mock metric datasets
  const data7Days = [
    { day: '24.05', users: 12, rides: 24 },
    { day: '25.05', users: 19, rides: 32 },
    { day: '26.05', users: 15, rides: 28 },
    { day: '27.05', users: 24, rides: 42 },
    { day: '28.05', users: 32, rides: 51 },
    { day: '29.05', users: 28, rides: 49 },
    { day: '30.05', users: 45, rides: 68 }
  ];

  const data30Days = [
    { day: '01.05', users: 45, rides: 98 },
    { day: '05.05', users: 62, rides: 120 },
    { day: '10.05', users: 50, rides: 110 },
    { day: '15.05', users: 78, rides: 145 },
    { day: '20.05', users: 95, rides: 180 },
    { day: '25.05', users: 112, rides: 210 },
    { day: '30.05', users: 145, rides: 282 }
  ];

  const activeDataset = chartDays === '7' ? data7Days : data30Days;
  const maxVal = Math.max(...activeDataset.map(d => Math.max(d.users, d.rides))) * 1.15;

  const width = 600;
  const height = 240;
  const padding = 40;

  // Convert dataset index to SVG x/y coordinates
  const getX = (index: number) => {
    return padding + (index * (width - padding * 2)) / (activeDataset.length - 1);
  };

  const getY = (value: number) => {
    return height - padding - (value * (height - padding * 2)) / maxVal;
  };

  // Generate path lines
  const userPointsStr = activeDataset.map((item, i) => `${getX(i)},${getY(item.users)}`).join(' ');
  const ridePointsStr = activeDataset.map((item, i) => `${getX(i)},${getY(item.rides)}`).join(' ');

  // Top directions
  const directionStats = [
    { from: 'Бишкек', to: 'Ош', count: 184, active: 14, color: '#476673' },
    { from: 'Бишкек', to: 'Каракол', count: 96, active: 8, color: '#8BA6B1' },
    { from: 'Ош', to: 'Джалал-Абад', count: 72, active: 5, color: '#BFCFC2' },
    { from: 'Бишкек', to: 'Нарын', count: 34, active: 2, color: '#D6DCDC' }
  ];

  return (
    <div id="dashboard-tab-view" className="space-y-5">
      {/* Заголовок */}
      <div id="dashboard-welcome-banner" className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#476673]">Сводка</h2>
          <p className="text-sm text-[#8BA6B1]">Ключевые показатели по сервису</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-sm border border-[#D6DCDC] text-[#476673]">
          {statsLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-[#8BA6B1] animate-spin" />
              <span>Загружаем данные...</span>
            </>
          ) : statsError ? (
            <span className="text-rose-700">{statsError}</span>
          ) : (
            <>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Данные из базы</span>
            </>
          )}
        </div>
      </div>

      {/* Карточки со счётчиками */}
      <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('users')}
          className="bg-white p-4 rounded-sm border border-[#D6DCDC] hover:border-[#8BA6B1] cursor-pointer transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-[#F3F4F6] flex items-center justify-center text-[#476673] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase font-semibold text-[#8BA6B1] truncate">Пользователей</p>
            <p className="text-2xl font-bold text-[#476673]">{totalUsers}</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('drivers')}
          className="bg-white p-4 rounded-sm border border-[#D6DCDC] hover:border-[#8BA6B1] cursor-pointer transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-[#BFCFC2] flex items-center justify-center text-[#476673] shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase font-semibold text-[#8BA6B1] truncate">Водителей</p>
            <p className="text-2xl font-bold text-[#476673]">{totalDrivers}</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('rides')}
          className="bg-white p-4 rounded-sm border border-[#D6DCDC] hover:border-[#8BA6B1] cursor-pointer transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-[#F3F4F6] flex items-center justify-center text-[#476673] shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase font-semibold text-[#8BA6B1] truncate">Активных поездок</p>
            <p className="text-2xl font-bold text-[#476673]">{activeRides}</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('verifications')}
          className="bg-[#8BA6B1] p-4 rounded-sm border border-[#476673] hover:bg-[#7ba0ad] cursor-pointer text-white flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 bg-white/15 flex items-center justify-center text-white shrink-0">
            <FileClock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase font-semibold text-white/80 truncate">Заявок на проверку</p>
            <p className="text-2xl font-bold text-white">{pendingVerifications}</p>
          </div>
        </div>
      </div>

      {/* График и популярные маршруты */}
      <div id="trends-row" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div id="trends-graph-card" className="lg:col-span-2 bg-white p-5 rounded-sm border border-[#D6DCDC] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-semibold text-[#476673]">Регистрации и поездки</h3>
              <p className="text-xs text-[#8BA6B1]">Серая линия — новые пользователи, тёмная — опубликованные поездки</p>
            </div>
            <div className="flex bg-[#F3F4F6] p-0.5 rounded-sm border border-[#D6DCDC]">
              <button
                onClick={() => setChartDays('7')}
                className={`px-3 py-1 text-xs font-semibold transition-colors ${
                  chartDays === '7'
                    ? 'bg-white text-[#476673]'
                    : 'text-[#8BA6B1] hover:text-[#476673]'
                }`}
              >
                7 дней
              </button>
              <button
                onClick={() => setChartDays('30')}
                className={`px-3 py-1 text-xs font-semibold transition-colors ${
                  chartDays === '30'
                    ? 'bg-white text-[#476673]'
                    : 'text-[#8BA6B1] hover:text-[#476673]'
                }`}
              >
                30 дней
              </button>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div id="chart-area" className="relative h-64 overflow-visible shrink-0 select-none">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              {/* Definitions for Gradients */}
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8BA6B1" stopOpacity="0.3"/>
                  <stop offset="95%" stopColor="#8BA6B1" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="rideGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#476673" stopOpacity="0.4"/>
                  <stop offset="95%" stopColor="#476673" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding + ratio * (height - padding * 2);
                const displayVal = Math.round(maxVal * (1 - ratio));
                return (
                  <g key={i}>
                    <line 
                      x1={padding} 
                      y1={y} 
                      x2={width - padding} 
                      y2={y} 
                      stroke="#F3F4F6" 
                      strokeWidth="1" 
                    />
                    <text 
                      x={padding - 8} 
                      y={y + 4} 
                      textAnchor="end" 
                      className="text-[10px] fill-[#8BA6B1] font-mono"
                    >
                      {displayVal}
                    </text>
                  </g>
                );
              })}

              {/* User Area and Line */}
              <polyline
                fill="url(#userGrad)"
                points={`${padding},${height - padding} ${userPointsStr} ${width - padding},${height - padding}`}
              />
              <polyline
                fill="none"
                stroke="#8BA6B1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={userPointsStr}
              />

              {/* Rides Area and Line */}
              <polyline
                fill="url(#rideGrad)"
                points={`${padding},${height - padding} ${ridePointsStr} ${width - padding},${height - padding}`}
              />
              <polyline
                fill="none"
                stroke="#476673"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={ridePointsStr}
              />

              {/* Interactive Hover Vertical Line */}
              {hoveredIndex !== null && (
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding}
                  x2={getX(hoveredIndex)}
                  y2={height - padding}
                  stroke="#476673"
                  strokeDasharray="4,4"
                  strokeWidth="1.5"
                />
              )}

              {/* X Axis Labels and Interaction Nodes */}
              {activeDataset.map((item, i) => {
                const cx = getX(i);
                const cyUser = getY(item.users);
                const cyRide = getY(item.rides);
                const isHovered = hoveredIndex === i;

                return (
                  <g key={i}>
                    {/* Tick label */}
                    <text
                      x={cx}
                      y={height - padding + 18}
                      textAnchor="middle"
                      className="text-[10px] fill-[#8BA6B1] font-medium"
                    >
                      {item.day}
                    </text>

                    {/* Interaction Circles on User Line */}
                    <circle
                      cx={cx}
                      cy={cyUser}
                      r={isHovered ? 6 : 4}
                      fill="#ffffff"
                      stroke="#8BA6B1"
                      strokeWidth="2"
                    />

                    {/* Interaction Circles on Ride Line */}
                    <circle
                      cx={cx}
                      cy={cyRide}
                      r={isHovered ? 6 : 4}
                      fill="#ffffff"
                      stroke="#476673"
                      strokeWidth="2.5"
                    />

                    {/* Broad invisible columns for hover mouse interception */}
                    <rect
                      x={cx - (width - padding * 2) / (activeDataset.length - 1) / 2}
                      y={padding}
                      width={(width - padding * 2) / (activeDataset.length - 1)}
                      height={height - padding * 2}
                      fill="transparent"
                      className="cursor-crosshair"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Тултип над точкой */}
            {hoveredIndex !== null && (
              <div
                style={{
                  left: `${getX(hoveredIndex) + 10}px`,
                  top: `20px`
                }}
                className="absolute z-20 bg-[#476673] text-white text-xs p-2.5 rounded-sm border border-[#8BA6B1]/30 max-w-[160px] pointer-events-none"
              >
                <p className="font-semibold border-b border-white/20 pb-1 mb-1.5 text-[11px] text-center">
                  {activeDataset[hoveredIndex].day}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className="w-2 h-2 rounded-full bg-[#BFCFC2]"></span>
                    <span className="opacity-80">Пользователи</span>
                    <span className="font-semibold text-[#BFCFC2]">{activeDataset[hoveredIndex].users}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className="w-2 h-2 rounded-full bg-[#D6DCDC]"></span>
                    <span className="opacity-80">Поездки</span>
                    <span className="font-semibold text-white">{activeDataset[hoveredIndex].rides}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 text-xs border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 bg-[#8BA6B1]"></span>
              <span className="text-[#8BA6B1] font-medium">Новые пользователи</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 bg-[#476673]"></span>
              <span className="text-[#476673] font-medium">Опубликованные поездки</span>
            </div>
          </div>
        </div>

        {/* Маршруты */}
        <div id="directions-leaders-card" className="bg-white p-5 rounded-sm border border-[#D6DCDC] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#476673]">Популярные маршруты</h3>
                <p className="text-xs text-[#8BA6B1]">Сколько поездок и сколько сейчас активных</p>
              </div>
              <Compass className="w-5 h-5 text-[#8BA6B1]" />
            </div>

            <div className="space-y-3">
              {directionStats.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#476673]">{item.from} → {item.to}</span>
                    <span className="text-[#476673]/80">{item.count} поездок · {item.active} активных</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F3F4F6] overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(item.count / 184) * 100}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#8BA6B1]">
            <span>Городов в работе: 8</span>
            <button
              onClick={() => setActiveTab('content')}
              className="text-[#476673] hover:underline font-semibold"
            >
              Перейти в города →
            </button>
          </div>
        </div>
      </div>

      {/* Заявки на проверку */}
      <div id="urgent-verifications-stream" className="bg-white p-4 rounded-sm border border-[#D6DCDC]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-[#476673]">Заявки на проверку</h3>
            <p className="text-xs text-[#8BA6B1]">Документы водителей, ждущих проверки</p>
          </div>
          <button
            onClick={() => setActiveTab('verifications')}
            className="text-xs bg-[#476673] text-white px-3 py-1.5 font-medium hover:bg-[#8BA6B1] transition-colors"
          >
            Открыть все
          </button>
        </div>

        {verificationRequests.filter(r => r.status === 'Pending').length === 0 ? (
          <div className="py-8 text-center text-sm text-[#8BA6B1] border border-dashed border-[#D6DCDC]">
            Новых заявок нет.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {verificationRequests.filter(r => r.status === 'Pending').map((req) => (
              <div
                key={req.id}
                onClick={() => setActiveTab('verifications')}
                className="p-3 bg-[#F3F4F6] rounded-sm border border-[#D6DCDC] hover:border-[#8BA6B1] cursor-pointer transition-colors flex items-start gap-3"
              >
                <img
                  src={req.userAvatar}
                  alt={req.userName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 rounded-sm border border-[#D6DCDC]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#476673] truncate">{req.userName}</p>
                  <p className="text-xs text-[#8BA6B1] truncate">{req.carModel}</p>
                  <p className="text-[11px] text-[#476673]/60 mt-1">Номер: {req.carNumber}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#476673]/50">{req.dateSubmitted}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5">Ожидает</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
