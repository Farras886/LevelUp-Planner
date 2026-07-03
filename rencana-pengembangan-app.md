# Rencana Pengembangan: Aplikasi Produktivitas Kalender + Gamifikasi

Dokumen ini berisi rekomendasi tech stack, arsitektur sistem, skema database, breakdown fitur MVP, dan roadmap pengembangan untuk personal project kalender produktivitas dengan sistem leveling (gamifikasi).

---

## 1. Rekomendasi Tech Stack

### Frontend
- **React + TypeScript** — component-based, ekosistem besar, banyak library kalender siap pakai (`react-big-calendar`, `FullCalendar`, atau custom dengan `date-fns`).
- **Tailwind CSS** — untuk membangun GUI bersih & konsisten tanpa ribet nulis CSS dari nol. Cocok juga untuk elemen gamifikasi (progress bar, badge, animasi level-up).
- **Zustand atau Redux Toolkit** — state management. Untuk skala awal, Zustand lebih ringan dan mudah dipahami.
- **Framer Motion** — untuk animasi micro-interaction (level up, EXP bar fill, efek saat task selesai) agar app terasa "hidup".

### Backend
- **Node.js + Express** atau **NestJS** (struktur lebih rapi sejak awal — modul, DI, cocok untuk scalability jangka panjang).
- Alternatif: **Next.js full-stack** (App Router + API routes/Server Actions) agar frontend-backend jadi satu codebase — sangat cocok untuk personal project solo dev.

### Database
- **PostgreSQL** — relational, cocok untuk data terstruktur (user, task, exp log), mudah di-scale ke fitur kompleks nanti (streak, achievement, dll).
- **ORM: Prisma** — DX sangat baik untuk TypeScript, auto-generate types, migration mudah.

### Auth
- **NextAuth.js / Auth.js** (jika pakai Next.js), atau **Clerk / Supabase Auth** untuk setup cepat tanpa membangun sistem auth dari nol.

### Rekomendasi Stack Simpel untuk Mulai
> **Next.js (App Router) + TypeScript + Tailwind + Prisma + PostgreSQL + NextAuth**

Satu ekosistem, minim context-switching, dan scalable untuk pengembangan fitur ke depan.

---

## 2. System Architecture & Database Schema

### Arsitektur Dasar (Modular Monolith)

```
Client (Next.js React Components)
        │
        ▼
API Layer (Next.js Route Handlers / NestJS Controllers)
        │
        ▼
Service Layer (business logic: EXP calculation, leveling rules)
        │
        ▼
Data Layer (Prisma ORM)
        │
        ▼
PostgreSQL Database
```

**Kenapa modular monolith, bukan microservices?**
Untuk personal project solo, microservices menambah kompleksitas operasional (deployment, networking) tanpa benefit nyata di skala ini. Service layer yang sudah terpisah rapi memudahkan pemecahan ke microservices nanti jika diperlukan.

### Skema Database (Inti)

```sql
-- USERS
User {
  id            UUID PK
  email         String  UNIQUE
  username      String
  password_hash String
  avatar_url    String?
  created_at    DateTime
}

-- LEVELING / GAMIFICATION
UserStats {
  id            UUID PK
  user_id       UUID FK -> User.id (1-1)
  level         Int      DEFAULT 1
  current_exp   Int      DEFAULT 0
  exp_to_next   Int      DEFAULT 100   -- bisa dihitung via formula juga
  total_exp     Int      DEFAULT 0
  streak_count  Int      DEFAULT 0
  last_active   DateTime?
}

ExpLog {
  id          UUID PK
  user_id     UUID FK
  task_id     UUID FK?
  exp_gained  Int
  reason      String    -- "task_completed", "streak_bonus", dll
  created_at  DateTime
}

-- TASK MANAGEMENT
Task {
  id          UUID PK
  user_id     UUID FK
  title       String
  description String?
  category_id UUID FK?
  due_date    DateTime
  is_recurring Boolean  DEFAULT false
  recurrence_rule String?  -- misal RRULE format
  priority    Enum(LOW, MEDIUM, HIGH)
  status      Enum(PENDING, IN_PROGRESS, DONE)
  exp_reward  Int       DEFAULT 10
  completed_at DateTime?
  created_at  DateTime
  updated_at  DateTime
}

Category {
  id       UUID PK
  user_id  UUID FK
  name     String
  color    String   -- hex code untuk UI
}
```

