import React, { useState } from 'react';
import { X, Plus, Building2, MapPin } from 'lucide-react';
import { createLocation } from '../services/api';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationAdded: () => void;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({ isOpen, onClose, onLocationAdded }) => {
  const [id, setId] = useState('');
  const [locationName, setLocationName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !locationName.trim()) {
      setError('ID Lokasi dan Nama Lokasi wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createLocation(id.trim().toUpperCase(), locationName.trim(), city.trim() || undefined);
      onLocationAdded();
      onClose();
      // Reset form
      setId('');
      setLocationName('');
      setCity('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Gagal menyimpan lokasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700/80 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Tambah Lokasi Room Baru</h3>
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

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              ID Lokasi (Unik, ex: LOC-JAKARTA-01)
            </label>
            <input
              type="text"
              placeholder="LOC-JAKARTA-01"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Nama Lokasi (ex: Kosan Jaksel - Kamar Utama)
            </label>
            <input
              type="text"
              placeholder="Kosan Jaksel - Kamar Utama"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Kota / Wilayah (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Jakarta Selatan"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm"
              />
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
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
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Simpan...' : 'Simpan Lokasi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
