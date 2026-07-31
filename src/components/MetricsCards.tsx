import React from 'react';
import { Thermometer, Droplets, CloudRain, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { TelemetryLog } from '../services/api';

interface MetricsCardsProps {
  latestData: TelemetryLog | null;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ latestData }) => {
  const temperature = latestData?.temperature ?? 0;
  const humidity = latestData?.humidity ?? 0;

  const analytics = Array.isArray(latestData?.iot_room_analytics)
    ? latestData?.iot_room_analytics[0]
    : latestData?.iot_room_analytics;

  const dewPoint = analytics?.dew_point ?? 0;
  const mouldRisk = analytics?.mould_risk ?? false;
  const roomStatus = analytics?.room_status ?? (latestData ? 'NORMAL' : 'STANDBY');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Suhu Card */}
      <div className="card-panel card-panel-hover rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Suhu Ruangan</span>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
            <Thermometer className="w-4 h-4" />
          </div>
        </div>
        <div className="my-4 flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {latestData ? temperature.toFixed(1) : '--.-'}
            </span>
            <span className="text-sm font-medium text-slate-400 ml-1">°C</span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
            {temperature < 22 ? 'Dingin' : temperature <= 28 ? 'Sejuk' : temperature <= 32 ? 'Hangat' : 'Panas'}
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(Math.max((temperature / 40) * 100, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* 2. Kelembapan Card */}
      <div className="card-panel card-panel-hover rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kelembapan Udara</span>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-sky-400">
            <Droplets className="w-4 h-4" />
          </div>
        </div>
        <div className="my-4 flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {latestData ? humidity.toFixed(1) : '--.-'}
            </span>
            <span className="text-sm font-medium text-slate-400 ml-1">%</span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
            {humidity < 40 ? 'Kering' : humidity <= 65 ? 'Ideal' : 'Lembap'}
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-sky-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(Math.max(humidity, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* 3. Dew Point Card */}
      <div className="card-panel card-panel-hover rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dew Point (Magnus)</span>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-purple-400">
            <CloudRain className="w-4 h-4" />
          </div>
        </div>
        <div className="my-4 flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {latestData ? dewPoint.toFixed(1) : '--.-'}
            </span>
            <span className="text-sm font-medium text-slate-400 ml-1">°C</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
            Titik Embun
          </span>
        </div>
        <p className="text-[11px] text-slate-500 font-mono truncate">
          {dewPoint > 20 ? 'Kondensasi udara tinggi' : 'Kondensasi udara normal'}
        </p>
      </div>

      {/* 4. Room Status & Mould Risk Card */}
      <div className="card-panel card-panel-hover rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status Ruangan</span>
          <div className={`p-2 rounded-xl border bg-slate-900 ${
            mouldRisk ? 'border-rose-500/30 text-rose-400' : 'border-emerald-500/30 text-emerald-400'
          }`}>
            {mouldRisk ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
        </div>
        <div className="my-4 flex items-center justify-between">
          <span className="text-base font-bold text-white tracking-wide uppercase truncate">
            {roomStatus}
          </span>
          <span className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
            mouldRisk
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {mouldRisk ? '⚠️ Risiko Jamur' : '✓ Bebas Jamur'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 truncate">
          {mouldRisk ? 'Kelembapan > 70% & Suhu > 25°C' : 'Sirkulasi udara seimbang'}
        </p>
      </div>
    </div>
  );
};
