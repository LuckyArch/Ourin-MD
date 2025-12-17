# 🤖 Ourin-AI - WhatsApp Multi-Device Bot

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/WhatsApp-Multi--Device-25D366?style=for-the-badge&logo=whatsapp" alt="WhatsApp">
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Version-1.0.0-orange?style=for-the-badge" alt="Version">
</p>

<p align="center">
  <b>Bot WhatsApp yang cantik, powerful, dan mudah dikustomisasi!</b>
</p>

<div align="center">
<img src="./assets//images/zann.jpg" alt="Version">
</div>


---

## 🤔 Apa itu Ourin-AI?

**Ourin-AI** adalah bot WhatsApp yang kamu bisa jalankan di komputermu sendiri. Bayangkan punya asisten di WhatsApp yang bisa:
- Menjawab pertanyaan secara otomatis
- Membuat sticker dari gambar yang kamu kirim
- Menampilkan menu interaktif yang keren
- Dan masih banyak lagi!

Bot ini dibangun dengan prinsip **"mudah dipahami, mudah dikembangkan"**. Bahkan kalau kamu baru belajar coding, kamu tetap bisa memodifikasi dan menambah fitur sesuai kebutuhanmu.

---

## ✨ Kenapa Pakai Ourin-AI?

### 🔌 Plugin System yang Keren
Setiap fitur bot adalah "plugin" terpisah. Mau tambah fitur? Tinggal buat file baru. Mau hapus fitur? Tinggal hapus file-nya. Gampang banget!

### 🎨 Tampilan Console yang Ciamik
Waktu bot jalan, kamu bakal lihat output yang cantik dengan warna-warni. Ada banner ASCII art, log pesan dengan box, indikator status - semuanya bikin monitoring jadi menyenangkan.

### 📱 Gak Perlu Scan QR Code
Bosen scan QR Code terus? Ourin-AI support **Pairing Code**! Cukup masukkan nomor WhatsApp, nanti muncul kode yang tinggal kamu masukkan di HP. Praktis!

### 🛡️ Anti Crash
Bot error? Tenang, Ourin-AI punya sistem penanganan error yang bagus. Error gak bakal bikin bot mati - bot tetap jalan dan error dicatat buat kamu review nanti.

### 🔄 Dev Mode
Lagi develop fitur baru? Aktifkan Dev Mode dan plugin akan auto-reload setiap kamu save. Gak perlu restart bot bolak-balik!

---

## 💻 Yang Kamu Butuhkan

Sebelum mulai, pastikan di komputermu ada:

| Apa | Minimum | Rekomendasi |
|-----|---------|-------------|
| **Node.js** | v18.0.0 | v20.0.0+ |
| **NPM** | v8.0.0 | v10.0.0+ |
| **RAM** | 512MB | 1GB+ |
| **Storage** | 100MB | 500MB+ |

> 💡 **Cara cek versi Node.js:** Buka terminal/command prompt, ketik `node -v`

---

## 🚀 Cara Install (5 Menit Selesai!)

### Step 1: Download Projectnya

```bash
# Pakai git (recommended)
git clone https://github.com/username/ourin-ai.git
cd ourin-ai

# Atau download ZIP dari GitHub lalu extract
```

### Step 2: Install Semua yang Dibutuhkan

```bash
npm install
```

Tunggu sampai selesai. Ini akan mendownload semua library yang dibutuhkan.

### Step 3: Setting Bot

Buka file `config.js` pakai text editor (VS Code, Notepad++, dll).

**Yang WAJIB kamu ubah:**
```javascript
owner: {
    name: 'Nama Kamu',
    number: ['6281234567890'],  // Ganti dengan nomor WA kamu!
}
```

### Step 4: Jalankan!

```bash
npm start
```

Bot akan mulai dan menampilkan banner. Ikuti instruksi di layar untuk connect ke WhatsApp.

---

## 📱 Cara Connect ke WhatsApp

### Pakai Pairing Code (Recommended)

1. Jalankan bot dengan `npm start`
2. Masukkan nomor WhatsApp kamu (format: 6281234567890)
3. Bot akan menampilkan **Pairing Code** (8 digit)
4. Di HP, buka **WhatsApp > Settings > Linked Devices > Link a Device**
5. Pilih "Link with phone number instead"
6. Masukkan kode pairing
7. Done! Bot connected!

### Pakai QR Code

1. Di `config.js`, set `session.pairingCode: false`
2. Jalankan bot
3. Scan QR Code yang muncul di terminal
4. Done!

---

## 📂 Struktur Folder (Biar Kamu Paham)

