import React, { useEffect, useState } from 'react';
import {
  Star,
  Award,
  UserCheck,
  TrendingUp,
  LineChart,
  Loader2,
} from 'lucide-react';
import { fetchAnalytics, AnalyticsData } from '../../lib/analytics';

export default function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const result = await fetchAnalytics();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Не удалось загрузить аналитику');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const topDriversCount = data?.topDriversCount ?? 0;
  const tripsWithoutComplaintsPercent = data?.tripsWithoutComplaintsPercent ?? 0;
  const occupancyPercent = data?.occupancyPercent ?? 0;
  const routePriceIndex = data?.routePriceIndex ?? [];
  const topDrivers = data?.topDrivers ?? [];

  return (
    <div id="analytics-tab-view" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#476673]">Аналитика</h2>
        <p className="text-sm text-[#8BA6B1]">Цены по направлениям и рейтинги водителей</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-[#8BA6B1]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Загружаем аналитику...</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-sm border border-[#D6DCDC] shadow-sm flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-500 rounded-sm border border-amber-200 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#8BA6B1] uppercase">Топ водителей</span>
                <p className="text-2xl font-bold text-[#476673] mt-1">{topDriversCount} чел.</p>
                <p className="text-xs text-[#8BA6B1]/90 mt-1">С рейтингом выше 4.80</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-sm border border-teal-200 bg-teal-50/5 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-teal-50 text-teal-700 rounded-sm border border-teal-100 shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#8BA6B1] uppercase">Поездок без жалоб</span>
                <p className="text-2xl font-bold text-[#476673] mt-1">
                  {tripsWithoutComplaintsPercent.toLocaleString('ru')}%
                </p>
                <p className="text-xs text-[#8BA6B1]/90 mt-1">Без отзывов ниже 4 звёзд</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-sm border border-[#D6DCDC] shadow-sm flex items-start gap-4">
              <div className="p-3 bg-slate-100 text-[#476673] rounded-sm border border-[#D6DCDC] shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#8BA6B1] uppercase">Заполняемость</span>
                <p className="text-2xl font-bold text-[#476673] mt-1">
                  {occupancyPercent.toLocaleString('ru')}%
                </p>
                <p className="text-xs text-[#8BA6B1]/90 mt-1">Сколько мест в среднем занято</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-sm border border-[#D6DCDC] shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#476673]">
                    Индекс стоимости попутных поездок
                  </h3>
                  <p className="text-xs text-[#8BA6B1]">
                    Средние тарифы и число пассажиров по маршрутам
                  </p>
                </div>
                <LineChart className="w-5 h-5 text-[#8BA6B1]" />
              </div>

              <div className="space-y-4">
                {routePriceIndex.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#8BA6B1]">
                    Нет данных по маршрутам.
                  </div>
                ) : (
                  routePriceIndex.map((r, i) => (
                    <div
                      key={r.route}
                      className="p-4 bg-[#F3F4F6] rounded-sm border border-[#D6DCDC] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#476673] text-white font-bold flex items-center justify-center font-mono">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#476673]">{r.route}</h4>
                          <span className="text-[#8BA6B1]">
                            Всего перевезено лиц: {r.passengerCount}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono font-extrabold text-[#476673] text-sm">
                          {r.averagePrice.toLocaleString('ru')} сом
                        </p>
                        <span className="text-[10px] font-bold text-gray-500">
                          {r.growth} динамика
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-sm border border-[#D6DCDC] shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-[#476673]">Репутационный топ водителей</h3>
                <p className="text-xs text-[#8BA6B1]">По рейтингу и количеству поездок</p>
              </div>

              <div className="space-y-4">
                {topDrivers.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#8BA6B1]">
                    Верифицированных водителей пока нет.
                  </div>
                ) : (
                  topDrivers.map((drv, i) => (
                    <div key={drv.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <img
                            src={drv.avatar}
                            alt={drv.name}
                            className="w-10 h-10 rounded-full object-cover rounded-sm border border-[#D6DCDC]"
                          />
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 text-white font-bold text-[10px] rounded-full border border-white flex items-center justify-center">
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#476673]">{drv.name}</p>
                          <p className="text-[10px] text-[#8BA6B1]">{drv.carModel}</p>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <p className="font-bold font-mono text-[#476673]">
                          {drv.completedRides} поездок
                        </p>
                        <span className="text-[10px] text-amber-500 font-bold flex items-center justify-end gap-0.5">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {drv.rating.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
