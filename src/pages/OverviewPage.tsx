import React from 'react';
import type { TelemetryLog } from '../services/api';
import { MetricsCards } from '../components/MetricsCards';
import { TelemetryChart } from '../components/TelemetryChart';

interface OverviewPageProps {
  telemetryLogs: TelemetryLog[];
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ telemetryLogs }) => {
  const latestLog = telemetryLogs[0] || null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Real-time Metrics Cards */}
      <MetricsCards latestData={latestLog} />

      {/* 2. Historical Trend Chart */}
      <TelemetryChart logs={telemetryLogs} />
    </div>
  );
};
