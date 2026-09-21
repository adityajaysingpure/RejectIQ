import { useState, useEffect } from "react";
import { getHistory, getStats, deleteHistory } from "../services/api";

export function useHistory() {
  const [records, setRecords]   = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [hRes, sRes] = await Promise.all([getHistory(), getStats()]);
      setRecords(hRes.data);
      setStats(sRes.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    setRecords((prev) => prev.filter((r) => r._id !== id));
    await deleteHistory(id);
    await getStats().then((r) => setStats(r.data)).catch(() => {});
  };

  return { records, stats, loading, remove, refresh: load };
}
