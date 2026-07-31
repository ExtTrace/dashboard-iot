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

export type TabType = 'overview' | 'logs' | 'locations';

interface DashboardContainerProps {
  currentUser?: string;
  onLogout?: () => void;
}

export function DashboardContainer({ currentUser = 'admin', onLogout }: DashboardContainerProps) {
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

  // Modal Controls
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isMoveDeviceOpen, setIsMoveDeviceOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchData = useCallback(
    async (showIndicator = false) => {
      try {
        if (showIndicator) setRefreshing(true);

        const deviceData = await getDeviceStatus('ESP32-ROOM-01');
        setDevice(deviceData);

        const locList = await getLocations();
        setLocations(locList);

        const telemetryRes = await getTelemetryLogs(
          'ESP32-ROOM-01',
          page,
          limit,
          selectedLocationId,
        );
        setTelemetryLogs(telemetryRes.data);
        if (telemetryRes.pagination) {
          setPagination(telemetryRes.pagination);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, selectedLocationId],
  );

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchData]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-white tracking-wide">
              Climate Control Unit
            </span>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-xs text-slate-400 font-medium">
              {device?.device_id || 'ESP32-ROOM-01'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>
                {activeLocation?.location_name || device?.location_id}
              </span>
            </div>

            {/* Hardware Power Toggle Switch */}
            <button
              onClick={handlePowerToggle}
              disabled={togglingPower}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer disabled:cursor-not-allowed ${
                device?.is_active
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
              }`}
            >
              <Power
                className={`w-3.5 h-3.5 ${togglingPower ? 'animate-spin' : ''}`}
              />
              <span>
                {device?.is_active ? 'POWER: ACTIVE' : 'POWER: PAUSED'}
              </span>
            </button>

            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer disabled:cursor-not-allowed"
              title="Refresh Data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`}
              />
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition cursor-pointer"
                title="Keluar dari Sistem (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout ({currentUser})</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Tab Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-sky-400" />
              <span>Data Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('locations')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'locations'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>Lokasi & Devices</span>
            </button>
          </div>

          {/* Location Filter Bar: ONLY rendered on Overview & Data Logs tabs */}
          {activeTab !== 'locations' && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium mr-1 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>

              <button
                onClick={() => {
                  setSelectedLocationId('ALL');
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition text-xs font-medium cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-md transition text-xs font-medium cursor-pointer ${
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
        onLocationAdded={() => fetchData(true)}
      />

      <MoveDeviceModal
        isOpen={isMoveDeviceOpen}
        onClose={() => setIsMoveDeviceOpen(false)}
        deviceId={device?.device_id || 'ESP32-ROOM-01'}
        currentLocationId={device?.location_id}
        locations={locations}
        onDeviceMoved={() => fetchData(true)}
      />
    </div>
  );
}
