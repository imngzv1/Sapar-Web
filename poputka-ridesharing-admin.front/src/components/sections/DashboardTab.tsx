import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Car,
  FileClock,
  Compass,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { fetchDashboardData, DashboardData } from '../../lib/dashboard';

interface DashboardTabProps {
  setActiveTab: (tab: string) => void;
}

const ROUTE_BAR_COLORS = ['#476673', '#8BA6B1', '#BFCFC2', '#D6DCDC', '#E8EDEE'];

export default function DashboardTab({ setActiveTab }: DashboardTabProps) {
  const [chartDays, setChartDays] = useState<'7' | '30'>('7');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardData();
        if (!cancelled) {
          setDashboard(data);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Не удалось загрузить статистику');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalUsers = dashboard?.stats.totalUsers ?? 0;
  const totalDrivers = dashboard?.stats.totalDrivers ?? 0;
  const pendingVerifications = dashboard?.stats.pendingVerifications ?? 0;
  const activeRides = dashboard?.stats.activeRides ?? 0;

  const activeDataset = chartDays === '7' ? dashboard?.chart7Days ?? [] : dashboard?.chart30Days ?? [];
  const popularRoutes = dashboard?.popularRoutes ?? [];
  const maxRouteCount = popularRoutes[0]?.count ?? 1;

  const maxVal = useMemo(() => {
    if (!activeDataset.length) return 1;
    return Math.max(...activeDataset.map((d) => Math.max(d.users, d.rides)), 1) * 1.15;
  }, [activeDataset]);

  const width = 600;
  const height = 240;
  const padding = 40;

  const getX = (index: number) => {
    const span = Math.max(activeDataset.length - 1, 1);
    return padding + (index * (width - padding * 2)) / span;
  };

  const getY = (value: number) => {
    return height - padding - (value * (height - padding * 2)) / maxVal;
  };

  const userPointsStr = activeDataset.map((item, i) => `${getX(i)},${getY(item.users)}`).join(' ');
  const ridePointsStr = activeDataset.map((item, i) => `${getX(i)},${getY(item.rides)}`).join(' ');

  return (
    <div id="dashboard-tab-view" className="space-y-5">
      <div id="dashboard-welcome-banner" className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#476673]">Панель управления</h2>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-sm border border-[#D6DCDC] text-[#476673]">
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-[#8BA6B1] animate-spin" />
              <span>Загружаем данные...</span>
            </>
          ) : error ? (
            <span className="text-rose-700">{error}</span>
          ) : (
            <>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Данные из базы</span>
            </>
          )}
        </div>
      </div>

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

          {loading ? (
            <div className="h-64 flex items-center justify-center text-[#8BA6B1] text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Загружаем график...
            </div>
          ) : activeDataset.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#8BA6B1] text-sm">
              Нет данных за выбранный период
            </div>
          ) : (
            <div id="chart-area" className="relative h-64 overflow-visible shrink-0 select-none">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8BA6B1" stopOpacity="0.3" />
                    <stop offset="95%" stopColor="#8BA6B1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="rideGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#476673" stopOpacity="0.4" />
                    <stop offset="95%" stopColor="#476673" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

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

                {activeDataset.map((item, i) => {
                  const cx = getX(i);
                  const cyUser = getY(item.users);
                  const cyRide = getY(item.rides);
                  const isHovered = hoveredIndex === i;
                  const showLabel =
                    chartDays === '7' || i === 0 || i === activeDataset.length - 1 || i % 5 === 0;

                  return (
                    <g key={i}>
                      {showLabel && (
                        <text
                          x={cx}
                          y={height - padding + 18}
                          textAnchor="middle"
                          className="text-[10px] fill-[#8BA6B1] font-medium"
                        >
                          {item.day}
                        </text>
                      )}

                      <circle
                        cx={cx}
                        cy={cyUser}
                        r={isHovered ? 6 : 4}
                        fill="#ffffff"
                        stroke="#8BA6B1"
                        strokeWidth="2"
                      />

                      <circle
                        cx={cx}
                        cy={cyRide}
                        r={isHovered ? 6 : 4}
                        fill="#ffffff"
                        stroke="#476673"
                        strokeWidth="2.5"
                      />

                      <rect
                        x={cx - (width - padding * 2) / Math.max(activeDataset.length - 1, 1) / 2}
                        y={padding}
                        width={(width - padding * 2) / Math.max(activeDataset.length - 1, 1)}
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

              {hoveredIndex !== null && (
                <div
                  style={{
                    left: `${getX(hoveredIndex) + 10}px`,
                    top: '20px',
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
          )}

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

        <div id="directions-leaders-card" className="bg-white p-5 rounded-sm border border-[#D6DCDC] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#476673]">Популярные маршруты</h3>
                <p className="text-xs text-[#8BA6B1]">По количеству поездок в таблице rides</p>
              </div>
              <Compass className="w-5 h-5 text-[#8BA6B1]" />
            </div>

            {loading ? (
              <div className="py-8 flex items-center justify-center text-[#8BA6B1] text-sm gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Загружаем...
              </div>
            ) : popularRoutes.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8BA6B1] border border-dashed border-[#D6DCDC]">
                Поездок пока нет
              </div>
            ) : (
              <div className="space-y-3">
                {popularRoutes.map((item, i) => (
                  <div key={`${item.from}-${item.to}`} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#476673]">{item.from} → {item.to}</span>
                      <span className="text-[#476673]/80">{item.count} поездок</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F3F4F6] overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${(item.count / maxRouteCount) * 100}%`,
                          backgroundColor: ROUTE_BAR_COLORS[i % ROUTE_BAR_COLORS.length],
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#8BA6B1]">
            <span>Городов в работе: {dashboard?.citiesCount ?? 0}</span>
            <button
              onClick={() => setActiveTab('content')}
              className="text-[#476673] hover:underline font-semibold"
            >
              Перейти в города →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
