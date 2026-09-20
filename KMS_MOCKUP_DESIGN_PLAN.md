# KMS Bank Sampah Pandawa Berjaya — Mockup Design & Implementation Plan

**Project**: Analisis Value Chain, Perancangan Arsitektur Teknologi, dan Usulan KMS Berbasis Pilar Smart Environment
**Institution**: Bank Sampah Pandawa Berjaya, RW 02, Banyumanik, Kota Semarang
**Timeline**: Minggu 3 (Prototipe, Usability Check & Finalisasi Makalah)
**Team Role**: Anggota 3 — Pengembang Prototipe & Pengujian Usabilitas

---

## 1. DESIGN READ

> **Reading this as:** Community-scale KMS web app for waste bank operators (pengurus, relawan, nasabah) in Semarang, with a **trust-first, accessible, mobile-first language**, leaning toward **Tailwind v4 + shadcn/ui + Motion** for a clean, functional interface that works on low-end smartphones and poor connectivity.

**Dials:**
- `DESIGN_VARIANCE: 4` — Predictable, symmetric layouts; trust over flair
- `MOTION_INTENSITY: 3` — Subtle transitions only; `prefers-reduced-motion` respected
- `VISUAL_DENSITY: 5` — Standard app spacing; data tables for transactions; cards for SOPs

**Constraints from brief:**
- Real organization, real users (pengurus RW, kader PKK, nasabah warga)
- Low budget, volunteer-run, community scale
- Must replace dual-track recording (Google Form + buku besar)
- Must digitize SOP pemilahan & harga jual (currently oral-only)
- Must give nasabah self-service saldo/riwayat access
- WhatsApp Business is the existing communication channel
- QR/barcode scanner for transaksi input
- Light/dark mode (nasabah may use at night)
- Accessibility: WCAG AA, large touch targets, Indonesian language

---

## 2. SYSTEM ACTORS & USER FLOWS

| Actor | Role | Primary Goals | Key Screens |
|-------|------|---------------|-------------|
| **Pengurus Pencatatan (Rosi Yusepta)** | Capture & Store | Input transaksi setor, kelola nasabah, update harga/SOP, verifikasi data | Dashboard, Transaksi Input, Kelola Nasabah, Kelola SOP & Harga |
| **Pengurus Umum / Ketua** | Share & Apply | Monitor operasional, lihat laporan, kelola pengurus, broadcast notifikasi | Dashboard, Laporan, Kelola Pengurus, Broadcast WA |
| **Relawan / Pengurus Baru** | Apply & Capture | Baca SOP pemilahan, cek harga terkini, input transaksi bimbingan | SOP Library, Harga Jual, Transaksi Input (guided) |
| **Nasabah Warga** | Share (view) | Cek saldo & riwayat setoran mandiri, terima notifikasi WA | Portal Nasabah (public link), Notifikasi WA |
| **Divisi Penimbangan & Pemilahan** | Apply | Scan QR nasabah, timbang, pilah, konfirmasi harga | Scanner Mode, Quick Entry |

---

## 3. MOCKUP SCREENS — 8 LAYAR UTAMA

### 3.1 Layar 1: Login & Role Select (Entry Point)
**Route:** `/login`  
**Actors:** Semua  
**Purpose:** Single entry, role-based redirect, remember device

```
┌─────────────────────────────────────┐
│  🏦 BANK SAMPAH PANDAWA BERJAYA     │
│  RW 02 • Banyumanik • Semarang      │
├─────────────────────────────────────┤
│                                     │
│  Masuk Sebagai:                     │
│  ┌───────────────────────────────┐  │
│  │ 👤 Pengurus / Relawan         │  │  → /dashboard (pengurus)
│  │    Email/WA + PIN             │  │     /scanner (relawan)
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 🏠 Nasabah                    │  │  → /nasabah/:id (public, no login)
│  │    Nomor Anggota / Scan QR    │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Bantuan] [Kontak Admin]           │
└─────────────────────────────────────┘
```

**States:** Loading (verifying), Error (wrong PIN), Empty (first visit → register prompt)

---

### 3.2 Layar 2: Dashboard Pengurus (Command Center)
**Route:** `/dashboard`  
**Actor:** Pengurus Pencatatan, Ketua  
**Purpose:** Ringkasan real-time, quick actions, alert bottleneck

