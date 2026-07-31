import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TelemetryLog, PaginationInfo } from '../services/api';
import { LogsTable } from '../components/LogsTable';

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
      {/* Telemetry Logs Table */}
      <LogsTable logs={telemetryLogs} limit={limit} onLimitChange={onLimitChange} />

      {/* Pagination Bar */}
      {pagination && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-panel rounded-2xl p-4 border border-slate-800 text-xs text-slate-400">
          <div>
            Menampilkan Halaman <span className="font-semibold text-white">{pagination.page}</span> dari <span className="font-semibold text-white">{pagination.totalPages || 1}</span> (Total <span className="font-semibold text-emerald-400">{pagination.total}</span> log telemetry)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={!pagination.hasPrev}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-2.5 py-1 rounded-lg bg-slate-900 font-mono text-white border border-slate-800">
              {pagination.page} / {pagination.totalPages || 1}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!pagination.hasNext}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
