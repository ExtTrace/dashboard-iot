import { useEffect } from 'react';
import { supabase } from '../services/supabase';

interface UseTelemetryRealtimeOptions {
  onNewTelemetry: () => void;
  locationId?: string;
  enabled?: boolean;
}

/**
 * Custom hook to listen for Supabase Realtime INSERT events on `iot_telemetry_logs`.
 * Zero HTTP polling requests to Vercel!
 */
export function useTelemetryRealtime({
  onNewTelemetry,
  locationId,
  enabled = true,
}: UseTelemetryRealtimeOptions) {
  useEffect(() => {
    if (!enabled || !supabase) return;

    const channelName = `realtime-telemetry-${locationId || 'all'}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'iot_telemetry_logs',
        },
        (payload) => {
          // If location filter is set (not 'ALL'), verify record location_id
          const recordLocationId = (payload.new as { location_id?: string })
            ?.location_id;

          if (
            !locationId ||
            locationId === 'ALL' ||
            recordLocationId === locationId
          ) {
            onNewTelemetry();
          } else {
            console.log(
              `[Supabase Realtime] Event dilewati (Location ID mismatch: ${recordLocationId} vs filter ${locationId})`,
            );
          }
        },
      )
      .subscribe((status, err) => {
        console.log(`[Supabase Realtime] Status koneksi: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log(
            `[Supabase Realtime] Berhasil terhubung ke iot_telemetry_logs (${locationId || 'ALL'})`,
          );
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Supabase Realtime] Channel error:', err);
        } else if (status === 'TIMED_OUT') {
          console.warn('[Supabase Realtime] Connection timed out');
        }
      });

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [onNewTelemetry, locationId, enabled]);
}