```
┌─────────────────────────────────────┐
│  ≡  Bank Sampah Pandawa  👤 Rosi    │
│  ─────────────────────────────────  │
│  📊 RINGKASAN HARI INI              │
│  ┌─────────┬─────────┬─────────┐    │
│  │ 127     │ Rp2.4M  │  23     │    │
│  │ Transaksi│ Total   │ Nasabah │    │
│  │  Hari Ini│ Setoran | Aktif   │    │
│  └─────────┴─────────┴─────────┘    │
│  ─────────────────────────────────  │
│  ⚡ QUICK ACTIONS                   │
│  ┌──────────┐ ┌──────────┐ ┌──────┐ │
│  │ ➕ Setor │ │ 📋 SOP   │ │ 💰   │ │
│  │  Baru    │ │  & Harga │ │Harga │ │
│  └──────────┘ └──────────┘ └──────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────┐ │
│  │ 👥 Nasabah│ │ 📊 Laporan│ │ 🔔   │ │
│  │  Baru    │ │  Bulanan │ │Broadcast│ │
│  └──────────┘ └──────────┘ └──────┘ │
│  ─────────────────────────────────  │
│  ⚠ ALERT: 3 nasabah saldo beda >5%  │
│  [Lihat & Sinkronkan]               │
└─────────────────────────────────────┘
```

**Key Data Sources:** Firebase/Google Sheets real-time sync  
**Responsive:** Stack cards vertical on mobile; 3-col grid on tablet+

---

### 3.3 Layar 3: Input Transaksi Setor (Core Capture)
**Route:** `/transaksi/baru`  
**Actor:** Pengurus Pencatatan, Relawan (bimbingan)  
**Purpose:** Single unified input replacing Google Form + buku besar

```
┌─────────────────────────────────────┐
│  ←  Input Transaksi Setor           │
│  ─────────────────────────────────  │
│  📷 Scan QR Nasabah                 │
│  [____NSB-0042____] [📷 Scan]       │
│  ✓ Terverifikasi: Budi Santoso      │
│  Saldo Saat Ini: Rp 145.000         │
│  ─────────────────────────────────  │
│  🗂 JENIS SAMPAH (multi-select)     │
│  ┌────────────────────────────────┐ │
│  │ ☑ PET Botol      2.5 kg  @Rp3.5k│ │
│  │ ☑ Kardus         1.8 kg  @Rp2.0k│ │
│  │ ☐ Plastik Lain   0.0 kg  @Rp1.5k│ │
│  │ ☐ Logam          0.0 kg  @Rp8.0k│ │
│  │ ☐ Kertas         0.0 kg  @Rp1.8k│ │
│  └────────────────────────────────┘ │
│  💡 Harga otomatis dari master harga│
│  ─────────────────────────────────  │
│  📝 Catatan: _____________________  │
│  ─────────────────────────────────  │
│  TOTAL: Rp 12.350  │  [SIMPAN]     │
│  [Batal] [Simpan & Cetak Struk]     │
└─────────────────────────────────────┘
```

**Features:**
- QR scan → auto-fill nasabah + show current saldo
- Harga tarik dari master harga (editable by pengurus)
- Offline-first: queue to localStorage, sync when online
- Print struk via Bluetooth thermal printer (optional)
- Validation: min 1 jenis sampah, berat > 0

**States:** Loading (scan), Offline (queued), Success (toast + print), Error (sync failed)

---

### 3.4 Layar 4: Kelola Master Harga & SOP (Store Knowledge)
**Route:** `/master/harga-sop`  
**Actor:** Pengurus Pencatatan (Capture), Ketua (Approve)  
**Purpose:** Externalize tacit knowledge → explicit digital SOP & harga

```
┌─────────────────────────────────────┐
│  ←  Master Harga & SOP              │
│  ─────────────────────────────────  │
│  📋 TAB: [HARGA JUAL] [SOP PEMILAH] │
│  ─────────────────────────────────  │
│  💰 HARGA JUAL KE PENGEPUL          │
│  ┌────────────────────────────────┐ │
│  │ Jenis        │ Harga/kg │ Update│ │
│  │ PET Botol    │ Rp 3.500 │ 2h ago│ │
│  │ Kardus       │ Rp 2.000 │ 2h ago│ │
│  │ Plastik Lain │ Rp 1.500 │ 3d ago│ │
│  │ Logam        │ Rp 8.000 │ 1w ago│ │
│  │ Kertas       │ Rp 1.800 │ 1w ago│ │
│  └────────────────────────────────┘ │
│  [+ Tambah Jenis] [📥 Import CSV]   │
│  ─────────────────────────────────  │
│  📖 SOP PEMILAH SAMPAH              │
│  ┌────────────────────────────────┐ │
│  │ 📄 PET Botol                   │ │
│  │    • Pisah tutup & label       │ │
│  │    • Bersihkan isi, keringkan  │ │
│  │    • Peras, jangan dipotong    │ │
│  │    [Lihat Detail] [Edit]       │ │
│  │ ────────────────────────────── │ │
│  │ 📄 Kardus                      │ │
│  │    • Lipat rata, ikat rapat    │ │
│  │    • Pisahkan dari kertas lain │ │
│  │    • Jangan basah/berminyak    │ │
│  │    [Lihat Detail] [Edit]       │ │
│  └────────────────────────────────┘ │
│  [+ Tambah SOP] [📤 Export PDF]     │
└─────────────────────────────────────┘
```

