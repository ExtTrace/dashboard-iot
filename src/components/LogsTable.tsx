import React, { useState } from 'react';
import { Search, Clock, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { TelemetryLog } from '../services/api';

interface LogsTableProps {
  logs: TelemetryLog[];
  limit: number;
  onLimitChange: (newLimit: number) => void;
}

export const LogsTable: React.FC<LogsTableProps> = ({ logs, limit, onLimitChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((log) => {
    const locName = log.iot_locations?.location_name || log.location_id || '';
    const devId = log.device_id || '';
    const search = searchTerm.toLowerCase();

    return locName.toLowerCase().includes(search) || devId.toLowerCase().includes(search);
  });

  return (
    <div className="card-panel rounded-2xl p-6 border border-slate-800/80 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Riwayat Log Telemetry
          </h3>
          <p className="text-xs text-slate-400">
            Pencatatan data mentah sensor & analisis kondisi udara
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari lokasi / device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          {/* Limit Selector */}
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-slate-700 cursor-pointer"
          >
            <option value={10}>10 Data</option>
            <option value={20}>20 Data</option>
            <option value={50}>50 Data</option>
            <option value={100}>100 Data</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3">Waktu Log</th>
              <th className="py-2.5 px-3">Perangkat</th>
              <th className="py-2.5 px-3">Lokasi</th>
              <th className="py-2.5 px-3">Suhu (°C)</th>
              <th className="py-2.5 px-3">Kelembapan (%)</th>
              <th className="py-2.5 px-3">Dew Point (°C)</th>
              <th className="py-2.5 px-3 text-right">Analisis Ruangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-slate-300">
            {filteredLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-slate-500 font-medium"
                >
                  Tidak ada data telemetry ditemukan
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const analytics = Array.isArray(log.iot_room_analytics)
                  ? log.iot_room_analytics[0]
                  : log.iot_room_analytics;

                const mouldRisk = analytics?.mould_risk ?? false;
                const date = new Date(log.created_at);
                const formattedDate = date.toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-white font-mono">
                        {log.device_id}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-400 text-[11px]">
                        {log.iot_locations?.location_name || log.location_id}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      {Number(log.temperature).toFixed(1)} °C
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-400">
                      {Number(log.humidity).toFixed(1)} %
                    </td>
                    <td className="py-2.5 px-3 font-mono text-purple-300">
                      {analytics?.dew_point
                        ? `${Number(analytics.dew_point).toFixed(1)} °C`
                        : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-[11px] font-mono text-slate-400 font-medium">
                          {analytics?.room_status || 'NORMAL'}
                        </span>
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                            mouldRisk
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {mouldRisk ? (
                            <>
                              <ShieldAlert className="w-3 h-3" />
                              <span>Risiko Jamur</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3 h-3" />
                              <span>Bebas Jamur</span>
                            </>
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
