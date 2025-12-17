# Changelog

Semua perubahan penting pada proyek **Ourin-AI WhatsApp Bot** akan didokumentasikan di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), 
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-12-17

### 🎉 Rilis Pertama - Initial Release

Ini adalah versi pertama dari Ourin-AI WhatsApp Bot! Versi ini mencakup semua fitur dasar yang dibutuhkan untuk menjalankan bot WhatsApp yang fungsional dan dapat dikustomisasi.

---

### ✨ Fitur Baru (Added)

#### Sistem Inti (Core System)
- **Koneksi WhatsApp Multi-Device** - Menggunakan library `@rexxhayanasi/elaina-baileys` untuk koneksi yang stabil
- **Pairing Code Support** - Login tanpa perlu scan QR Code, cukup masukkan kode pairing
- **Auto Reconnect** - Bot otomatis menyambung ulang jika terputus (maksimal 10 percobaan)
- **Anti-Crash System** - Penanganan error yang mencegah bot crash saat ada kesalahan
- **Graceful Shutdown** - Bot menyimpan data dengan aman saat dimatikan (SIGINT/SIGTERM)

#### Sistem Plugin (Plugin System)
- **Arsitektur Modular** - Setiap fitur adalah plugin terpisah yang mudah dikelola
- **Auto-Loader** - Plugin otomatis ter-load saat bot startup
- **Hot Reload (Dev Mode)** - Plugin di-reload otomatis saat file berubah (untuk development)
- **Kategori Plugin** - Plugin dikelompokkan berdasarkan kategori (main, owner, utility, fun)
- **Plugin Config** - Setiap plugin punya konfigurasi sendiri (cooldown, limit, permission, dll)

#### Console Logger (Custom Futuristic Logger)
- **ASCII Art Banner** - Banner keren saat bot startup dengan nama OURIN-AI
- **4-Color Scheme** - Palet warna khusus (Bright Green, Phantom Purple, White, Gray)
- **Box-Style Logs** - Log terstruktur dengan box drawing characters
- **MESSAGE RECEIVED Log** - Log pesan masuk dengan format yang informatif
- **COMMAND EXECUTED Log** - Log eksekusi command dengan detail user, type, time
- **Connection Status Log** - Log status koneksi (connected, connecting, disconnected)
- **Suppress Internal Errors** - Error internal Baileys (Bad MAC, Session error, dll) disembunyikan

#### Message Serializer (serialize.js)
- **Full Message Properties** - Properti lengkap untuk setiap pesan:
  - `m.chat`, `m.sender`, `m.senderNumber`, `m.pushName`
  - `m.remoteJid`, `m.jid`, `m.from`, `m.to` (aliases)
  - `m.botNumber`, `m.botJid`, `m.botName`
  - `m.isGroup`, `m.isPrivate`, `m.isOwner`, `m.isPremium`, `m.isBanned`
  - `m.isImage`, `m.isVideo`, `m.isAudio`, `m.isSticker`, `m.isDocument`
  - `m.mimetype`, `m.fileLength`, `m.fileName`, `m.seconds`
  - `m.quoted`, `m.quotedBody`, `m.quotedSender`, `m.hasQuotedMedia`
  - `m.isReply`, `m.hasMentions`, `m.isForwarded`
- **Reply Functions** - `m.reply()`, `m.replyImage()`, `m.replyVideo()`, `m.replyAudio()`, `m.replySticker()`, `m.replyDocument()`, `m.replyContact()`, `m.replyLocation()`
- **Utility Functions** - `m.react()`, `m.download()`, `m.delete()`, `m.forward()`, `m.copy()`
- **Group Metadata** - `m.groupMetadata`, `m.groupName`, `m.groupDesc`, `m.isAdmin`, `m.isBotAdmin`

#### Sock Helper (sockHelper.js)
- **sock.sendImageAsSticker()** - Kirim gambar sebagai sticker dengan packname & author
- **sock.sendVideoAsSticker()** - Kirim video sebagai animated sticker
- **sock.sendFile()** - Kirim file dengan auto-detect mimetype
- **sock.sendContact()** - Kirim kartu kontak
- **sock.downloadAndSaveMediaMessage()** - Download dan simpan media dari pesan

#### EXIF Library (exif.js)
- **createExif()** - Buat EXIF buffer untuk sticker metadata
- **addExifToWebp()** - Tambahkan EXIF (packname, author) ke file WebP
- **readExifFromWebp()** - Baca EXIF metadata dari sticker
- **isValidWebp()**, **isAnimatedWebp()** - Validasi file WebP
- **PRESETS** - Preset metadata (default, meme, love, sad, angry)

#### Database JSON
- **users.json** - Data user (nama, limit, exp, level, lastSeen, cooldowns)
- **groups.json** - Data group (settings, welcome/leave)
- **stats.json** - Statistik penggunaan (commandsExecuted, per-command stats)
- **settings.json** - Pengaturan dinamis
- **Auto-Save** - Data otomatis disimpan setiap 5 menit dan saat shutdown

---

### 📱 Plugin yang Tersedia