**SOP Detail Modal:** Rich text + gambar (photo panduan), version history, siap dibagikan ke relawan baru

---

### 3.5 Layar 5: Kelola Nasabah (CRUD + Saldo Sync)
**Route:** `/nasabah`  
**Actor:** Pengurus Pencatatan  
**Purpose:** Single source of truth untuk data nasabah

```
┌─────────────────────────────────────┐
│  ←  Kelola Nasabah          [+Tambah]│
│  ─────────────────────────────────  │
│  🔍 Cari: _______________ [Filter]  │
│  ─────────────────────────────────  │
│  ┌────────────────────────────────┐ │
│  │ NSB-0042  Budi Santoso         │ │
│  │ 📍 RT 02/RW 02  📱 0812-xxxx   │ │
│  │ Saldo: Rp 145.000  │ ⚠ Sync    │ │
│  │ [Detail] [Edit] [Struk]        │ │
│  ├────────────────────────────────┤ │
│  │ NSB-0017  Siti Rahayu          │ │
│  │ 📍 RT 01/RW 02  📱 0857-xxxx   │ │
│  │ Saldo: Rp 89.500   │ ✓ Synced  │ │
│  │ [Detail] [Edit] [Struk]        │ │
│  └────────────────────────────────┘ │
│  ─────────────────────────────────  │
│  📊 247 Nasabah  |  23 Aktif Bulan  │
│  [Export Excel] [Cetak Kartu QR]    │
└─────────────────────────────────────┘
```

**Sync Indicator:** ⚠ = selisih Google Sheets vs DB > threshold; ✓ = sinkron  
**Detail Modal:** Riwayat transaksi lengkap, buku tabungan virtual, cetak ulang struk

---

### 3.6 Layar 6: Portal Nasabah (Public Self-Service)
**Route:** `/nasabah/:id` (public, no auth, shareable via WA)  
**Actor:** Nasabah Warga  
**Purpose:** Transparansi mandiri — jawab bottleneck "nasabah tidak cek saldo"

```
┌─────────────────────────────────────┐
│  🏦 Bank Sampah Pandawa Berjaya     │
│  ─────────────────────────────────  │
│  👤 Budi Santoso (NSB-0042)         │
│  📍 RT 02/RW 02, Martorejo          │
│  ─────────────────────────────────  │
│  💰 SALDO TABUNGAN: Rp 145.000      │
│  Terakhir update: 2 jam lalu        │
│  ─────────────────────────────────  │
│  📋 RIWAYAT SETORAN (6 bulan)       │
│  ┌────────────────────────────────┐ │
│  │ 19 Sep 2026  PET 2.5kg  Rp8.750│ │
│  │ 12 Sep 2026  Kardus 1.8kg Rp3.6k│ │
│  │ 05 Sep 2026  Logam 0.5kg  Rp4.0k│ │
│  │ 29 Agu 2026  PET 3.0kg  Rp10.5k│ │
│  │ ...                            │ │
│  └────────────────────────────────┘ │
│  [Tampilkan Semua] [Unduh PDF]      │
│  ─────────────────────────────────  │
│  📱 Bagikan via WhatsApp            │
│  🔔 Daftar Notifikasi Saldo         │
│  ❓ Butuh Bantuan? Hubungi 0812-xxx │
└─────────────────────────────────────┘
```

**Access:** Link unik per nasabah (UUID), dibagikan via WA broadcast  
**No login** — token di URL, expires 30 hari, regenerate dari dashboard pengurus

---

### 3.7 Layar 7: Scanner Mode (Divisi Penimbangan)
**Route:** `/scan` (PWA, full-screen camera)  
**Actor:** Divisi Penimbangan & Pemilahan  
**Purpose:** Fast-path input di lapangan, offline-capable

