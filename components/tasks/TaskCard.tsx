"use client";

import { useState } from "react";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const priorityConfig = {
  LOW: {
    label: "Rendah",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    exp: 10,
  },
  MEDIUM: {
    label: "Sedang",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    exp: 20,
  },
  HIGH: {
    label: "Tinggi",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    exp: 35,
  },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const isPast = date < today && !isToday;

  const formatted = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

  if (isToday) return { text: "Hari ini", overdue: false };
  if (isTomorrow) return { text: "Besok", overdue: false };
  if (isPast) return { text: formatted, overdue: true };
  return { text: formatted, overdue: false };
}

export default function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDone = task.status === "DONE";
  const priority = priorityConfig[task.priority];
  const dueDate = formatDate(task.due_date);

  const handleComplete = async () => {
    if (isDone || isCompleting) return;
    setIsCompleting(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
        isDone
          ? "border-white/5 bg-white/2 opacity-60"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
      }`}
    >
      {/* Left accent bar berdasarkan prioritas */}
      {!isDone && (
        <div
          className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${
            task.priority === "HIGH"
              ? "bg-red-500"
              : task.priority === "MEDIUM"
              ? "bg-blue-500"
              : "bg-slate-500"
          }`}
        />
      )}

      <div className="flex items-start gap-3 p-4 pl-5">
        {/* Checkbox */}
        <button
          id={`complete-task-${task.id}`}
          onClick={handleComplete}
          disabled={isDone || isCompleting}
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            isDone
              ? "border-emerald-500 bg-emerald-500"
              : "border-white/20 hover:border-violet-400 hover:bg-violet-400/10"
          } disabled:cursor-not-allowed`}
        >
          {isCompleting ? (
            <svg className="h-3 w-3 animate-spin text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : isDone ? (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : null}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${isDone ? "text-slate-500 line-through" : "text-white"}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="mt-0.5 truncate text-xs text-slate-500">{task.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Priority badge */}
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${priority.color}`}>
              {priority.label}
            </span>

            {/* Due date */}
            <span className={`text-xs ${dueDate.overdue ? "text-red-400" : "text-slate-500"}`}>
              📅 {dueDate.text}
              {dueDate.overdue && " (terlambat)"}
            </span>

            {/* Recurring badge */}
            {task.is_recurring && task.recurrence_rule && (
              <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-xs text-teal-400">
                🔄{" "}
                {task.recurrence_rule === "DAILY"
                  ? "Harian"
                  : task.recurrence_rule === "WEEKLY"
                  ? "Mingguan"
                  : task.recurrence_rule === "MONTHLY"
                  ? "Bulanan"
                  : "Tahunan"}
              </span>
            )}

            {/* EXP reward */}
            {!isDone && (
              <span className="text-xs text-violet-400">+{task.exp_reward} EXP</span>
            )}

            {/* Category */}
            {task.category && (
              <span
                className="rounded-full px-2 py-0.5 text-xs text-white"
                style={{ backgroundColor: task.category.color + "40", border: `1px solid ${task.category.color}60` }}
              >
                {task.category.name}
              </span>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          id={`delete-task-${task.id}`}
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-shrink-0 rounded-lg p-1.5 text-slate-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed"
          title="Hapus task"
        >
          {isDeleting ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
