# 🌡️ IoT Climate Control Unit & Room Monitor

Sistem Monitoring Suhu, Kelembapan, Dew Point, dan Risiko Jamur Ruangan Real-time berbasis **ESP32 + Vercel Serverless API + Supabase PostgreSQL + React 19 Web Dashboard**.

---

## 🚀 Fitur Utama

- 📊 **Real-time Telemetry Dashboard:** Visualisasi Suhu, Kelembapan, Dew Point (Magnus-Tetens Formula), dan Mould Risk.
- ⚡ **Remote Hardware Power Toggle:** Sakelar pintar untuk mematikan/mengaktifkan sensor ESP32 secara jarak jauh dari web.
- 📍 **Multi-Location Management:** Dukungan alokasi dan pemindahan lokasi perangkat ESP32 (misal: Kosan 2A, Ruang Tamu, Kamar Depan).
- 📜 **Data Logs & RESTful Pagination:** Pencatatan log mentah telemetry lengkap dengan fitur pencarian dan paginasi halaman.
- 📶 **Dynamic WiFi Captive Portal (ESP32):** Penyetelan WiFi tanpa hardcode credential, dilengkapi fitur reset WiFi tahan tombol BOOT 3 detik.
- 🎨 **Bespoke Industrial Dark UI:** Tampilan SaaS modern bergaya Linear/Vercel dengan ikon SVG minimalis dan responsif.

---

## 🛠️ Arsitektur Teknologi

| Layer | Teknologi |
| :--- | :--- |
| **Hardware** | ESP32, Sensor DHT11, Layar OLED 0.96" I2C, PlatformIO C++ |
| **Backend API** | Node.js, Vercel Serverless Functions, Supabase (PostgreSQL 3NF) |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons |

---

## ⚙️ Variabel Lingkungan (Environment Variables)
Untuk menghubungkan Web Dashboard dengan Backend API:

```env
VITE_API_BASE_URL=https://xxxx
```

---

## 💻 Panduan Jalankan Lokal

### 1. Menjalankan Backend (`awt-api`)
```bash
cd awt-api
npm install
npx vercel dev
```

### 2. Menjalankan Dashboard (`dashboard-iot`)
```bash
cd dashboard-iot
npm install
npm run dev
```
Akses dashboard di browser melalui: `http://localhost:5173/`

---

## 🗄️ Skema Database Supabase (`iot_` Prefix)

- **`iot_locations`**: Master data lokasi ruangan/kosan.
- **`iot_devices`**: Master data perangkat ESP32 (`device_id`, `is_active`, `location_id`).
- **`iot_telemetry_logs`**: Log historis bacaan suhu & kelembapan.
- **`iot_room_analytics`**: Hasil perhitungan Dew Point, Mould Risk (risiko jamur), dan Status Ruangan.

---

## 📄 Lisensi
MIT License - Dibuat untuk Monitoring Suhu Ruangan & Kosan.
