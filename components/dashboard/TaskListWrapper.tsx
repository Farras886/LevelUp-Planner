"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import TaskList from "@/components/tasks/TaskList";

/**
 * Wrapper client component untuk TaskList di halaman Server Component (dashboard).
 * Menangani refresh stats setelah task diselesaikan.
 * Menggunakan router.refresh() (lebih cepat dari window.location.reload)
 */
export default function TaskListWrapper() {
  const router = useRouter();

  const handleStatsRefresh = useCallback(() => {
    // Refresh hanya data Server Component tanpa reload full halaman
    router.refresh();
  }, [router]);

  return <TaskList onStatsRefresh={handleStatsRefresh} />;
}