```
┌─────────────────────────────────────┐
│  📷 SCAN QR NASABAH                 │
│  ┌────────────────────────────────┐ │
│  │                                │ │
│  │        [████████████]          │ │  ← Camera preview
│  │      ┌──────────────────┐      │ │
│  │      │   QR CODE HERE   │      │ │
│  │      └──────────────────┘      │ │
│  │                                │ │
│  └────────────────────────────────┘ │
│  ─────────────────────────────────  │
│  ✓ NSB-0042  Budi Santoso           │
│  Saldo: Rp 145.000                  │
│  ─────────────────────────────────  │
│  ⚖ TIMBANG & PILAH                  │
│  [PET: 2.5 kg] [Kardus: 1.8 kg]     │
│  [+ Jenis Lain]                     │
│  ─────────────────────────────────  │
│  TOTAL: Rp 12.350  │  [SIMPAN]     │
│  [Kembali Scan]                     │
└─────────────────────────────────────┘
```

**Tech:** `html5-qrcode` or `@zxing/library` + `navigator.mediaDevices`  
**Offline:** Queue to IndexedDB, background sync via Service Worker

---

### 3.8 Layar 8: Broadcast Notifikasi WA (Share Layer)
**Route:** `/broadcast`  
**Actor:** Ketua / Pengurus Umum  
**Purpose:** Push saldo, harga baru, SOP update, jadwal penjemputan ke nasabah

```
┌─────────────────────────────────────┐
│  ←  Broadcast WhatsApp        [Kirim]│
│  ─────────────────────────────────  │
│  📝 TEMPLATE PESAN                  │
│  ┌────────────────────────────────┐ │
│  │ Halo {nama}, saldo tabungan    │ │
│  │ Anda saat ini: Rp {saldo}.     │ │
│  │ Riwayat: {link_portal}         │ │
│  │ Info harga terbaru: {link_sop} │ │
│  │ — Bank Sampah Pandawa Berjaya  │ │
│  └────────────────────────────────┘ │
│  ─────────────────────────────────  │
│  🎯 TARGET:                         │
│  (●) Semua nasabah aktif (23)       │
│  ( ) Nasabah saldo > Rp100k         │
│  ( ) RT 02 saja                     │
│  ( ) Custom: _______________        │
│  ─────────────────────────────────  │
│  📎 LAMPIRKAN:                      │
│  [ ] Link portal nasabah            │
│  [ ] PDF SOP terbaru                │
│  [ ] Jadwal penjemputan minggu ini  │
│  ─────────────────────────────────  │
│  📊 PREVIEW: 23 pesan, est. 45 detik│
│  [Kirim Sekarang] [Jadwalkan]       │
└─────────────────────────────────────┘
```

**Integration:** WhatsApp Business API (official) or `whatsapp-web.js` (self-hosted, lower cost)  
**Rate limit:** Respect WA limits (250 msg/day for unverified, 1000+ for verified)

---

## 4. INFORMATION ARCHITECTURE (SITEMAP)

```
/ (redirect to /login)
├── /login
├── /dashboard                 # Pengurus
│   ├── /transaksi/baru        # Input setor (Capture)
│   ├── /transaksi/riwayat     # List + filter + export
│   ├── /nasabah               # CRUD nasabah
│   │   └── /nasabah/:id       # Detail + riwayat + struk
│   ├── /master
│   │   ├── /harga             # Master harga jual
│   │   └── /sop               # SOP pemilahan (Store)
│   ├── /laporan               # Bulanan, tahunan, per RT
│   ├── /pengurus              # Kelola akses pengurus
│   └── /broadcast             # WA broadcast (Share)
├── /scan                      # Scanner mode (Apply)
├── /nasabah/:id               # Portal nasabah (public, Share)
├── /sop/:id                   # Detail SOP (public, Share)
└── /settings                  # Profil, notifikasi, theme
```

---

## 5. TECH STACK RECOMMENDATION

### 5.1 Frontend (Primary Recommendation)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | **React 19 + Vite** | Fast HMR, small bundle size, SPA ideal for offline-first PWA, built-in deployment to Vercel (free tier) |
| **Styling** | **Tailwind v4** | Zero-config, tiny bundle, dark mode native, utility-first matches team skill level |
| **Components** | **shadcn/ui** (copy-paste, not npm package) | Own the code, accessible by default (Radix), customizable, no vendor lock-in |
| **Icons** | **Lucide React** | Consistent stroke, tree-shakable, beautiful modern icons |
| **Animation** | **Tailwind `animate-in`** | Native CSS animations, lightweight, no extra library overhead |
| **Forms** | **React Hook Form** | Performant form state management |
| **State** | **React Context** (global) + **Custom Hooks** | Minimal boilerplate; custom implementation handles sync, offline queue |
| **PWA** | **vite-plugin-pwa** (Workbox) | Offline-first, installable, background sync for scanner queue |
| **QR/Barcode** | **html5-qrcode** (wrapper around ZXing) | Works in browser, no native dependency, supports camera selection |
| **Charts** | **Recharts** (lazy-loaded) | Only on dashboard/laporan; tree-shakable |
| **PDF Export** | **@react-pdf/renderer** (server) + **jspdf** (client) | Server for reports, client for struk nasabah |
| **Date/Time** | **date-fns** + **id-ID locale** | Lightweight, tree-shakable, Indonesian locale |

