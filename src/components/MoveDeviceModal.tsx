import React, { useState } from 'react';
import { X, Navigation, Check } from 'lucide-react';
import { updateDeviceLocation } from '../services/api';
import type { LocationItem } from '../services/api';

interface MoveDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  currentLocationId?: string;
  locations: LocationItem[];
  onDeviceMoved: () => void;
}

export const MoveDeviceModal: React.FC<MoveDeviceModalProps> = ({
  isOpen,
  onClose,
  deviceId,
  currentLocationId,
  locations,
  onDeviceMoved,
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState(currentLocationId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocationId) {
      setError('Pilih lokasi tujuan terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await updateDeviceLocation(deviceId, selectedLocationId);
      onDeviceMoved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Gagal memindahkan lokasi perangkat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700/80 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Navigation className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Pindahkan Lokasi Perangkat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            Perangkat <span className="font-mono text-white font-semibold">{deviceId}</span> akan dipindahkan ke lokasi baru. Data historis di lokasi lama tetap aman & terikat abadi.
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Pilih Lokasi Baru
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {locations.map((loc) => {
                const isSelected = selectedLocationId === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setSelectedLocationId(loc.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-sm text-white">{loc.location_name}</div>
                      <div className="text-xs text-slate-400 flex items-center space-x-2">
                        <span className="font-mono">{loc.id}</span>
                        {loc.city && <span>• {loc.city}</span>}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !selectedLocationId}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>{loading ? 'Pindah...' : 'Pindahkan Lokasi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
