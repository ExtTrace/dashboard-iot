import axios from 'axios';

// Base URL for API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/iot';

export interface LocationItem {
  id: string;
  location_name: string;
  city: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DeviceItem {
  device_id: string;
  device_name: string;
  is_active: boolean;
  location_id: string;
  created_at?: string;
  iot_locations?: LocationItem;
}

export interface TelemetryLog {
  id: string;
  device_id: string;
  location_id: string;
  temperature: number;
  humidity: number;
  created_at: string;
  iot_locations?: LocationItem;
  iot_room_analytics?:
    | {
        id: string;
        dew_point: number;
        mould_risk: boolean;
        room_status: string;
      }
    | {
        id: string;
        dew_point: number;
        mould_risk: boolean;
        room_status: string;
      }[];
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TelemetryResponse {
  success: boolean;
  pagination?: PaginationInfo;
  count: number;
  data: TelemetryLog[];
}

// ─── 1. Telemetry API (with full Pagination support) ─────────────────
export async function getTelemetryLogs(
  deviceId?: string,
  page = 1,
  limit = 30,
  locationId?: string,
): Promise<TelemetryResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (deviceId) params.device_id = deviceId;
  if (locationId && locationId !== 'ALL') params.location_id = locationId;

  const res = await axios.get(`${API_BASE_URL}/telemetry`, { params });
  return {
    success: res.data?.success || false,
    pagination: res.data?.pagination,
    count: res.data?.count || 0,
    data: res.data?.data || [],
  };
}

// ─── 2. Device Toggle API ──────────────────────────────────────────
export async function getDeviceStatus(
  deviceId = 'ESP32-ROOM-01',
): Promise<DeviceItem | null> {
  const res = await axios.get(`${API_BASE_URL}/device-toggle`, {
    params: { device_id: deviceId },
  });
  return res.data?.data || null;
}

export async function getAllDevices(): Promise<DeviceItem[]> {
  const res = await axios.get(`${API_BASE_URL}/device-toggle`);
  return res.data?.data || [];
}

export async function toggleDevicePower(
  deviceId: string,
  is_active?: boolean,
): Promise<DeviceItem> {
  const res = await axios.post(`${API_BASE_URL}/device-toggle`, {
    device_id: deviceId,
    ...(typeof is_active === 'boolean' ? { is_active } : {}),
  });
  return res.data?.data;
}

// ─── 3. Locations API ──────────────────────────────────────────────
export async function getLocations(): Promise<LocationItem[]> {
  const res = await axios.get(`${API_BASE_URL}/locations`);
  return res.data?.data || [];
}

export async function createLocation(
  id: string,
  location_name: string,
  city?: string,
): Promise<LocationItem> {
  const res = await axios.post(`${API_BASE_URL}/locations`, {
    id,
    location_name,
    city: city || null,
  });
  return res.data?.data;
}

export async function updateDeviceLocation(
  deviceId: string,
  locationId: string,
): Promise<DeviceItem> {
  const res = await axios.post(`${API_BASE_URL}/device-location`, {
    device_id: deviceId,
    location_id: locationId,
  });
  return res.data?.data;
}

// ─── 4. Authentication API ─────────────────────────────────────────
export async function loginIoT(
  username: string,
  password: string,
): Promise<{ success: boolean; token: string; user: { username: string }; message?: string }> {
  const res = await axios.post(`${API_BASE_URL}/login`, {
    username,
    password,
  });
  return res.data;
}
