import React from 'react';
import { Plus, Navigation, MapPin, CheckCircle2, Radio } from 'lucide-react';
import type { LocationItem, DeviceItem } from '../services/api';

interface LocationsPageProps {
  locations: LocationItem[];
  device: DeviceItem | null;
  onOpenAddLocation: () => void;
  onOpenMoveDevice: () => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({
  locations,
  device,
  onOpenAddLocation,
  onOpenMoveDevice,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Active Device Location Card */}
      <div className="card-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Lokasi Terpasang Perangkat Utama (
              {device?.device_id || 'ESP32-ROOM-01'})
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {locations.find((l) => l.id === device?.location_id)
              ?.location_name ||
              device?.location_id ||
              'Kosan Bandung'}
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            ID Lokasi Aktif: {device?.location_id || 'LOC-BANDUNG-01'}
          </p>
        </div>

        <button
          onClick={onOpenMoveDevice}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white hover:border-slate-600 transition cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>Pindahkan Lokasi Perangkat</span>
        </button>
      </div>

      {/* Locations Master Grid Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">
            Daftar Master Lokasi Room
          </h3>
          <p className="text-xs text-slate-400">
            Seluruh lokasi Room terdaftar di sistem
          </p>
        </div>

        <button
          onClick={onOpenAddLocation}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Lokasi Baru</span>
        </button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => {
          const isDeviceLocation = device?.location_id === loc.id;
          return (
            <div
              key={loc.id}
              className={`card-panel rounded-2xl p-5 border flex flex-col justify-between transition ${
                isDeviceLocation
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {loc.id}
                  </span>
                  {isDeviceLocation && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Alat Aktif Disini</span>
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white tracking-tight">
                  {loc.location_name}
                </h4>

                {loc.city && (
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{loc.city}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Terdaftar:{' '}
                  {new Date(loc.created_at).toLocaleDateString('id-ID')}
                </span>
                <span className="text-emerald-400 font-medium">
                  Status: {loc.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
