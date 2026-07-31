import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { TelemetryLog } from '../services/api';

interface TelemetryChartProps {
  logs: TelemetryLog[];
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ logs }) => {
  const chartData = [...logs].reverse().map((item) => {
    const analytics = Array.isArray(item.iot_room_analytics)
      ? item.iot_room_analytics[0]
      : item.iot_room_analytics;

    const date = new Date(item.created_at);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      time: timeString,
      temperature: Number(item.temperature),
      humidity: Number(item.humidity),
      dewPoint: analytics?.dew_point ? Number(analytics.dew_point) : null,
    };
  });

  return (
    <div className="card-panel rounded-2xl p-6 border border-slate-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/60 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">Tren Suhu & Kelembapan</h3>
          <p className="text-xs text-slate-400">Pencatatan data telemetry real-time</p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Suhu (°C)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-slate-300">Kelembapan (%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-slate-300">Dew Point (°C)</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full pt-4">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            Belum ada data telemetry tercatat
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1f293d" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
              />
              <YAxis
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d121d',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                name="Suhu (°C)"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="humidity"
                name="Kelembapan (%)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="dewPoint"
                name="Dew Point (°C)"
                stroke="#c084fc"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
