import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar — LevelUp Planner",
  description:
    "Buat akun gratis dan mulai perjalanan produktivitas gamifikasi kamu bersama LevelUp Planner.",
};

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Buat Akun Baru</h2>
        <p className="mt-1 text-sm text-slate-400">
          Bergabung dan mulai level up produktivitasmu
        </p>
      </div>
      <RegisterForm />
    </>
  );
}