### Catatan Desain Penting
- Pisahkan `ExpLog` dari `Task` — memberi audit trail lengkap (kapan & kenapa user dapat EXP), berguna untuk fitur analytics/statistik nanti.
- Formula leveling sebaiknya dihitung di service layer, bukan hardcode di DB. Contoh sederhana:
  ```
  exp_to_next = 100 * level^1.5
  ```
  (exponential curve — makin tinggi level, makin susah naik — membuat gamifikasi terasa lebih "berarti").

---

## 3. Core Features Breakdown (MVP)

Fokus MVP: **jangan coba bikin semua fitur sekaligus.** Prioritaskan loop inti dulu: *buat task → selesaikan task → dapat reward*.

### Harus Ada di MVP
1. Auth (register/login sederhana)
2. Kalender view (bulanan minimal) — tampilkan task per tanggal
3. CRUD Task dasar (create, edit, delete, mark as done)
4. EXP system dasar — task selesai = dapat EXP tetap (misal 10 exp)
5. Level up logic + UI feedback (progress bar EXP, notifikasi/animasi saat naik level)
6. Dashboard sederhana — tampilkan level, EXP saat ini, task hari ini

### Ditunda Dulu (Fase Berikutnya)
- Recurring tasks / repeat rules
- Kategori & warna custom
- Streak system
- Achievement/badge system
- Kolaborasi/sharing task
- Notifikasi/reminder
- Statistik & analytics mendalam

**Alasan ditunda:** fitur-fitur ini menambah kompleksitas schema & logic signifikan, dan tidak esensial untuk memvalidasi apakah "loop gamifikasi" terasa menyenangkan dipakai sehari-hari. Validasi loop dulu, baru perluas.

---

## 4. Step-by-Step Development Roadmap

### Tahap 0 — Setup (1-2 hari)
1. Init project: `npx create-next-app@latest` dengan TypeScript + Tailwind
2. Setup PostgreSQL (lokal via Docker, atau Supabase/Neon untuk gratis & langsung cloud)
3. Setup Prisma, buat schema awal, jalankan migration pertama
4. Setup struktur folder (`/app`, `/components`, `/lib`, `/services`, `/prisma`)

### Tahap 1 — Auth & User Foundation (2-3 hari)
5. Implementasi NextAuth/Clerk untuk register & login
6. Buat `UserStats` otomatis ter-generate saat user baru daftar (default level 1, exp 0)

### Tahap 2 — Task Management Core (4-5 hari)
7. Buat API/route handler untuk CRUD Task
8. Buat UI form tambah/edit task (title, due date, description)
9. Buat halaman kalender dasar yang menampilkan task per tanggal (`react-big-calendar` atau grid custom)
10. Implementasi mark-as-done pada task

### Tahap 3 — Gamification Engine (3-4 hari)
11. Bangun service function `calculateExp()` dan `checkLevelUp()` di service layer
12. Hook ini ke event "task completed" — setiap task selesai, trigger EXP gain + cek level up
13. Simpan log ke `ExpLog`
14. Buat UI: EXP progress bar + animasi level-up (Framer Motion untuk efek "pop"/confetti ringan)

### Tahap 4 — Dashboard & Polish (2-3 hari)
15. Buat halaman dashboard: level, EXP bar, ringkasan task hari ini
16. Testing manual end-to-end: buat task → selesaikan → cek exp & level naik dengan benar
17. Polish UI/UX: pastikan alur "tambah task → selesaikan → lihat reward" terasa smooth dan tidak ada friksi

### Tahap 5 — Deploy MVP
18. Deploy ke Vercel (frontend+API jika pakai Next.js) + database di Supabase/Neon/Railway
19. Testing di device nyata, kumpulkan feedback dari diri sendiri dulu (dogfooding) selama beberapa hari sebelum lanjut ke fitur baru

---

## Estimasi Total Waktu MVP
**~15-20 hari kerja** (fleksibel tergantung intensitas dan familiaritas dengan stack).