### 5.2 Backend / Data Layer (Low-Cost Community Scale)

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Firebase (Spark Plan)** | Free tier generous (1GB DB, 10GB hosting, Auth), real-time sync, offline SDK, Auth (email/phone/anon), Cloud Functions for WA bot | Vendor lock-in, NoSQL learning curve | **✅ PRIMARY** — Best fit for real-time sync + offline + free tier |
| **Supabase (Free)** | PostgreSQL, real-time, Auth, Edge Functions, S3 storage | 500MB DB, 2GB bandwidth | Good alternative if team prefers SQL |
| **Google Sheets + Apps Script** | Zero cost, familiar to pengurus, easy backup | No real-time, API quotas, no offline, auth manual | **FALLBACK** — Only if Firebase blocked |
| **PocketBase (self-hosted)** | Single binary, SQLite, Auth, Realtime, Admin UI | Need VPS (~$5/mo), maintenance | For full control, but adds infra burden |

**Decision:** **Firebase (Spark)** — Matches "layanan sederhana berbiaya rendah" requirement, real-time solves dual-track sync bottleneck, offline SDK solves connectivity issues at lapangan.

### 5.3 Firebase Data Model (Firestore)

```typescript
// collections/
users/                    // Pengurus & relawan (Auth UID)
  {uid}: { role: 'pencatatan'|'ketua'|'relawan', nama, wa, rt, createdAt }

nasabah/
  {id}: { kode: 'NSB-0042', nama, rt, rw, wa, saldo, qrToken, createdAt, updatedAt }

transaksi/
  {id}: { nasabahId, kodeNasabah, items: [{jenis, berat, hargaSatuan, subtotal}], total, petugasId, status: 'pending'|'synced', createdAt, syncedAt }

masterHarga/
  {jenis}: { nama, hargaPerKg, satuan: 'kg', updatedAt, updatedBy }

sop/
  {id}: { jenisSampah, judul, konten: [{tipe: 'text'|'image', value}], versi, updatedAt, updatedBy }

broadcastLog/
  {id}: { template, targetFilter, sentCount, failedCount, sentAt, sentBy }

syncLog/
  {id}: { entity: 'nasabah'|'transaksi', action: 'create'|'update', source: 'app'|'sheets', status: 'ok'|'conflict', resolvedAt }
```

### 5.4 WhatsApp Integration Strategy

| Approach | Cost | Complexity | Reliability | Recommendation |
|----------|------|------------|-------------|----------------|
| **WA Business API (Official)** | Free tier 1000 conv/mo, then $0.005 | Medium (Meta verification) | High, supported | **✅ PRIMARY** — If org can verify |
| **whatsapp-web.js (Self-hosted)** | Free (own server) | High (puppeteer, QR login, session mgmt) | Medium (ban risk) | Fallback if no verification |
| **WA Gateway SaaS (Fonnte, Wablas, etc.)** | ~Rp50k-100k/bulan | Low (REST API) | High | **✅ PRAGMATIC** — Low cost, reliable, Indonesian support |

**Recommendation:** Start with **Fonnte/Wablas** (Indonesian WA gateway, ~Rp50k/bulan, REST API, supports template messages, no verification needed). Migrate to official API when scale grows.

---

## 6. IMPLEMENTATION PLAN (3-Week Sprint → Mockup + Usability)

### Sprint 1: Foundation & Core Screens (Week 3, Day 1-3)
| Task | Owner | Output | Status |
|------|-------|--------|--------|
| Init Vite + React + Tailwind v4 | Dev | Running repo, component library | ✅ Selesai |
| Setup Firebase project (Auth, Firestore, Hosting) | Dev | Config files, security rules draft | ✅ Selesai |
| Build Layout + Navigation (responsive, dark mode) | Dev | `layout.tsx`, `Sidebar`, `Header` | ✅ Selesai |
| Build Login + Role Select screen | Dev | `/login` page, auth flow, role redirect | ✅ Selesai |
| Build Dashboard skeleton + metric cards | Dev | `/dashboard` with static data | ✅ Selesai |

