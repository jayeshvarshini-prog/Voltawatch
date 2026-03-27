import { useState, useEffect, useRef, useCallback } from 'react';
import { api, TelemetryReading, WS_URL } from '../api/bff';

export function useTelemetry(carId: string | null, token: string | null) {
  const [latest, setLatest] = useState<TelemetryReading | null>(null);
  const [history, setHistory] = useState<TelemetryReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchData = useCallback(async () => {
    if (!carId) return;
    setLoading(true);
    setError(null);
    try {
      const [latestData, historyData] = await Promise.all([
        api.getLatestReading(carId),
        api.getTelemetry(carId, 50),
      ]);
      setLatest(latestData);
      setHistory(historyData.reverse());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load telemetry');
    } finally {
      setLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!carId || !token) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ event: 'auth', data: { token } }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as { event: string; data: unknown };
        if (msg.event === 'auth' && (msg.data as { status: string }).status === 'authenticated') {
          ws.send(JSON.stringify({ event: 'subscribe', data: { carId } }));
          setWsConnected(true);
        } else if (msg.event === 'telemetry_update') {
          const reading = msg.data as TelemetryReading;
          if (reading.carId === carId) {
            setLatest(reading);
            setHistory((prev) => {
              const updated = [...prev, reading];
              return updated.slice(-50);
            });
          }
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    return () => {
      ws.close();
      setWsConnected(false);
    };
  }, [carId, token]);

  return { latest, history, loading, error, wsConnected, refetch: fetchData };
}
