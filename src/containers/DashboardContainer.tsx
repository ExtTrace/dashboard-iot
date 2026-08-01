import { useState, useEffect, useCallback } from 'react';
import {
  Power,
  RefreshCw,
  Activity,
  Sparkles,
  Radio,
  LayoutDashboard,
  Table,
  MapPin,
  Building2,
  LogOut,
  Bell,
} from 'lucide-react';
import {
  getTelemetryLogs,
  getDeviceStatus,
  getLocations,
  toggleDevicePower,
} from '../services/api';
import type {
  TelemetryLog,
  DeviceItem,
  LocationItem,
  PaginationInfo,
} from '../services/api';
import { OverviewPage } from '../pages/OverviewPage';
import { LogsPage } from '../pages/LogsPage';
import { LocationsPage } from '../pages/LocationsPage';
import { AddLocationModal } from '../components/AddLocationModal';
import { MoveDeviceModal } from '../components/MoveDeviceModal';
import { useTelemetryRealtime } from '../hooks/useTelemetryRealtime';

export type TabType = 'overview' | 'logs' | 'locations';

interface DashboardContainerProps {
  currentUser?: string;
  onLogout?: () => void;
}

export function DashboardContainer({
  currentUser = 'admin',
  onLogout,
}: DashboardContainerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [device, setDevice] = useState<DeviceItem | null>(null);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL');
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [togglingPower, setTogglingPower] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New data notification counter (React Memory state)
  const [newDataCount, setNewDataCount] = useState<number>(0);

  // Modal Controls
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isMoveDeviceOpen, setIsMoveDeviceOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ─── Fetch static data: locations + device status (once on mount) ────
  const fetchStaticData = useCallback(async () => {
    try {
      const [deviceData, locList] = await Promise.all([
        getDeviceStatus('ESP32-ROOM-01'),
        getLocations(),
      ]);
      setDevice(deviceData);
      setLocations(locList);
    } catch (err) {
      console.error('Error fetching static data:', err);
    }
  }, []);

  // ─── Fetch telemetry logs (paginated, user-controlled) ───────────────
  const fetchTelemetry = useCallback(
    async (showIndicator = false, resetToPage1 = false) => {
      try {
        if (showIndicator) setRefreshing(true);
        const targetPage = resetToPage1 ? 1 : page;
        if (resetToPage1) setPage(1);

        const telemetryRes = await getTelemetryLogs(
          'ESP32-ROOM-01',
          targetPage,
          limit,
          selectedLocationId,
        );
        setTelemetryLogs(telemetryRes.data);
        if (telemetryRes.pagination) setPagination(telemetryRes.pagination);

        // Mark entry as seen — clears new data counter
        setNewDataCount(0);
      } catch (err) {
        console.error('Error fetching telemetry:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, selectedLocationId],
  );

  // ─── Supabase Realtime Listener (0 Vercel polling requests!) ────────
  const handleRealtimeTelemetry = useCallback(() => {
    setNewDataCount((prev) => prev + 1);
  }, []);

  useTelemetryRealtime({
    onNewTelemetry: handleRealtimeTelemetry,
    locationId: selectedLocationId,
  });

  // ─── Initial load: static + telemetry ────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await fetchStaticData();
      await fetchTelemetry();
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Re-fetch telemetry when page/limit/filter changes ───────────────
  useEffect(() => {
    if (!loading) fetchTelemetry();
  }, [page, limit, selectedLocationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePowerToggle = async () => {
    if (!device) return;
    try {
      setTogglingPower(true);
      const newStatus = !device.is_active;
      const updated = await toggleDevicePower(device.device_id, newStatus);
      setDevice(updated);

      showToast(
        newStatus
          ? `Perangkat ${device.device_id} DIAKTIFKAN`
          : `Perangkat ${device.device_id} DIMATIKAN (PAUSED)`,
      );
    } catch (err: any) {
      showToast('Gagal mengubah sakelar daya perangkat');
    } finally {
      setTogglingPower(false);
    }
  };

  const activeLocation = locations.find((l) => l.id === device?.location_id);

  if (loading && !telemetryLogs.length) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-slate-400">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 mb-3">
          <Activity className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-base font-semibold text-white">
          Memuat System Monitor...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white shadow-2xl text-xs font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar Header */}
      <nav className="border-b border-slate-800/80 bg-[#0a0e17]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Row utama */}
          <div className="h-14 flex items-center justify-between gap-2">
            {/* Kiri: brand + device id */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-sm font-semibold text-white tracking-wide whitespace-nowrap">
                Climate Control
              </span>
              <span className="text-slate-600 flex-shrink-0">/</span>
              <span className="font-mono text-xs text-slate-400 truncate">
                {device?.device_id || 'ESP32-ROOM-01'}
              </span>
            </div>

            {/* Kanan: controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Location badge — sembunyi di xs */}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-400 whitespace-nowrap">
                <Radio className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="truncate max-w-[120px]">
                  {activeLocation?.location_name || device?.location_id}
                </span>
              </div>

              {/* Power button — teks hanya di sm+ */}
              <button
                onClick={handlePowerToggle}
                disabled={togglingPower}
                title={device?.is_active ? 'POWER: ACTIVE' : 'POWER: PAUSED'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer disabled:cursor-not-allowed ${
                  device?.is_active
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                <Power
                  className={`w-3.5 h-3.5 flex-shrink-0 ${togglingPower ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">
                  {device?.is_active ? 'ACTIVE' : 'PAUSED'}
                </span>
              </button>

              {/* Refresh */}
              <div className="relative">
                <button
                  onClick={() => fetchTelemetry(true, true)}
                  disabled={refreshing}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer disabled:cursor-not-allowed"
                  title="Refresh Data"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`}
                  />
                </button>
                {newDataCount > 0 && (
                  <div className="absolute -right-3 top-full mt-4 z-50 animate-float">
                    <svg
                      className="absolute -top-[7px] right-5 z-20"
                      width="16"
                      height="8"
                      viewBox="0 0 16 8"
                    >
                      <path d="M0 8 L8 0 L16 8 Z" fill="#0f172a" />
                      <path
                        d="M1 8 L8 1 L15 8"
                        fill="none"
                        stroke="rgba(52,211,153,.4)"
                        strokeWidth="1"
                      />
                    </svg>

                    {/* Bubble */}
                    <div className="relative whitespace-nowrap rounded-xl bg-slate-900 border border-emerald-500/40 px-3 py-2 text-xs text-emerald-300 shadow-2xl flex items-center gap-2">
                      <span className="relative flex w-3.5 h-3.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                        <Bell className="relative w-3.5 h-3.5 text-emerald-400" />
                      </span>

                      <span>
                        <strong className="font-mono text-emerald-400 font-bold">{newDataCount}</strong> data telemetry baru tersedia
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition cursor-pointer"
                  title={`Logout (${currentUser})`}
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Tab Navigation Header */}
        <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-4">
          {/* Tab buttons — full width di mobile */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 w-full sm:w-fit">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`relative flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span>Data Logs</span>
              {/* Badge counter when new telemetry data is available */}
              {newDataCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 animate-pulse">
                  +{newDataCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('locations')}
              className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'locations'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span className="hidden xs:inline">Lokasi & Devices</span>
              <span className="xs:hidden">Lokasi</span>
            </button>
          </div>

          {/* Location Filter Bar — scroll horizontal di mobile */}
          {activeTab !== 'locations' && (
            <div className="flex items-center gap-2 text-xs overflow-x-auto pb-0.5 scrollbar-hide">
              <span className="text-slate-500 font-medium flex items-center gap-1 flex-shrink-0">
                <Building2 className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>

              <button
                onClick={() => {
                  setSelectedLocationId('ALL');
                  setPage(1);
                }}
                className={`flex-shrink-0 px-2.5 py-1 rounded-md transition text-xs font-medium cursor-pointer ${
                  selectedLocationId === 'ALL'
                    ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>

              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocationId(loc.id);
                    setPage(1);
                  }}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-md transition text-xs font-medium cursor-pointer whitespace-nowrap ${
                    selectedLocationId === loc.id
                      ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {loc.location_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Page Views */}
        {activeTab === 'overview' && (
          <OverviewPage telemetryLogs={telemetryLogs} />
        )}

        {activeTab === 'logs' && (
          <div className="space-y-3">
            <LogsPage
              telemetryLogs={telemetryLogs}
              pagination={pagination}
              page={page}
              limit={limit}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        )}

        {activeTab === 'locations' && (
          <LocationsPage
            locations={locations}
            device={device}
            onOpenAddLocation={() => setIsAddLocationOpen(true)}
            onOpenMoveDevice={() => setIsMoveDeviceOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <AddLocationModal
        isOpen={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
        onLocationAdded={() => {
          fetchStaticData();
          fetchTelemetry(true, true);
        }}
      />

      <MoveDeviceModal
        isOpen={isMoveDeviceOpen}
        onClose={() => setIsMoveDeviceOpen(false)}
        deviceId={device?.device_id || 'ESP32-ROOM-01'}
        currentLocationId={device?.location_id}
        locations={locations}
        onDeviceMoved={() => {
          fetchStaticData();
          fetchTelemetry(true, true);
        }}
      />
    </div>
  );
}