### Sprint 2: Core Features — Transaksi & Nasabah (Week 3, Day 4-6)
| Task | Owner | Output | Status |
|------|-------|--------|--------|
| Build Input Transaksi (multi-select sampah, harga auto) | Dev | `/transaksi` — core Capture flow | ✅ Selesai |
| Build Nasabah CRUD + Detail | Dev | `/nasabah` | ✅ Selesai |
| Build Portal Nasabah (public, shareable link) | Dev | `/portal` | ✅ Selesai |
| Integrate html5-qrcode for Scanner mode | Dev | `/scan` PWA page | ✅ Selesai |
| Setup Offline mutation queue via IndexedDB | Dev | Optimistic updates, background sync | ✅ Selesai |

### Sprint 3: Knowledge Layer & Polish (Week 3, Day 7-9)
| Task | Owner | Output | Status |
|------|-------|--------|--------|
| Build Master Harga (CRUD) | Dev | `/katalog` | ✅ Selesai |
| Build SOP Library (rich text, images, versioning) | Dev | `/sop` | ✅ Selesai |
| Build Broadcast WA (template, target filter, preview) | Dev | `/broadcast` | ✅ Selesai |
| Build Laporan (bulanan, per RT, export) | Dev | `/laporan` | ✅ Selesai |
| PWA config: manifest, service worker, offline queue | Dev | Installable, offline-capable | ✅ Selesai |
| Polish: loading states, error boundaries, dark mode | Dev | WCAG AA checklist | ✅ Selesai |

### Sprint 4: Usability Testing & Iteration (Week 3, Day 10-12)
| Task | Owner | Output | Status |
|------|-------|--------|--------|
| Recruit 5-8 respondents (2 pengurus, 2 relawan, 2 nasabah, 1 ketua) | Anggota 3 | Consent forms, test script | 🔄 Ongoing |
| Conduct moderated usability sessions (45 min each) | Anggota 3 | Recordings, notes, SUS scores | ⏳ Pending |
| Analyze findings: task success rate, time, errors, satisfaction | Anggota 3 | Usability report | ⏳ Pending |
| Prioritize & implement quick fixes (high impact, low effort) | Dev | Patched prototype | ⏳ Pending |
| Prepare final mockup screenshots + flow diagrams for makalah | Anggota 3 | Lampiran mockup PDF | ⏳ Pending |
| Compile final makalah (Anggota 3) | All | PDF siap submit | ⏳ Pending |
| **Deliverable:** Usability report + Final mockup + Makalah PDF | | |

---

## 7. USABILITY TESTING PLAN

### 7.1 Test Objectives
1. **Task Success Rate** — Can users complete core flows without help?
2. **Time on Task** — How long for each critical path?
3. **Error Rate** — Wrong inputs, missed steps, confusion points
4. **SUS Score** — System Usability Scale (10-item questionnaire)
5. **Qualitative Feedback** — Pain points, suggestions, mental model gaps

### 7.2 Test Scenarios (5 Critical Tasks)

| # | Scenario | Actor | Success Criteria | Target Time |
|---|----------|-------|------------------|-------------|
| 1 | **Input transaksi setor baru** — Scan QR nasabah, pilih PET 2kg + Kardus 1kg, simpan, cek saldo terupdate | Pengurus Pencatatan | Data tersimpan, saldo nasabah update, struk muncul | < 60 detik |
| 2 | **Cek saldo mandiri sebagai nasabah** — Buka link WA, lihat saldo & riwayat 3 bulan terakhir | Nasabah | Saldo benar, riwayat lengkap, bisa unduh PDF | < 45 detik |
| 3 | **Baca SOP pemilahan PET** — Buka SOP library, buka detail PET, baca langkah-langkah | Relawan Baru | Menemukan SOP < 30 detik, konten jelas, gambar terbuka | < 30 detik |
| 4 | **Update harga jual Kardus** — Buka master harga, ubah Kardus jadi Rp2.200, simpan, verifikasi di input transaksi | Pengurus Pencatatan | Harga update, input transaksi pakai harga baru | < 45 detik |
| 5 | **Broadcast notifikasi harga baru ke nasabah** — Buat broadcast, pilih template, target semua nasabah aktif, kirim | Ketua | 23 pesan terkirim, log sukses, nasabah terima WA | < 3 menit |

### 7.3 Respondent Profile (Target 8 Orang)

