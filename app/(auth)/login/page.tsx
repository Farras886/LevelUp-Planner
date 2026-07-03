import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk — LevelUp Planner",
  description:
    "Masuk ke akun LevelUp Planner kamu dan lanjutkan perjalanan produktivitas gamifikasimu.",
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Selamat Datang Kembali</h2>
        <p className="mt-1 text-sm text-slate-400">
          Masuk dan lanjutkan petualanganmu
        </p>
      </div>
      {/* Suspense diperlukan karena LoginForm menggunakan useSearchParams */}
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-white/5" />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
