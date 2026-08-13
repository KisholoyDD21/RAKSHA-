import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useSocket } from './SocketContext.jsx';
import { useUser } from './UserContext.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

const DataContext = createContext(null);
const PENDING_REPORTS_KEY = 'raksha_pending_reports';

function loadPendingReports() {
  try {
    const raw = localStorage.getItem(PENDING_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePendingReports(list) {
  try {
    localStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — queue just won't survive a reload */
  }
}

export function DataProvider({ children }) {
  const { socket } = useSocket();
  const { profile } = useUser();
  const isOnline = useOnlineStatus();

  const [incidents, setIncidents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [areaAlert, setAreaAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingReports, setPendingReports] = useState(loadPendingReports);

  const refetchAll = useCallback(async () => {
    try {
      setError(null);
      const [inc, fac, bro, alert] = await Promise.all([
        api.getIncidents(),
        api.getFacilities(),
        api.getBroadcasts(),
        api.getAreaAlert(),
      ]);
      setIncidents(inc);
      setFacilities(fac);
      setBroadcasts(bro);
      setAreaAlert(alert);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  // Live updates: any connected client's write triggers every other
  // client's dashboard/map to refresh within a socket round-trip.
  useEffect(() => {
    if (!socket) return undefined;

    const refreshIncidentsAndAlert = () => {
      api.getIncidents().then(setIncidents).catch(() => {});
      api.getAreaAlert().then(setAreaAlert).catch(() => {});
    };
    const refreshFacilities = () => api.getFacilities().then(setFacilities).catch(() => {});
    const refreshBroadcasts = () => api.getBroadcasts().then(setBroadcasts).catch(() => {});

    socket.on('incidents:changed', refreshIncidentsAndAlert);
    socket.on('facilities:changed', refreshFacilities);
    socket.on('broadcasts:changed', refreshBroadcasts);

    return () => {
      socket.off('incidents:changed', refreshIncidentsAndAlert);
      socket.off('facilities:changed', refreshFacilities);
      socket.off('broadcasts:changed', refreshBroadcasts);
    };
  }, [socket]);

  // Flush any offline-queued reports the moment connectivity returns.
  useEffect(() => {
    if (!isOnline || pendingReports.length === 0) return undefined;
    let cancelled = false;

    (async () => {
      const remaining = [...pendingReports];
      while (remaining.length > 0) {
        try {
          await api.createIncident(remaining[0]);
          remaining.shift();
          if (!cancelled) {
            setPendingReports([...remaining]);
            savePendingReports(remaining);
          }
        } catch {
          break; // network blip — stop here, we'll retry on the next online event
        }
      }
      if (!cancelled) refetchAll();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const submitReport = useCallback(
    async (reportData) => {
      const payload = { ...reportData, reporterId: profile.userId };

      if (!isOnline) {
        const next = [...pendingReports, payload];
        setPendingReports(next);
        savePendingReports(next);
        return { queued: true };
      }

      try {
        const created = await api.createIncident(payload);
        await refetchAll();
        return { queued: false, incident: created };
      } catch (err) {
        const next = [...pendingReports, payload];
        setPendingReports(next);
        savePendingReports(next);
        return { queued: true, error: err.message };
      }
    },
    [isOnline, pendingReports, profile.userId, refetchAll]
  );

  const voteOnIncident = useCallback(
    async (incidentId, vote) => {
      const updated = await api.voteIncident(incidentId, profile.userId, vote);
      setIncidents((prev) => prev.map((i) => (i.id === incidentId ? updated : i)));
      return updated;
    },
    [profile.userId]
  );

  const value = {
    incidents,
    facilities,
    broadcasts,
    areaAlert,
    loading,
    error,
    pendingReports,
    isOnline,
    refetchAll,
    submitReport,
    voteOnIncident,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