| # | Peran | Kriteria | Jumlah |
|---|-------|----------|--------|
| 1 | Pengurus Pencatatan (Rosi) | Pengalaman 1+ tahun, pakai smartphone daily | 1 |
| 2 | Pengurus Pencatatan (cadangan) | Baru < 6 bln, butuh bimbingan SOP | 1 |
| 3 | Relawan Penimbangan | Fisik kerja di lapangan, kurang familiar digital | 2 |
| 4 | Nasabah Aktif | Setor rutin 2x/bulan, punya WA, usia 35-55 | 2 |
| 5 | Nasabah Baru | Baru daftar < 3 bln, belum cek saldo mandiri | 1 |
| 6 | Ketua / Pengurus Umum | Bertanggung jawab laporan & koordinasi | 1 |

### 7.4 Test Protocol (Per Session: 45 menit)
1. **Briefing (5 min)** — Explain purpose, think-aloud, no wrong answers, recording consent
2. **Warm-up (3 min)** — Explore dashboard freely
3. **Task 1-5 (30 min)** — One by one, observer notes: success/fail, time, errors, quotes
4. **SUS Questionnaire (3 min)** — 10 items, 5-point Likert
5. **Debrief (4 min)** — "Apa yang paling bikin bingung?" "Fitur apa yang paling membantu?"

### 7.5 Metrics & Reporting Template

```
USABILITY TEST REPORT — Bank Sampah Pandawa KMS
Date: 2026-09-XX | Tester: Anggota 3 | Respondents: 8

TASK SUCCESS RATE
├── Task 1 (Input Transaksi): 7/8 (87.5%) — 1 fail: scan QR gagal lighting
├── Task 2 (Cek Saldo Nasabah): 8/8 (100%) — All success
├── Task 3 (Baca SOP): 6/8 (75%) — 2 fail: nav SOP tidak intuitif
├── Task 4 (Update Harga): 7/8 (87.5%) — 1 fail: tombol simpan tidak terlihat
└── Task 5 (Broadcast WA): 5/8 (62.5%) — 3 fail: template confusing, target filter unclear

AVG TIME ON TASK
├── Task 1: 52s (target 60s) ✓
├── Task 2: 38s (target 45s) ✓
├── Task 3: 41s (target 30s) ✗
├── Task 4: 39s (target 45s) ✓
└── Task 5: 4m 12s (target 3m) ✗

SUS SCORE (n=8)
Mean: 78.1 / 100 (Good — Grade B)
Range: 65 - 90
Items terendah: "Sistem ini terlalu kompleks" (3.2), "Butuh bantuan teknis" (3.5)

TOP 5 FINDINGS & FIXES
1. [HIGH] Navigasi SOP tersembunyi di tab → Move to bottom nav / floating action
2. [HIGH] Broadcast template terlalu teknis → Simplify to 3-step wizard
3. [MED] Scanner QR butuh cahaya baik → Add manual input fallback + torch toggle
4. [MED] Sync indicator (⚠/✓) tidak jelas → Add tooltip + color legend
5. [LOW] Dark mode default di siang hari → Respect system preference, add toggle
```

---

## 8. MOCKUP DELIVERABLES FOR MAKALAH

### 8.1 Required Diagrams (Per Rubrik Anggota 3)
| Diagram | Description | Format |
|---------|-------------|--------|
| **Diagram 5** | Wireframe/Mockup antarmuka — minimal 5 layar utama (Login, Dashboard, Input Transaksi, Portal Nasabah, SOP Library) | Figma frames → PNG/PDF |
| **Diagram 6** | Diagram alur pengujian usabilitas (user flow) — skenario tugas, responsden, metrik | Draw.io / Mermaid → PNG/PDF |

### 8.2 Suggested Mockup Export Checklist
- [ ] 8 screens @ 375px (mobile) + 768px (tablet) + 1440px (desktop)
- [ ] Light + Dark mode for each
- [ ] Key states: empty, loading, error, success
- [ ] Annotated with callouts linking to bottleneck (Tabel 2.4)
- [ ] Exported as single PDF appendix: `Lampiran_Mockup_KMS.pdf`

---

## 9. RISK MITIGATION (Mockup Phase)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Firebase Spark quota exceeded during testing | Low | Medium | Use emulator locally; seed test data < 100 docs |
| QR scanner fails on old Android (WebView) | Medium | High | Test on target devices; provide manual kode input fallback |
| WA gateway blocked / rate limited | Low | High | Test with small batch first; have manual WA fallback |
| Respondents no-show for usability test | Medium | Medium | Recruit 12, target 8; offer snack/transport reimbursement |
| Scope creep: "tambah fitur X" from pengurus | High | Medium | Freeze scope Day 1; park ideas for v2 backlog |

