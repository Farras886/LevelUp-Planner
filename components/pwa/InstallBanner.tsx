"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Install Banner — muncul di bagian bawah halaman jika app belum di-install
 * Tersembunyi otomatis jika sudah diinstall (display: standalone)
 */
export default function InstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Cek apakah sudah dalam mode standalone (sudah diinstall)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Cek apakah pernah dismiss
    const wasDismissed = localStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      // iOS tidak support beforeinstallprompt, tampilkan instruksi manual
      setTimeout(() => setIsVisible(true), 3000);
      return;
    }

    // Listen for install prompt (Android Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Cek apakah sudah diinstall
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsVisible(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsVisible(false);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (isInstalled || dismissed || !isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
      style={{
        animation: "slideUp 0.4s ease-out forwards",
      }}
    >
      {/* Backdrop blur */}
      <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-[#1a0a2e]/95 to-[#0a0a1f]/95 shadow-2xl shadow-violet-500/20 backdrop-blur-xl">
        <div className="p-5">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Pasang LevelUp Planner</h3>
                <p className="text-xs text-slate-400">
                  Akses cepat dari layar utama HP kamu
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-slate-500 hover:text-slate-300"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          {/* Features */}
          <div className="mb-4 flex gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-violet-400">📱</span> Fullscreen
            </div>
            <div className="flex items-center gap-1">
              <span className="text-violet-400">🔔</span> Notifikasi
            </div>
            <div className="flex items-center gap-1">
              <span className="text-violet-400">📶</span> Offline
            </div>
            <div className="flex items-center gap-1">
              <span className="text-violet-400">⚡</span> Lebih cepat
            </div>
          </div>

          {/* Actions */}
          {isIOS ? (
            // iOS: tampilkan instruksi manual
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="mb-2 text-xs font-medium text-slate-300">
                Cara pasang di iPhone/iPad:
              </p>
              <ol className="space-y-1 text-xs text-slate-400">
                <li>1. Ketuk tombol <span className="text-white font-medium">⎙ Share</span> di Safari</li>
                <li>2. Pilih <span className="text-white font-medium">"Add to Home Screen"</span></li>
                <li>3. Ketuk <span className="text-violet-400 font-medium">Add</span> ✓</li>
              </ol>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-medium text-slate-400 transition-all hover:border-white/20 hover:text-white"
              >
                Nanti saja
              </button>
              <button
                id="pwa-install-btn"
                onClick={handleInstall}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500"
              >
                📲 Pasang Sekarang
              </button>
            </div>
          )}
        </div>

        {/* Progress bar decorative */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600" />
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
