import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Clock, BarChart2 } from 'lucide-react';
import type { TelemetryLog } from '../services/api';

interface DailyStatsSummaryProps {
  logs: TelemetryLog[];
}

export const DailyStatsSummary: React.FC<DailyStatsSummaryProps> = ({ logs }) => {
  // Live ticker clock to update relative "Last Seen" time every 10 seconds (0 API requests!)
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000); // Ticks every 10 seconds
    return () => clearInterval(timer);
  }, []);

  if (!logs || logs.length === 0) return null;

  // Compute metrics from current telemetry logs dataset
  const temperatures = logs.map((l) => l.temperature).filter((t) => typeof t === 'number' && !isNaN(t));
  const humidities = logs.map((l) => l.humidity).filter((h) => typeof h === 'number' && !isNaN(h));

  const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 0;
  const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;
  const avgTemp = temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0;
  const avgHumidity = humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 0;

  const latestLog = logs[0];
  const lastSeen = formatLastSeen(latestLog?.created_at, now);

  return (
    <div className="card-panel rounded-2xl p-4 border border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800/60">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Ringkasan Statistik Telemetry ({logs.length} Log)
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Terakhir Terhubung:</span>
          <span className="font-semibold text-white">{lastSeen.text}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              lastSeen.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
            title={lastSeen.isOnline ? 'Device Aktif (Online)' : 'Standby / Idle'}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Suhu Maksimum */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase">Suhu Maks</p>
            <p className="text-lg font-mono font-bold text-rose-400 mt-0.5">{maxTemp.toFixed(1)}°C</p>
          </div>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Suhu Minimum */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase">Suhu Min</p>
            <p className="text-lg font-mono font-bold text-sky-400 mt-0.5">{minTemp.toFixed(1)}°C</p>
          </div>
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>

        {/* Rata-rata Suhu */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase">Rata-rata Suhu</p>
            <p className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{avgTemp.toFixed(1)}°C</p>
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        {/* Rata-rata Kelembapan */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase">Rata-rata Kelembapan</p>
            <p className="text-lg font-mono font-bold text-purple-400 mt-0.5">{avgHumidity.toFixed(1)}%</p>
          </div>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

function formatLastSeen(createdAt: string | undefined, now: Date): { text: string; isOnline: boolean } {
  if (!createdAt) return { text: 'Tidak ada data', isOnline: false };

  const date = new Date(createdAt);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return { text: 'Baru saja', isOnline: true };
  if (diffMinutes < 60) return { text: `${diffMinutes}m lalu`, isOnline: diffMinutes <= 10 };

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return { text: `${diffHours}j lalu`, isOnline: false };

  const diffDays = Math.floor(diffHours / 24);
  return { text: `${diffDays}d lalu`, isOnline: false };
}