```
ourin-ai/
│
├── 📄 config.js          # Semua setting bot ada di sini
├── 📄 index.js           # File utama yang dijalankan
├── 📄 package.json       # Daftar dependencies
├── 📄 README.md          # File yang sedang kamu baca ini
├── 📄 CHANGELOG.md       # Catatan perubahan tiap versi
│
├── 📁 src/               # Kode inti bot
│   ├── 📄 connection.js   # Handle koneksi WhatsApp
│   ├── 📄 handler.js      # Handle pesan masuk
│   │
│   ├── 📁 lib/            # Library/helper functions
│   │   ├── 📄 colors.js    # Logger dengan warna keren
│   │   ├── 📄 database.js  # Baca/tulis database JSON
│   │   ├── 📄 exif.js      # Handle metadata sticker
│   │   ├── 📄 formatter.js # Format text dan menu
│   │   ├── 📄 plugins.js   # Load dan manage plugins
│   │   ├── 📄 serialize.js # Process pesan jadi object
│   │   └── 📄 sockHelper.js # Helper buat kirim media
│   │
│   └── 📁 database/       # Data tersimpan di sini
│       ├── 📄 users.json   # Data user
│       ├── 📄 groups.json  # Data group
│       ├── 📄 stats.json   # Statistik penggunaan
│       └── 📄 settings.json # Pengaturan
│
├── 📁 plugins/           # Semua fitur bot (commands)
│   ├── 📁 main/          # Plugin utama
│   ├── 📁 owner/         # Plugin khusus owner
│   ├── 📁 utility/       # Plugin utilitas
│   └── 📁 fun/           # Plugin hiburan
│
├── 📁 storage/           # File sementara
│   ├── 📁 session/       # Session WhatsApp (jangan dihapus!)
│   └── 📁 temp/          # File temporary (boleh dihapus)
│
└── 📁 tmp/               # Temporary files untuk sticker
```

---

## 🔌 Cara Kerja Plugin (Paling Penting!)

Setiap "command" di bot adalah sebuah plugin. Plugin itu cuma file JavaScript biasa dengan format tertentu.

### Contoh Plugin Sederhana

Buat file `plugins/fun/hello.js`:

```javascript
/**
 * Plugin Hello World
 * Ini adalah plugin pertamaku!
 */

const pluginConfig = {
    name: 'hello',              // Nama command (tanpa prefix)
    alias: ['hai', 'halo'],     // Alternatif nama command
    category: 'fun',            // Kategori
    description: 'Bilang hello', // Deskripsi singkat
    usage: '.hello [nama]',     // Cara pakai
    cooldown: 5,                // Cooldown 5 detik
    isEnabled: true             // Plugin aktif
};

async function handler(m, { sock, config }) {
    // m = pesan yang masuk
    // m.args = argumen setelah command
    // m.reply() = balas pesan
    
    const nama = m.args[0] || m.pushName || 'Kamu';
    await m.reply(`👋 Hello ${nama}! Apa kabar?`);
}

module.exports = {
    config: pluginConfig,
    handler
};
```

**Sekarang kalau ada yang kirim `.hello` atau `.hai`, bot akan membalas!**

### Properti Pesan (m) yang Sering Dipakai

| Properti | Isinya | Contoh |
|----------|--------|--------|
| `m.body` | Isi pesan lengkap | ".menu help" |
| `m.command` | Command tanpa prefix | "menu" |
| `m.args` | Array argumen | ["help"] |
| `m.text` | Text setelah command | "help" |
| `m.sender` | JID pengirim | "6281xxx@s.whatsapp.net" |
| `m.pushName` | Nama pengirim | "John" |
| `m.chat` | JID chat | "6281xxx@s.whatsapp.net" atau "xxx@g.us" |
| `m.isGroup` | Apakah di group | true/false |
| `m.isOwner` | Apakah owner | true/false |
| `m.isImage` | Apakah gambar | true/false |
| `m.isVideo` | Apakah video | true/false |
| `m.quoted` | Pesan yang di-reply | Object atau null |

### Fungsi yang Bisa Dipanggil

| Fungsi | Kegunaan | Contoh |
|--------|----------|--------|
| `m.reply(text)` | Balas dengan text | `m.reply("Halo!")` |
| `m.react(emoji)` | Kasih reaction | `m.react("✅")` |
| `m.replyImage(buffer, caption)` | Balas dengan gambar | `m.replyImage(buffer, "Ini gambar")` |
| `m.replyVideo(buffer, caption)` | Balas dengan video | `m.replyVideo(buffer, "Ini video")` |
| `m.replySticker(buffer)` | Balas dengan sticker | `m.replySticker(buffer)` |
| `m.download()` | Download media | `const buffer = await m.download()` |
| `m.delete()` | Hapus pesan | `await m.delete()` |

---

## 📜 Daftar Command

### 🏠 Main (Utama)
| Command | Alias | Fungsi |
|---------|-------|--------|
| `.menu` | - | Tampilkan menu utama dengan UI keren |
| `.infobot` | `.info` | Info lengkap tentang bot |
| `.ping` | `.p`, `.speed` | Cek kecepatan bot + info system |
| `.runtime` | `.uptime`, `.rt` | Berapa lama bot udah jalan |
| `.owner` | `.creator` | Kontak owner |

### 👑 Owner (Khusus Owner)
| Command | Fungsi |
|---------|--------|
| `.listowner` | Lihat daftar owner |
| `.listprem` | Lihat daftar premium user |
| `.broadcast <pesan>` | Kirim pesan ke semua user |
| `.setmode <mode>` | Ubah mode (public/self/group/private) |