#### Main Category
| Plugin | Alias | Deskripsi |
|--------|-------|-----------|
| `menu` | - | Menu utama dengan UI premium, unicode box drawing, kategori |
| `infobot` | `botinfo`, `info` | Informasi lengkap tentang bot |
| `ping` | `p`, `speed` | Cek response time dengan detail CPU, memory, system info |
| `runtime` | `uptime`, `rt` | Statistik uptime bot dengan performance metrics |
| `owner` | `creator`, `dev` | Kontak owner dengan vCard |

#### Owner Category (Khusus Owner)
| Plugin | Deskripsi |
|--------|-----------|
| `broadcast` | Broadcast pesan ke semua user |
| `listowner` | Lihat daftar owner |
| `listprem` | Lihat daftar premium user |
| `setmode` | Ubah mode bot (public/self/group/private) |

#### Utility Category
| Plugin | Alias | Deskripsi |
|--------|-------|-----------|
| `sticker` | `s`, `stiker` | Buat sticker dari gambar/video dengan custom packname & author |
| `profile` | `me`, `profil` | Lihat profil user |

#### Fun Category
| Plugin | Deskripsi |
|--------|-----------|
| `dice` | Lempar dadu (default 6 sisi) |
| `flip` | Lempar koin |

---

### 🎨 UI/UX Enhancements

#### Menu Plugin
- **Premium UI Design** - Full unicode box drawing characters
- **User Info Card** - Menampilkan nama, status (OWNER/PREMIUM/USER), limit
- **Bot Info Card** - Menampilkan versi, developer, mode, plugins count
- **Category List** - Kategori dengan emoji dan deskripsi
- **Status Broadcast Quote** - Fake status quote dengan verified badge
- **External Ad Reply** - Thumbnail dengan link ke saluran/newsletter

#### Ping Plugin
- **Response Time Indicator** - Emoji indikator (🟢 <100ms, 🟡 <300ms, 🟠 <500ms, 🔴 >500ms)
- **System Information** - Hostname, platform, architecture
- **Memory Details** - Heap used/total, RSS, system free/used
- **CPU Information** - Model, cores, usage percentage, load average
- **Uptime Info** - Bot uptime dan system uptime

#### Runtime Plugin
- **Detailed Uptime** - Breakdown dalam hari, jam, menit, detik
- **Statistics** - Total users, commands executed, average commands/hour
- **Performance Metrics** - Memory heap, RSS, external, system RAM
- **Bot Information** - Name, version, developer, mode, Node.js version

---

### 🔧 Konfigurasi (config.js)

- **Bot Info** - name, version, description, developer
- **Owner Settings** - name, number, organization
- **Command Settings** - prefix, multiPrefix, prefixList, caseSensitive
- **Mode Operasi** - public, self, group, private
- **Session Settings** - pairingCode, pairingNumber, autoReconnect
- **Feature Toggles** - antiSpam, antiCall, autoRead, autoTyping, welcomeMessage
- **Limit System** - defaultLimit, premiumLimit, ownerLimit
- **Premium/Banned Users** - Array nomor telepon
- **Sticker Settings** - default packname, author
- **Saluran/Newsletter** - ID, name, link untuk forward info
- **Category Emojis** - Emoji untuk setiap kategori plugin
- **Messages Template** - Template pesan (wait, success, error, dll)
- **Helper Functions** - isOwner(), isPremium(), isBanned()

---

### 📦 Dependencies

```json
{
  "@rexxhayanasi/elaina-baileys": "WhatsApp Multi-Device connection",
  "@hapi/boom": "HTTP error handling",
  "pino": "Logging library",
  "axios": "HTTP client",
  "cheerio": "Web scraping",
  "@ffmpeg-installer/ffmpeg": "FFmpeg binary installer",
  "fluent-ffmpeg": "FFmpeg wrapper for video processing",
  "sharp": "High-performance image processing"
}
```

---

### 🔒 Message Filtering

Bot secara otomatis memfilter pesan dari:
- `status@broadcast` - Status WhatsApp
- `@newsletter` - Saluran/Channel WhatsApp
- `@lid` - Legacy ID
- `@broadcast` - Broadcast lists
- Unknown/Invalid JID
- Empty message body
- Unknown sender names

---

### 📝 Notes

Ini adalah **versi pertama (v1.0.0)** dari Ourin-AI. Beberapa hal yang perlu diperhatikan:

1. **FFmpeg Required** - Untuk fitur video sticker, FFmpeg harus terinstall. Package `@ffmpeg-installer/ffmpeg` akan otomatis menyediakan binary FFmpeg.

2. **Sharp Required** - Untuk konversi gambar ke WebP sticker, library `sharp` digunakan.

3. **Dev Mode** - Saat development, aktifkan `dev.enabled: true` di config untuk auto-reload plugins.

4. **Session Backup** - Disarankan untuk backup folder `storage/session/` secara berkala.

5. **Database Backup** - Data disimpan di `src/database/`. Backup secara berkala untuk menghindari kehilangan data.

---

### 🙏 Credits

- **Baileys** - Library WhatsApp Multi-Device
- **Sharp** - Image processing
- **FFmpeg** - Video processing
- **Ourin-AI Team** - Development

---

*Dibuat dengan ❤️ oleh Ourin-AI Team*