---

## 10. FILE STRUCTURE (Vite + React SPA)

```
kms-pandawa/
├── src/
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       └── Layout.tsx
│   ├── context/
│   │   ├── AuthContext.tsx            # Autentikasi & Role
│   │   └── DataContext.tsx            # Manipulasi data (CRUD)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useData.ts
│   ├── lib/
│   │   ├── firebase.ts                # Firebase config
│   │   ├── offline.ts                 # IndexedDB Background Sync
│   │   └── utils.ts
│   ├── pages/
│   │   ├── LoginPage.tsx              # Login + Role Select
│   │   ├── DashboardPage.tsx          # Statistik
│   │   ├── TransaksiPage.tsx          # Input Penimbangan
│   │   ├── NasabahPage.tsx            # Data Nasabah
│   │   ├── KatalogPage.tsx            # Harga Pengepul
│   │   ├── SopPage.tsx                # SOP Pemilahan
│   │   ├── LaporanPage.tsx            # Laporan
│   │   ├── BroadcastPage.tsx          # Push Notifikasi
│   │   ├── ScannerPage.tsx            # Kamera QR
│   │   ├── NasabahPortalPage.tsx      # Portal Nasabah (Auth)
│   │   └── PublicNasabahPortal.tsx    # Portal Public
│   ├── types/
│   │   └── index.ts                   # Interfaces
│   ├── App.tsx                        # React Router DOM config
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Tailwind v4 globals
├── public/
│   └── icons/                         # PWA Icons
├── .env.example
├── vercel.json                        # Vercel SPA Routing configuration
└── vite.config.ts                     # Vite + PWA configs
```

---

## 11. QUICK START COMMANDS

```bash
# 1. Install dependencies
npm install

# 2. Setup env variables
cp .env.example .env.local
# Edit file .env.local

# 3. Generate PWA Icons
node generate-icons.mjs

# 4. Start Development Server
npm run dev

# 5. Build for Production
npm run build
npm run preview
```

---

## 12. HANDOFF CHECKLIST (Untuk Anggota 3 Compile Makalah)

- [ ] Mockup screenshots (8 layar × 3 breakpoint × 2 theme = 48 images) → compress to < 5MB total
- [ ] User flow diagram (Mermaid/Draw.io) → export PNG + source file
- [ ] Usability test script (this doc Section 7.2-7.4)
- [ ] Usability report template (Section 7.5) — fill after testing
- [ ] SUS questionnaire (Indonesian translation)
- [ ] Consent form template
- [ ] Tech stack decision log (this doc Section 5) — include in metodologi
- [ ] Implementation timeline (this doc Section 6) — include in hasil & pembahasan
- [ ] Link to live prototype (Vercel preview) — for presentation demo
- [ ] GitHub repo (private) — for code evidence

---

## 13. NEXT STEPS FOR ANGGOTA 3

1. **Hari 1-2**: Setup project Next.js + Firebase + shadcn/ui, build Layout + Login + Dashboard skeleton
2. **Hari 3-4**: Build Input Transaksi (scan QR, multi-select, offline queue) + Nasabah CRUD + Portal Nasabah
3. **Hari 5**: Build Master Harga + SOP Library + Scanner Mode + Broadcast WA
4. **Hari 6**: Polish (loading, empty, error, a11y, dark mode, PWA)
5. **Hari 7**: Recruit respondents, run usability tests (5-8 sessions, 45 min each)
6. **Hari 8**: Analyze data, write usability report, implement quick fixes
7. **Hari 9**: Export mockups, create diagrams, compile final PDF
8. **Hari 10**: Final review with team, submit makalah + lampiran + slide presentasi

---

**Catatan:** Dokumen ini adalah rencana implementasi teknis untuk minggu 3. Desain visual (warna, tipografi, spacing) mengikuti design system Tailwind + shadcn/ui default dengan customisasi brand Bank Sampah Pandawa (hijau lingkungan `#166534` sebagai accent, zinc untuk netral). Semua komponen aksesibel, mobile-first, dan siap diuji usability dengan pengguna nyata.

---

*Generated for: Kelompok 3 — Azka Aqylla Maulana, Adel Rayyan Hakim, Azka Wayasy Al Hafizh*
*Course: Sistem Informasi / Analisis & Perancangan Enterprise*
*Institution: Fakultas Sains dan Matematika, Universitas Diponegoro*
*Date: September 2026*