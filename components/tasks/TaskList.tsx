"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";

type FilterType = "today" | "all" | "done";

interface LevelUpInfo {
  leveledUp: boolean;
  newLevel: number;
  expGained: number;
}

interface TaskListProps {
  onStatsRefresh?: () => void;
}

export default function TaskList({ onStatsRefresh }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>("today");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<LevelUpInfo | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = "/api/tasks";
      if (filter === "today") {
        const today = new Date().toISOString().split("T")[0];
        url += `?date=${today}`;
      } else if (filter === "done") {
        url += "?status=DONE";
      }
      const res = await fetch(url);
      const json = await res.json();
      setTasks(json.data || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskCreated = (newTask: unknown) => {
    setTasks((prev) => [newTask as Task, ...prev]);
    setShowForm(false);
    onStatsRefresh?.();
  };

  const handleComplete = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });

    if (!res.ok) return;

    const json = await res.json();

    // Update task di local state — tandai sebagai DONE
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: "DONE" as const, completed_at: new Date().toISOString() }
          : t
      )
    );

    // Jika recurring → tambah next task ke list (langsung tampil tanpa reload)
    if (json.nextTask) {
      setTasks((prev) => [json.nextTask, ...prev]);
    }

    // Tampilkan notifikasi level up jika ada
    if (json.leveledUp) {
      setLevelUpInfo({
        leveledUp: true,
        newLevel: json.newLevel,
        expGained: json.expGained,
      });
      setTimeout(() => setLevelUpInfo(null), 4000);
    }

    // Refresh stats di parent
    onStatsRefresh?.();
  };

  const handleDelete = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    onStatsRefresh?.();
  };

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "today", label: "Hari Ini" },
    { key: "all", label: "Semua" },
    { key: "done", label: "Selesai" },
  ];

  const pendingTasks = tasks.filter((t) => t.status !== "DONE");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="space-y-4">
      {/* Level Up Notification */}
      {levelUpInfo && (
        <div className="animate-bounce-in rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 text-center">
          <div className="text-2xl">🎉</div>
          <div className="mt-1 text-lg font-bold text-yellow-300">
            LEVEL UP! Sekarang Level {levelUpInfo.newLevel}
          </div>
          <div className="text-sm text-yellow-400">+{levelUpInfo.expGained} EXP diperoleh</div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Task Kamu</h2>
          <p className="text-xs text-slate-500">
            {pendingTasks.length} task belum selesai
          </p>
        </div>
        <button
          id="add-task-btn"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500"
        >
          <span>{showForm ? "×" : "+"}</span>
          <span>{showForm ? "Tutup" : "Tambah Task"}</span>
        </button>
      </div>

      {/* Task Form */}
      {showForm && (
        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-900/20 to-indigo-900/20 p-5 backdrop-blur-xl">
          <h3 className="mb-4 text-sm font-semibold text-violet-300">Task Baru ⚔️</h3>
          <TaskForm onSuccess={handleTaskCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/5 bg-white/5 p-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            id={`filter-${tab.key}`}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
              filter === tab.key
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="h-6 w-6 animate-spin text-violet-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/2 py-12 text-center">
          <div className="text-3xl">📭</div>
          <p className="mt-2 text-sm text-slate-400">
            {filter === "today" ? "Tidak ada task hari ini" : "Belum ada task"}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-xs text-violet-400 hover:text-violet-300"
          >
            + Tambah task pertamamu
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Pending tasks */}
          {pendingTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          ))}

          {/* Done tasks (jika ada dan filter bukan "done" saja) */}
          {filter !== "done" && doneTasks.length > 0 && (
            <>
              <div className="flex items-center gap-2 py-1">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-xs text-slate-600">Selesai ({doneTasks.length})</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))}
            </>
          )}

          {/* Done-only filter */}
          {filter === "done" &&
            doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
              />
            ))}
        </div>
      )}
    </div>
  );
}
