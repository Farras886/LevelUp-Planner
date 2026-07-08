/**
 * LevelUp Planner — Service Worker
 * Handles: caching, offline support, push notifications, background sync
 */

const CACHE_VERSION = "v1.0.0";
const STATIC_CACHE = `levelup-static-${CACHE_VERSION}`;
const API_CACHE = `levelup-api-${CACHE_VERSION}`;

// Aset statis yang selalu di-cache
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/dashboard/calendar",
  "/dashboard/tasks",
  "/manifest.json",
  "/icons/icon-192x192.svg",
  "/icons/icon-512x512.svg",
];

// ==================== INSTALL ====================
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn("[SW] Some assets failed to cache:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ==================== ACTIVATE ====================
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    Promise.all([
      // Hapus cache lama
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name.startsWith("levelup-") &&
                name !== STATIC_CACHE &&
                name !== API_CACHE
            )
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      }),
      // Ambil kontrol semua tab
      self.clients.claim(),
    ])
  );
});

// ==================== FETCH (caching strategy) ====================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET dan external requests
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Skip Next.js internal routes
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // API routes — Network First (data harus selalu fresh)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE, 5000));
    return;
  }

  // Halaman app — Network First dengan fallback offline
  if (
    request.headers.get("accept")?.includes("text/html") ||
    url.pathname.startsWith("/dashboard")
  ) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // Aset statis lainnya — Cache First
  event.respondWith(cacheFirst(request));
});

/**
 * Network First: coba network, fallback ke cache
 */
async function networkFirst(request, cacheName = STATIC_CACHE, timeoutMs = 8000) {
  const cache = await caches.open(cacheName);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const networkResponse = await fetch(request, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Fallback offline page untuk HTML
    if (request.headers.get("accept")?.includes("text/html")) {
      return new Response(offlineHTML(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Offline", { status: 503 });
  }
}

/**
 * Cache First: ambil dari cache, update di background
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    // Background update
    fetch(request)
      .then((res) => {
        if (res.ok) cache.put(request, res);
      })
      .catch(() => {});
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

// ==================== PUSH NOTIFICATIONS ====================
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "LevelUp Planner", body: event.data.text() };
  }

  const options = {
    body: data.body || "Kamu punya task yang perlu diselesaikan!",
    icon: "/icons/icon-192x192.svg",
    badge: "/icons/icon-96x96.svg",
    image: data.image,
    tag: data.tag || "levelup-notification",
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/dashboard",
      taskId: data.taskId,
    },
    actions: [
      {
        action: "open",
        title: "Lihat Task",
      },
      {
        action: "dismiss",
        title: "Tutup",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "LevelUp Planner ⚡", options)
  );
});

// ==================== NOTIFICATION CLICK ====================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Fokus tab yang sudah ada
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ==================== BACKGROUND SYNC ====================
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    event.waitUntil(syncPendingTasks());
  }
});

async function syncPendingTasks() {
  try {
    // Ambil pending tasks dari IndexedDB jika ada
    // (untuk offline task creation)
    console.log("[SW] Background sync: syncing pending tasks");
  } catch (err) {
    console.error("[SW] Background sync failed:", err);
  }
}

// ==================== PERIODIC BACKGROUND SYNC ====================
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-reminder") {
    event.waitUntil(sendDailyReminder());
  }
});

async function sendDailyReminder() {
  try {
    const response = await fetch("/api/tasks?date=" + new Date().toISOString().split("T")[0]);
    const data = await response.json();
    const pendingCount = data?.data?.filter((t) => t.status !== "DONE").length ?? 0;

    if (pendingCount > 0) {
      await self.registration.showNotification("LevelUp Planner ⚡", {
        body: `Kamu punya ${pendingCount} task yang belum selesai hari ini!`,
        icon: "/icons/icon-192x192.svg",
        badge: "/icons/icon-96x96.svg",
        tag: "daily-reminder",
        data: { url: "/dashboard" },
      });
    }
  } catch (err) {
    console.error("[SW] Daily reminder failed:", err);
  }
}

// ==================== MESSAGE HANDLER ====================
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data?.type === "UPDATE_BADGE") {
    const count = event.data.count || 0;
    if ("setAppBadge" in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count).catch(() => {});
      } else {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  }
});

// ==================== OFFLINE HTML FALLBACK ====================
function offlineHTML() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LevelUp Planner — Offline</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0f;
      color: #e2e8f0;
      font-family: -apple-system, system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }
    .icon { font-size: 4rem; margin-bottom: 1.5rem; }
    h1 { font-size: 1.5rem; font-weight: 700; color: #a78bfa; margin-bottom: 0.5rem; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; max-width: 300px; }
    .btn {
      margin-top: 2rem;
      padding: 0.75rem 2rem;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="icon">⚡</div>
  <h1>Kamu sedang offline</h1>
  <p>LevelUp Planner membutuhkan koneksi internet untuk memuat data terbaru.</p>
  <button class="btn" onclick="window.location.reload()">Coba Lagi</button>
</body>
</html>`;
}
