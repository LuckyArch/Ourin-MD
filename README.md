# 🤖 OurinAI - WhatsApp Bot

<p align="center">
  <img src="https://img.shields.io/badge/version-1.1.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg" alt="Node">
  <img src="https://img.shields.io/badge/license-ISC-yellow.svg" alt="License">
</p>

<p align="center">
  <b>Bot WhatsApp Multi-Device dengan sistem plugin modular</b><br>
  Dibuat dengan ❤️ oleh Lucky Archz
</p>

---

## 📖 Daftar Isi

1. [Apa itu OurinAI?](#-apa-itu-ourinai)
2. [Fitur Unggulan](#-fitur-unggulan)
3. [Persyaratan Sistem](#-persyaratan-sistem)
4. [Panduan Instalasi](#-panduan-instalasi)
5. [Konfigurasi Bot](#-konfigurasi-bot)
6. [Cara Menjalankan Bot](#-cara-menjalankan-bot)
7. [Daftar Command](#-daftar-command)
8. [Cara Membuat Plugin](#-cara-membuat-plugin)
9. [Struktur Folder](#-struktur-folder)
10. [Troubleshooting](#-troubleshooting)
11. [FAQ](#-faq)

---

## 🤔 Apa itu OurinAI?

**OurinAI** adalah bot WhatsApp yang berjalan di komputer/server kamu dan terhubung ke nomor WhatsApp kamu. Bot ini bisa:

- Merespon pesan secara otomatis
- Membuat sticker dari gambar/video
- Mengirim pesan terjadwal
- Mengelola grup WhatsApp
- Dan masih banyak lagi!

**Penting untuk diketahui:**
- Bot ini menggunakan nomor WhatsApp kamu sendiri
- Nomor yang digunakan akan menjadi "bot" yang merespon pesan
- Bisa dijalankan 24/7 di server/VPS atau komputer yang menyala terus

---

## ✨ Fitur Unggulan

### 🔌 Multi-Device Support
Bot ini menggunakan teknologi WhatsApp Multi-Device, artinya:
- Tidak perlu scan QR berulang kali
- Tetap terhubung walaupun HP mati
- Sesi tersimpan di folder `sessions/`

### 🧩 Sistem Plugin Modular
- Setiap command adalah file terpisah
- Mudah menambah/menghapus fitur
- Hot-reload: edit plugin tanpa restart bot

### 💾 Database LowDB
- Menyimpan data user, grup, dan pengaturan
- Realtime sync (langsung tersimpan)
- Format JSON yang mudah dibaca

### 🔒 Sistem Permission
- **Owner**: Akses penuh ke semua fitur
- **Premium**: Limit lebih tinggi, fitur eksklusif
- **Banned**: Tidak bisa menggunakan bot

### ⏰ Scheduler (Penjadwalan)
- Reset limit harian otomatis jam 00:00
- Kirim pesan terjadwal ke siapa saja
- Bisa repeat harian

### 🖼️ Sticker Maker
- Convert gambar ke sticker
- Convert video ke sticker animasi
- Custom packname dan author
- Tidak crop (gambar utuh)

---

## 💻 Persyaratan Sistem

### Wajib Ada:
| Software | Versi Minimum | Cara Cek |
|----------|---------------|----------|
| Node.js | 18.0.0 atau lebih baru | `node --version` |
| NPM | 8.0.0 atau lebih baru | `npm --version` |
| Git | Versi apapun | `git --version` |

### Opsional (Sudah Di-handle Bot):
- FFmpeg untuk convert video (auto-install)
- Sharp untuk manipulasi gambar (auto-install)

### Sistem Operasi:
- ✅ Windows 10/11
- ✅ Linux (Ubuntu, Debian, CentOS)
- ✅ macOS
- ✅ Termux (Android)
- ✅ VPS/Server

### Spesifikasi Minimum:
- RAM: 512 MB (1 GB recommended)
- Storage: 500 MB free space
- Internet: Stabil

---

## 📥 Panduan Instalasi

### Langkah 1: Install Node.js

**Windows:**
1. Buka https://nodejs.org/
2. Download versi "LTS" (yang warna hijau)
3. Jalankan installer, klik Next sampai selesai
4. Buka Command Prompt, ketik `node --version`
5. Jika muncul versi (misal v18.17.0), berarti sukses

**Linux/Ubuntu:**
```bash
# Update package list
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Cek versi
node --version
npm --version
```

**Termux (Android):**
```bash
pkg update
pkg install nodejs git
```

---

### Langkah 2: Download OurinAI

**Cara 1: Menggunakan Git (Recommended)**
```bash
# Clone repository
git clone https://github.com/LuckyArchz/Ourin-MD.git

# Masuk ke folder
cd Ourin-MD
```

**Cara 2: Download ZIP**
1. Buka https://github.com/LuckyArchz/Ourin-MD
2. Klik tombol hijau "Code"
3. Pilih "Download ZIP"
4. Extract ke folder pilihan kamu
5. Buka terminal/command prompt di folder tersebut

---

### Langkah 3: Install Dependencies

Dependencies adalah package/library yang dibutuhkan bot untuk berjalan.

```bash
# Install semua dependencies
npm install
```

**Apa yang di-install?**
- `@rexxhayanasi/elaina-baileys` - Library WhatsApp
- `lowdb` - Database
- `node-webpmux` - Manipulasi sticker
- `fluent-ffmpeg` - Convert video
- `@ffmpeg-installer/ffmpeg` - FFmpeg binary
- `sharp` - Manipulasi gambar
- `axios` - HTTP requests
- `pino` - Logger
- Dan lainnya...

**Catatan:** Proses ini bisa memakan waktu 2-5 menit tergantung koneksi internet.

---

### Langkah 4: Konfigurasi Bot

Buka file `config.js` dan edit bagian-bagian penting:

```javascript
// Informasi Owner - WAJIB DIISI!
owner: {
    name: 'Nama Kamu',
    number: ['628xxxxxxxxxx'],  // Ganti dengan nomor WhatsApp kamu
                                // Format: 628 (Indonesia) + nomor tanpa 0
                                // Contoh: 6281234567890
}
```

**Format Nomor:**
- ❌ 081234567890 (salah)
- ❌ +6281234567890 (salah)
- ✅ 6281234567890 (benar)

---

## ⚙️ Konfigurasi Bot

File `config.js` berisi semua pengaturan bot. Berikut penjelasan lengkapnya:

### Informasi Bot
```javascript
bot: {
    name: 'Ourin-AI',           // Nama bot yang tampil di menu
    version: '1.1.0',           // Versi bot
    description: 'WhatsApp Bot', // Deskripsi bot
    developer: 'Lucky Archz',   // Nama developer
}
```

### Informasi Owner
```javascript
owner: {
    name: 'Owner',
    number: ['628xxx', '628yyy'], // Bisa lebih dari 1 nomor
}
```

### Pengaturan Command
```javascript
command: {
    prefix: '.',                // Karakter awalan command (.menu, .ping)
    multiPrefix: false,         // Boleh pakai prefix lain (!, #, dll)
}
```

### Mode Bot
```javascript
mode: 'public',
// Pilihan:
// 'public'  = Semua orang bisa pakai
// 'self'    = Hanya bot sendiri
// 'group'   = Hanya di grup
// 'private' = Hanya di chat pribadi
```

### Limit Harian
```javascript
limits: {
    defaultLimit: 25,    // Limit untuk user biasa
    premiumLimit: 100,   // Limit untuk premium
    ownerLimit: -1,      // -1 = unlimited
}
```

### Fitur Toggle
```javascript
features: {
    antiSpam: true,          // Blokir spam
    antiCall: true,          // Tolak panggilan
    autoRead: true,          // Auto read pesan
    autoTyping: true,        // Tampilkan "mengetik..."
    welcomeMessage: true,    // Pesan welcome di grup
    leaveMessage: true,      // Pesan saat keluar grup
    dailyLimitReset: true,   // Reset limit jam 00:00
}
```

---

## 🚀 Cara Menjalankan Bot

### Langkah 1: Start Bot
```bash
npm start
```

atau

```bash
node index.js
```

### Langkah 2: Pairing Code

Saat pertama kali, bot akan menampilkan:
```
╔════════════════════════════════════╗
║         PAIRING CODE               ║
║                                    ║
║         1234-5678                  ║
║                                    ║
╚════════════════════════════════════╝
```

**Cara memasukkan pairing code:**
1. Buka WhatsApp di HP
2. Ketuk titik tiga (⋮) di pojok kanan atas
3. Pilih "Perangkat tertaut"
4. Ketuk "Tautkan perangkat"
5. Pilih "Tautkan dengan nomor telepon"
6. Masukkan pairing code (misal: 1234-5678)

### Langkah 3: Bot Siap!

Jika berhasil, akan muncul:
```
✓ Terhubung ke WhatsApp!
✓ Bot: Ourin-AI
✓ Nomor: 628xxxxxxxxxx
✓ Ready to receive messages!
```

Sekarang coba kirim `.ping` ke bot!

---

## 📋 Daftar Command

### Command Utama

| Command | Alias | Deskripsi |
|---------|-------|-----------|
| `.menu` | `.help` | Menampilkan daftar semua command |
| `.ping` | `.p` | Cek apakah bot online dan response time |
| `.runtime` | `.uptime` | Lihat berapa lama bot sudah berjalan |
| `.infobot` | `.botinfo` | Informasi tentang bot |

### Command Owner (Khusus Owner)

| Command | Deskripsi |
|---------|-----------|
| `.self on` | Aktifkan self mode (hanya bot yang bisa pakai) |
| `.self off` | Nonaktifkan self mode |
| `.setmode <mode>` | Ubah mode bot (public/self/group/private) |
| `.broadcast <text>` | Kirim pesan ke semua chat |
| `.listowner` | Lihat daftar owner |
| `.listprem` | Lihat daftar premium user |

### Command Scheduler (Penjadwalan)

| Command | Deskripsi |
|---------|-----------|
| `.schedule add <HH:MM> <jid> <pesan>` | Tambah pesan terjadwal |
| `.schedule add <HH:MM> <jid> repeat <pesan>` | Pesan berulang harian |
| `.schedule list` | Lihat semua jadwal |
| `.schedule del <id>` | Hapus jadwal |
| `.schedule status` | Lihat status scheduler |

**Contoh penggunaan:**
```
.schedule add 08:00 6281234567890@s.whatsapp.net Selamat pagi!
.schedule add 12:00 here repeat Sudah siang!
```

### Command Utility

| Command | Deskripsi |
|---------|-----------|
| `.sticker` | Reply gambar/video untuk buat sticker |
| `.profile` | Lihat profile user |

### Command Fun

| Command | Deskripsi |
|---------|-----------|
| `.dice` | Lempar dadu (1-6) |
| `.flip` | Lempar koin (heads/tails) |

---

## 🔧 Cara Membuat Plugin

Plugin adalah file JavaScript yang berisi 1 command. Semua plugin ada di folder `plugins/`.

### Struktur Plugin

```javascript
// plugins/kategori/namacommand.js

// 1. Konfigurasi Plugin
const pluginConfig = {
    name: 'hello',              // Nama command (wajib)
    alias: ['hi', 'hey'],       // Nama alternatif
    category: 'fun',            // Kategori di menu
    description: 'Sapa bot',    // Deskripsi
    usage: '.hello [nama]',     // Cara pakai
    example: '.hello John',     // Contoh
    isOwner: false,             // true = khusus owner
    isPremium: false,           // true = khusus premium
    isGroup: false,             // true = hanya di grup
    isPrivate: false,           // true = hanya di private
    cooldown: 5,                // Jeda antar penggunaan (detik)
    limit: 1,                   // Berapa limit yang dikurangi
    isEnabled: true,            // false = command nonaktif
};

// 2. Handler (yang dijalankan saat command dipanggil)
async function handler(m, { sock, args, config }) {
    // m = message object
    // sock = socket WhatsApp
    // args = argumen setelah command
    // config = konfigurasi bot
    
    const nama = args[0] || m.pushName;
    await m.reply(`Halo, ${nama}! 👋`);
}

// 3. Export
module.exports = {
    config: pluginConfig,
    handler
};
```

### Contoh-contoh Plugin

**1. Plugin Sederhana (Reply Text)**
```javascript
// plugins/fun/sapa.js
const pluginConfig = {
    name: 'sapa',
    alias: ['hi'],
    category: 'fun',
    description: 'Sapa bot',
    isEnabled: true
};

async function handler(m) {
    await m.reply('Halo! Apa kabar? 😊');
}

module.exports = { config: pluginConfig, handler };
```

**2. Plugin dengan Argumen**
```javascript
// plugins/fun/say.js
const pluginConfig = {
    name: 'say',
    description: 'Bot mengulang kata kamu',
    usage: '.say <text>',
    isEnabled: true
};

async function handler(m, { args }) {
    const text = args.join(' ');
    
    if (!text) {
        await m.reply('Tulis sesuatu! Contoh: .say Hello World');
        return;
    }
    
    await m.reply(text);
}

module.exports = { config: pluginConfig, handler };
```

**3. Plugin dengan Gambar**
```javascript
// plugins/fun/gambar.js
const pluginConfig = {
    name: 'gambar',
    description: 'Kirim gambar random',
    isEnabled: true
};

async function handler(m, { sock }) {
    await sock.sendMessage(m.chat, {
        image: { url: 'https://picsum.photos/500' },
        caption: 'Ini gambar random!'
    });
}

module.exports = { config: pluginConfig, handler };
```

---

## 📁 Struktur Folder

```
Ourin-MD/
│
├── 📄 index.js              # File utama (entry point)
├── 📄 config.js             # Semua konfigurasi bot
├── 📄 package.json          # Info project & dependencies
├── 📄 CHANGELOG.md          # Riwayat perubahan
├── 📄 README.md             # Dokumentasi (file ini)
│
├── 📁 src/                  # Source code utama
│   ├── 📄 connection.js     # Koneksi ke WhatsApp
│   ├── 📄 handler.js        # Handler pesan masuk
│   │
│   ├── 📁 lib/              # Library/helper
│   │   ├── 📄 colors.js     # Warna & logger di console
│   │   ├── 📄 database.js   # Database LowDB
│   │   ├── 📄 exif.js       # EXIF sticker
│   │   ├── 📄 formatter.js  # Format pesan
│   │   ├── 📄 functions.js  # Fungsi umum
│   │   ├── 📄 lidHelper.js  # Konversi LID
│   │   ├── 📄 message.js    # Utilitas pesan
│   │   ├── 📄 plugins.js    # Loader plugin
│   │   ├── 📄 scheduler.js  # Penjadwalan
│   │   ├── 📄 serialize.js  # Serializer pesan
│   │   └── 📄 sockHelper.js # Helper socket
│   │
│   └── 📁 database/         # Data tersimpan
│       └── 📄 db.json       # File database utama
│
├── 📁 plugins/              # Semua command/plugin
│   ├── 📁 main/             # Command utama
│   │   ├── 📄 menu.js
│   │   ├── 📄 ping.js
│   │   └── ...
│   ├── 📁 owner/            # Command owner
│   │   ├── 📄 self.js
│   │   ├── 📄 schedule.js
│   │   └── ...
│   ├── 📁 utility/          # Command utility
│   │   ├── 📄 sticker.js
│   │   └── ...
│   └── 📁 fun/              # Command fun
│       ├── 📄 dice.js
│       └── ...
│
├── 📁 sessions/             # Data sesi WhatsApp
│   └── 📄 creds.json        # Credentials (JANGAN SHARE!)
│
└── 📁 tmp/                  # File temporary
    └── ...
```

---

## 🔧 Troubleshooting

### Bot tidak merespon setelah pairing

**Penyebab:** Sesi belum tersimpan dengan benar.

**Solusi:**
1. Hentikan bot (Ctrl+C)
2. Hapus folder `sessions/`
3. Jalankan ulang `npm start`
4. Pairing ulang

---

### Error "Module not found"

**Penyebab:** Dependencies belum terinstall.

**Solusi:**
```bash
npm install
```

---

### Error "ECONNREFUSED" atau tidak bisa connect

**Penyebab:** Masalah koneksi internet atau WhatsApp server.

**Solusi:**
1. Cek koneksi internet
2. Tunggu beberapa menit, coba lagi
3. Hapus folder `sessions/` dan pairing ulang

---

### Bot crash terus-menerus

**Penyebab:** Memory penuh atau error di plugin.

**Solusi:**
1. Cek log error
2. Nonaktifkan plugin bermasalah
3. Restart bot

---

### Sticker gagal dibuat

**Penyebab:** FFmpeg tidak terinstall atau gambar corrupt.

**Solusi:**
```bash
# Reinstall ffmpeg
npm uninstall @ffmpeg-installer/ffmpeg
npm install @ffmpeg-installer/ffmpeg
```

---

## ❓ FAQ

### Q: Apakah aman menggunakan bot ini?
**A:** Ya, selama kamu tidak membagikan folder `sessions/` ke orang lain. Folder tersebut berisi kredensial WhatsApp kamu.

### Q: Apakah bisa banned?
**A:** Bisa, jika kamu menggunakan bot untuk spam atau melanggar ToS WhatsApp. Gunakan dengan bijak!

### Q: Bagaimana cara update bot?
**A:** 
```bash
git pull origin main
npm install
npm start
```

### Q: Bisa jalan di HP?
**A:** Bisa, menggunakan Termux. Tapi disarankan menggunakan VPS untuk performa lebih baik.

### Q: Limit itu apa?
**A:** Limit adalah batas penggunaan command per hari untuk mencegah abuse. Reset setiap jam 00:00.

### Q: Bagaimana cara jadi premium user?
**A:** Owner bisa menambahkan premium user di `config.js` bagian `premiumUsers`.

### Q: Bot bisa multi-nomor?
**A:** Saat ini belum support. 1 folder = 1 nomor.

---

## 📝 Changelog

Lihat [CHANGELOG.md](CHANGELOG.md) untuk riwayat perubahan lengkap.

---

## 🤝 Kontribusi

Mau berkontribusi? Silakan!

1. Fork repository ini
2. Buat branch baru (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

---

## 📄 Lisensi

Project ini menggunakan lisensi ISC. Bebas digunakan untuk keperluan pribadi maupun komersial.

---

## 👤 Credits

- **Lucky Archz** - Developer
- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [@rexxhayanasi/elaina-baileys](https://github.com/rexxhayanasi/elaina-baileys) - Enhanced Baileys
- [node-webpmux](https://github.com/nickolaj-jepsen/node-webpmux) - WebP manipulation
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) - FFmpeg wrapper

---

<p align="center">
  <b>⭐ Jangan lupa kasih star kalau project ini membantu! ⭐</b>
</p>

<p align="center">
  Made with ❤️ by Lucky Archz
</p>
