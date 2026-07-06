"use client";

import { useState } from "react";

interface CalendarTask {
  id: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
}

interface CalendarViewProps {
  tasks: CalendarTask[];
}

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const priorityDot: Record<string, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-blue-500",
  LOW: "bg-slate-500",
};

export default function CalendarView({ tasks }: CalendarViewProps) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Map tasks by date string (YYYY-MM-DD)
  const tasksByDate: Record<string, CalendarTask[]> = {};
  tasks.forEach((task) => {
    const date = new Date(task.due_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(task);
  });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-4">
      {/* Calendar Card */}
      <div className="rounded-2xl border border-white/5 bg-white/3 p-6 backdrop-blur-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            id="cal-prev"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-all hover:border-white/20 hover:text-white"
          >
            ‹
          </button>
          <h2 className="text-base font-bold text-white">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            id="cal-next"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-all hover:border-white/20 hover:text-white"
          >
            ›
          </button>
        </div>

        {/* Day labels */}
        <div className="mb-2 grid grid-cols-7">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-slate-500">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayTasks = tasksByDate[dateKey] || [];
            const isToday =
              day === now.getDate() &&
              currentMonth === now.getMonth() &&
              currentYear === now.getFullYear();
            const isSelected = selectedDate === dateKey;
            const hasTasks = dayTasks.length > 0;

            return (
              <button
                key={day}
                id={`cal-day-${dateKey}`}
                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                className={`relative flex flex-col items-center rounded-xl p-2 text-sm transition-all ${
                  isSelected
                    ? "bg-violet-600 text-white"
                    : isToday
                    ? "border border-violet-500/50 bg-violet-500/10 text-violet-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="font-medium">{day}</span>
                {hasTasks && (
                  <div className="mt-1 flex gap-0.5">
                    {dayTasks.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${
                          isSelected ? "bg-white/60" : t.status === "DONE" ? "bg-emerald-500" : priorityDot[t.priority]
                        }`}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[8px] text-slate-500">+{dayTasks.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date task list */}
      {selectedDate && (
        <div className="rounded-2xl border border-white/5 bg-white/3 p-6 backdrop-blur-xl">
          <h3 className="mb-4 text-sm font-semibold text-white">
            Task tanggal{" "}
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>

          {selectedTasks.length === 0 ? (
            <p className="text-sm text-slate-500">Tidak ada task di tanggal ini.</p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-3"
                >
                  <span
                    className={`h-2 w-2 flex-shrink-0 rounded-full ${
                      task.status === "DONE" ? "bg-emerald-500" : priorityDot[task.priority]
                    }`}
                  />
                  <span className={`flex-1 text-sm ${task.status === "DONE" ? "text-slate-500 line-through" : "text-white"}`}>
                    {task.title}
                  </span>
                  {task.status === "DONE" && (
                    <span className="text-xs text-emerald-400">✅ Selesai</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Prioritas Tinggi</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Prioritas Sedang</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-500" /> Prioritas Rendah</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Selesai</div>
      </div>
    </div>
  );
}
