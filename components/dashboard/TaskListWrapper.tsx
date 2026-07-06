"use client";

import { useState, useCallback } from "react";
import TaskList from "@/components/tasks/TaskList";

/**
 * Wrapper client component untuk TaskList di halaman Server Component (dashboard).
 * Menangani refresh stats setelah task diselesaikan.
 */
export default function TaskListWrapper() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStatsRefresh = useCallback(() => {
    // Trigger refresh halaman untuk update stats (level, EXP, dll)
    setRefreshKey((k) => k + 1);
    // Untuk update stats real-time tanpa full reload, kita gunakan router.refresh()
    // Tapi karena ini wrapper sederhana, reload ringan saja
    window.location.reload();
  }, []);

  return <TaskList key={refreshKey} onStatsRefresh={handleStatsRefresh} />;
}
