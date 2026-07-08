"use client";

import { useEffect, useCallback } from "react";

/**
 * PWA Registration Component
 * - Register Service Worker
 * - Update badge counter berdasarkan task pending
 * - Request notification permission
 * - Handle SW updates
 */
export default function PWARegistration() {
  const updateBadge = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/tasks?date=${today}`);
      if (!res.ok) return;
      const json = await res.json();
      const pending = (json.data || []).filter(
        (t: { status: string }) => t.status !== "DONE"
      ).length;

      // Update badge di app icon
      if ("setAppBadge" in navigator) {
        if (pending > 0) {
          (navigator as Navigator & { setAppBadge: (n: number) => Promise<void> }).setAppBadge(pending);
        } else {
          (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge();
        }
      }

      // Kirim ke SW juga untuk badge update
      const sw = await navigator.serviceWorker.ready;
      sw.active?.postMessage({ type: "UPDATE_BADGE", count: pending });
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const registerSW = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        console.log("[PWA] Service Worker registered:", registration.scope);

        // Cek update SW
        registration.addEventListener("updatefound", () => {
          const newSW = registration!.installing;
          if (!newSW) return;

          newSW.addEventListener("statechange", () => {
            if (newSW.state === "installed" && navigator.serviceWorker.controller) {
              console.log("[PWA] New SW available, will activate on next visit");
              // Aktifkan langsung
              newSW.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        // Update badge saat app pertama buka
        updateBadge();

        // Update badge setiap 5 menit
        const badgeInterval = setInterval(updateBadge, 5 * 60 * 1000);
        return () => clearInterval(badgeInterval);
      } catch (err) {
        console.error("[PWA] SW registration failed:", err);
      }
    };

    registerSW();

    // Handle SW controller change (setelah update)
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    return () => {
      // Cleanup
    };
  }, [updateBadge]);

  // Component tidak render apa-apa — hanya side effects
  return null;
}
