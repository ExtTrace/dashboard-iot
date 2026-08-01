import React from 'react';
import type { TelemetryLog, PaginationInfo } from '../services/api';
import { LogsTable } from '../components/LogsTable';
import { PaginationBar } from '../components/PaginationBar';

interface LogsPageProps {
  telemetryLogs: TelemetryLog[];
  pagination: PaginationInfo | null;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export const LogsPage: React.FC<LogsPageProps> = ({
  telemetryLogs,
  pagination,
  page,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <PaginationBar
        pagination={pagination}
        page={page}
        onPageChange={onPageChange}
      />

      {/* Telemetry Logs Table */}
      <LogsTable
        logs={telemetryLogs}
        limit={limit}
        onLimitChange={onLimitChange}
      />

      {/* Pagination Bar */}
      <PaginationBar
        pagination={pagination}
        page={page}
        onPageChange={onPageChange}
      />
    </div>
  );
};