### 🛠️ Utility
| Command | Alias | Fungsi |
|---------|-------|--------|
| `.sticker` | `.s`, `.stiker` | Buat sticker dari gambar/video |
| `.profile` | `.me` | Lihat profil kamu |

### 🎮 Fun
| Command | Fungsi |
|---------|--------|
| `.dice [sisi]` | Lempar dadu (default 6) |
| `.flip` | Lempar koin |

---

## ⚙️ Konfigurasi Detail

File `config.js` berisi semua pengaturan. Ini penjelasan bagian-bagian pentingnya:

### Bot Info
```javascript
bot: {
    name: 'Ourin-AI',        // Nama bot (tampil di menu)
    version: '1.0.0',        // Versi
    developer: 'Your Name',  // Nama developer
}
```

### Owner
```javascript
owner: {
    name: 'Kamu',
    number: ['6281234567890'],  // WAJIB diganti!
}
```

### Prefix Command
```javascript
command: {
    prefix: '.',              // Prefix command (. ! # /)
    multiPrefix: false,       // Aktifkan multi prefix?
}
```

### Mode Bot
```javascript
mode: 'public'  // public = semua bisa pakai
                // self = cuma owner
                // group = cuma di group
                // private = cuma di private chat
```

### Pairing Code
```javascript
session: {
    pairingCode: true,        // Pakai pairing code?
    pairingNumber: '',        // Kosong = tanya saat startup
}
```

### Toggle Fitur
```javascript
features: {
    antiSpam: true,       // Cegah spam command
    antiCall: true,       // Tolak panggilan
    autoRead: false,      // Auto read pesan
    logMessage: true,     // Log pesan di console
}
```

---

## 🔧 Development Mode

Kalau kamu lagi develop plugin baru:

1. Buka `config.js`
2. Set `dev.enabled: true`
3. Jalankan bot

Sekarang setiap kali kamu save file plugin, plugin langsung di-reload tanpa restart bot!

---

## ❓ Troubleshooting (Kalau Ada Masalah)

### Bot gak bisa connect
1. Cek Node.js versi 18+: `node -v`
2. Hapus folder `storage/session/` dan restart
3. Cek internet kamu

### Pairing code gak muncul
1. Pastikan `session.pairingCode: true` di config
2. Format nomor harus 62xxx (tanpa + atau 0)
3. Hapus folder session dan coba lagi

### Plugin gak ke-load
1. Cek ada error di console
2. Pastikan struktur plugin benar (ada `config` dan `handler`)
3. Aktifkan `dev.debugLog: true` buat detail error

### Sticker gak kebuat
1. Pastikan sudah install sharp: `npm install sharp`
2. Cek apakah gambar valid
3. Lihat error di console

### Bot sering disconnect
1. Cek internet stabil
2. Pastikan cuma 1 instance bot yang jalan
3. Jangan login di device lain dengan session yang sama

---

## 📊 Console Log yang Kamu Lihat

Waktu bot jalan, kamu bakal lihat log kayak gini:

```
╭─────────────────────────────────────────────╮
│ 💬 MESSAGE RECEIVED
│ ├─ From: John
│ ├─ Type: GRP
│ ├─ Msg: Halo semua
│ └─ Time: 14:30:25
╰─────────────────────────────────────────────╯

╭─────────────────────────────────────────────╮
│ ⚡ COMMAND EXECUTED
│ ├─ Cmd: .menu
│ ├─ User: John
│ ├─ Type: GRP
│ └─ Time: 14:30:30
╰─────────────────────────────────────────────╯
```

- **MESSAGE RECEIVED** = Ada pesan masuk (bukan command)
- **COMMAND EXECUTED** = Ada command dieksekusi

---

## 🎨 Fitur-Fitur Tersembunyi

### Status Broadcast di Menu
Menu dikirim dengan fake quoted dari status broadcast dengan verified badge. Keliatan professional!

### Sticker dengan Packname
Sticker yang dibuat punya packname dan author yang bisa di-custom:
```
.sticker NamaPack NamaAuthor
```

### Info System di Ping
Command `.ping` gak cuma menampilkan response time, tapi juga:
- CPU usage dan model
- Memory usage (heap, RSS, system)
- Platform dan architecture
- Node.js version

---

## 📦 Dependencies yang Dipakai

| Package | Fungsi |
|---------|--------|
| `@rexxhayanasi/elaina-baileys` | Koneksi WhatsApp Multi-Device |
| `@hapi/boom` | Error handling |
| `pino` | Logging |
| `axios` | HTTP requests |
| `sharp` | Processing gambar |
| `@ffmpeg-installer/ffmpeg` | Binary FFmpeg |
| `fluent-ffmpeg` | Video processing |

---

## 🤝 Kontribusi

Mau nambahin fitur? Fork repo ini, buat perubahan, terus Pull Request!

---

## 📄 Lisensi

**ISC License** - Bebas pakai, modifikasi, dan distribusi. Cuma jangan lupa kasih credit ya!

---

<p align="center">
  Made with ❤️ by Ourin-AI Team
  <br><br>
  <b>Selamat coding! 🚀</b>
</p>
