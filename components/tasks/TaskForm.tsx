"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema, type CreateTaskInput } from "@/lib/validations";
import { useState } from "react";

interface TaskFormProps {
  onSuccess: (task: unknown) => void;
  onCancel: () => void;
}

const priorityOptions = [
  { value: "LOW", label: "🟢 Rendah", exp: 10 },
  { value: "MEDIUM", label: "🔵 Sedang", exp: 20 },
  { value: "HIGH", label: "🔴 Tinggi", exp: 35 },
];

const recurrenceOptions = [
  { value: "DAILY", label: "🔁 Setiap Hari" },
  { value: "WEEKLY", label: "📆 Setiap Minggu" },
  { value: "MONTHLY", label: "🗓️ Setiap Bulan" },
  { value: "YEARLY", label: "🎯 Setiap Tahun" },
];

export default function TaskForm({ onSuccess, onCancel }: TaskFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: "MEDIUM",
      due_date: new Date().toISOString().split("T")[0],
      is_recurring: false,
    },
  });

  const selectedPriority = watch("priority");
  const isRecurring = watch("is_recurring");

  const baseExp = priorityOptions.find((p) => p.value === selectedPriority)?.exp ?? 20;
  const totalExp = isRecurring ? baseExp + 5 : baseExp;

  const onSubmit = async (data: CreateTaskInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error || "Gagal membuat task");
        return;
      }

      const result = await res.json();
      onSuccess(result.data);
    } catch {
      setServerError("Terjadi kesalahan jaringan");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="task-form">
      {serverError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="task-title" className="block text-sm font-medium text-slate-300">
          Judul Task <span className="text-red-400">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          placeholder="Contoh: Baca buku 30 menit"
          {...register("title")}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
        {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="task-description" className="block text-sm font-medium text-slate-300">
          Deskripsi <span className="text-slate-500 text-xs">(opsional)</span>
        </label>
        <textarea
          id="task-description"
          rows={2}
          placeholder="Detail tambahan..."
          {...register("description")}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
        {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
      </div>

      {/* Due Date + Priority in row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Due Date */}
        <div className="space-y-1.5">
          <label htmlFor="task-due-date" className="block text-sm font-medium text-slate-300">
            Tenggat <span className="text-red-400">*</span>
          </label>
          <input
            id="task-due-date"
            type="date"
            {...register("due_date")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 [color-scheme:dark]"
          />
          {errors.due_date && <p className="text-xs text-red-400">{errors.due_date.message}</p>}
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Prioritas</label>
          <select
            id="task-priority"
            {...register("priority")}
            className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-3 text-white transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recurring Toggle */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">🔄 Task Berulang</p>
            <p className="text-xs text-slate-500">Task otomatis dibuat ulang setelah diselesaikan</p>
          </div>
          {/* Toggle Switch */}
          <button
            type="button"
            id="recurring-toggle"
            onClick={() => {
              const newVal = !isRecurring;
              setValue("is_recurring", newVal);
              if (!newVal) setValue("recurrence_rule", undefined);
            }}
            className={`relative h-6 w-11 rounded-full transition-all duration-200 focus:outline-none ${
              isRecurring ? "bg-violet-600" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                isRecurring ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Recurrence options — tampil hanya jika toggle aktif */}
        {isRecurring && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">Ulangi setiap:</label>
            <div className="grid grid-cols-2 gap-2">
              {recurrenceOptions.map((opt) => {
                const currentVal = watch("recurrence_rule");
                const isSelected = currentVal === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    id={`recurrence-${opt.value.toLowerCase()}`}
                    onClick={() =>
                      setValue(
                        "recurrence_rule",
                        opt.value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
                      )
                    }
                    className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                      isSelected
                        ? "border-violet-500/60 bg-violet-500/20 text-violet-300"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {errors.recurrence_rule && (
              <p className="text-xs text-red-400">{errors.recurrence_rule.message}</p>
            )}
          </div>
        )}
      </div>

      {/* EXP preview */}
      <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2">
        <p className="text-xs text-violet-300">
          ⚡ Menyelesaikan task ini memberikan{" "}
          <span className="font-bold text-violet-200">+{totalExp} EXP</span>
          {isRecurring && (
            <span className="ml-1 text-violet-400">(+5 bonus recurring)</span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          id="task-cancel"
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 transition-all hover:border-white/20 hover:text-white"
        >
          Batal
        </button>
        <button
          id="task-submit"
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Menyimpan..." : `Buat Task${isRecurring ? " 🔄" : " ⚔️"}`}
        </button>
      </div>
    </form>
  );
}
