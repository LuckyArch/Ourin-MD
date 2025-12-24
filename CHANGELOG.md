# Changelog

Semua perubahan penting pada OurinAI akan dicatat di file ini.

---

## [1.2.0] - 2025-12-24

### Fitur Baru

**Sistem Auto Backup**
- Database dibackup otomatis setiap 24 jam
- Backup lama dihapus otomatis setelah 7 hari
- Folder backup terpisah di `backups/`
- Bisa restore dari backup kapan saja

**Sistem Auto Reconnect**
- Bot otomatis reconnect jika koneksi terputus
- Menggunakan exponential backoff (delay bertambah)
- Maksimal 10 percobaan reconnect
- Log yang jelas untuk setiap percobaan

**Sistem Welcome/Goodbye Modular**
- Plugin terpisah: `welcome.js` dan `goodbye.js`
- Pesan welcome yang heboh dengan dekorasi
- Toggle on/off per grup dengan `.welcome on/off`
- Full contextInfo dengan thumbnail dan newsletter

**Konfigurasi Disederhanakan**
- `config.js` lebih mudah dibaca dan dipahami
- Mode bot hanya 2: `self` dan `public`
- Bagian wajib diubah ditandai dengan jelas
- Komentar detail dalam bahasa Indonesia

### Perubahan

- Mode bot disederhanakan: `group` dan `private` dihapus
- `self` mode sekarang cek `fromMe` bukan hanya owner
- Handler groupHandler menggunakan fungsi modular dari plugin
- Package.json version: 1.1.0 → 1.2.0

### File Baru
- `src/lib/reconnect.js` - Auto reconnect system
- `src/lib/backup.js` - Auto backup system
- `plugins/group/welcome.js` - Welcome message modular
- `plugins/group/goodbye.js` - Goodbye message modular

### File Diubah
- `config.js` - Disederhanakan dan ditata ulang
- `index.js` - Integrasi backup dan reconnect
- `src/handler.js` - Modular welcome/goodbye, simplified mode check

---

## [1.1.0] - 2025-12-23

### Fitur Baru

**Integrasi LowDB**
- Migrasi dari custom JSON ke LowDB
- Realtime synchronization
- Async initialization

**LID Mapping**
- Konversi otomatis @lid ke nomor telepon
- Support untuk mentions dan quoted messages
- Helper functions di `lidHelper.js`

**Auto-Owner Detection**
- Nomor bot otomatis terdeteksi saat koneksi
- Ditambahkan ke daftar owner secara otomatis

**Self Mode**
- Command `.self on/off` untuk toggle
- Hanya bot sendiri yang bisa akses saat aktif

**Scheduler System**
- Reset limit harian jam 00:00
- Scheduled messages dengan `.schedule`
- Persistent storage untuk jadwal

**EXIF + FFmpeg Integration**
- Sticker dengan metadata lengkap
- Video to WebP dengan contain mode
- node-webpmux untuk EXIF injection

### Dependencies Ditambahkan
- `lowdb@^7.0.1`
- `node-webpmux@^3.2.1`

---

## [1.0.0] - Rilis Awal

### Fitur

- Multi-device WhatsApp connection
- Sistem plugin modular dengan hot-reload
- Anti-spam dan anti-call protection
- Welcome/leave messages untuk group
- Owner, premium, dan banned user management
- Command limits dan cooldowns
- Multiple operating modes
- Custom logger dengan tema futuristik

### Plugins Awal
- **main**: menu, ping, runtime, infobot, owner
- **owner**: broadcast, listowner, listprem, setmode
- **utility**: profile, sticker
- **fun**: dice, flip
