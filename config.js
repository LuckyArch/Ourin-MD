/**
 * ═══════════════════════════════════════════════════════════════════
 *                         OURIN-AI CONFIG
 *                          Version 1.2.0
 * ═══════════════════════════════════════════════════════════════════
 * 
 * File ini berisi semua pengaturan bot.
 * Bagian yang WAJIB diubah ditandai dengan [WAJIB]
 * Bagian lainnya sudah memiliki default yang baik.
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

const config = {

    // ═══════════════════════════════════════════════════════════════
    // [WAJIB] PENGATURAN OWNER
    // ═══════════════════════════════════════════════════════════════
    // 
    // Nomor owner adalah nomor yang memiliki akses PENUH ke bot.
    // Format: 628xxxxxxxxxx (tanpa + atau 0 di depan)
    // Contoh: ['6281234567890'] atau ['6281234567890', '6289876543210']
    //
    owner: {
        name: 'Owner',
        number: ['628xxxxxxxxxx']
    },

    // ═══════════════════════════════════════════════════════════════
    // [WAJIB] MODE BOT
    // ═══════════════════════════════════════════════════════════════
    //
    // 'public' = Semua orang bisa menggunakan bot
    // 'self'   = Hanya bot sendiri (fromMe) yang bisa menggunakan
    //
    mode: 'public',

    // ═══════════════════════════════════════════════════════════════
    // INFORMASI BOT
    // ═══════════════════════════════════════════════════════════════
    bot: {
        name: 'Ourin-AI',
        version: '1.2.0',
        description: 'WhatsApp Multi-Device Bot',
        developer: 'Lucky Archz',
        number: null
    },

    // ═══════════════════════════════════════════════════════════════
    // PENGATURAN COMMAND
    // ═══════════════════════════════════════════════════════════════
    command: {
        // Prefix untuk command (misal: .menu, .ping)
        prefix: '.',
        
        // Prefix alternatif yang diizinkan
        alternativePrefix: ['!', '#', '/']
    },

    // ═══════════════════════════════════════════════════════════════
    // LIMIT HARIAN
    // ═══════════════════════════════════════════════════════════════
    limits: {
        // Limit untuk user biasa
        default: 25,
        
        // Limit untuk premium user
        premium: 100,
        
        // Limit untuk owner (-1 = unlimited)
        owner: -1
    },

    // ═══════════════════════════════════════════════════════════════
    // DAFTAR PREMIUM & BANNED
    // ═══════════════════════════════════════════════════════════════
    premiumUsers: [],
    bannedUsers: [],

    // ═══════════════════════════════════════════════════════════════
    // FITUR ON/OFF
    // ═══════════════════════════════════════════════════════════════
    features: {
        // Anti spam - blokir user yang spam command
        antiSpam: true,
        antiSpamInterval: 3000,
        
        // Anti call - tolak panggilan masuk
        antiCall: true,
        
        // Auto read - tandai pesan sudah dibaca
        autoRead: false,
        
        // Auto typing - tampilkan "sedang mengetik..."
        autoTyping: true,
        
        // Log pesan ke console
        logMessage: true,
        
        // Daily limit reset otomatis jam 00:00
        dailyLimitReset: true
    },

    // ═══════════════════════════════════════════════════════════════
    // WELCOME & GOODBYE
    // ═══════════════════════════════════════════════════════════════
    welcome: {
        // Default status untuk group baru
        defaultEnabled: true
    },
    
    goodbye: {
        // Default status untuk group baru
        defaultEnabled: true
    },

    // ═══════════════════════════════════════════════════════════════
    // STICKER
    // ═══════════════════════════════════════════════════════════════
    sticker: {
        packname: 'Ourin-AI',
        author: 'Bot'
    },

    // ═══════════════════════════════════════════════════════════════
    // PESAN BOT
    // ═══════════════════════════════════════════════════════════════
    messages: {
        wait: '⏳ Tunggu sebentar...',
        success: '✅ Berhasil!',
        error: '❌ Terjadi kesalahan!',
        ownerOnly: '🚫 Command ini khusus owner!',
        premiumOnly: '💎 Command ini khusus premium!',
        groupOnly: '👥 Command ini hanya untuk grup!',
        privateOnly: '📱 Command ini hanya untuk private chat!',
        cooldown: '⏱️ Tunggu %time% detik lagi!',
        limitExceeded: '📊 Limit harian kamu sudah habis!',
        banned: '🚫 Kamu dibanned dari bot ini!'
    },

    // ═══════════════════════════════════════════════════════════════
    // SCHEDULER
    // ═══════════════════════════════════════════════════════════════
    scheduler: {
        // Jam reset limit (0-23)
        resetHour: 0,
        resetMinute: 0
    },

    // ═══════════════════════════════════════════════════════════════
    // BACKUP
    // ═══════════════════════════════════════════════════════════════
    backup: {
        // Backup otomatis
        enabled: true,
        
        // Interval backup dalam jam
        intervalHours: 24,
        
        // Berapa hari backup disimpan
        retainDays: 7
    },

    // ═══════════════════════════════════════════════════════════════
    // DATABASE
    // ═══════════════════════════════════════════════════════════════
    database: {
        path: './src/database'
    },

    // ═══════════════════════════════════════════════════════════════
    // SESSION
    // ═══════════════════════════════════════════════════════════════
    session: {
        path: './sessions',
        usePairingCode: true
    },

    // ═══════════════════════════════════════════════════════════════
    // SALURAN (NEWSLETTER)
    // ═══════════════════════════════════════════════════════════════
    saluran: {
        id: '120363208449943317@newsletter',
        name: 'Ourin-AI',
        link: ''
    }
}

function isOwner(number) {
    if (!number) return false
    const cleanNumber = number.replace(/[^0-9]/g, '')
    
    if (config.bot.number) {
        const botClean = config.bot.number.replace(/[^0-9]/g, '')
        if (cleanNumber.includes(botClean) || botClean.includes(cleanNumber)) {
            return true
        }
    }
    
    return config.owner.number.some(owner => {
        const cleanOwner = owner.replace(/[^0-9]/g, '')
        return cleanNumber.includes(cleanOwner) || cleanOwner.includes(cleanNumber)
    })
}

function isPremium(number) {
    if (!number) return false
    if (isOwner(number)) return true
    
    const cleanNumber = number.replace(/[^0-9]/g, '')
    return config.premiumUsers.some(premium => {
        const cleanPremium = premium.replace(/[^0-9]/g, '')
        return cleanNumber.includes(cleanPremium) || cleanPremium.includes(cleanNumber)
    })
}

function isBanned(number) {
    if (!number) return false
    if (isOwner(number)) return false
    
    const cleanNumber = number.replace(/[^0-9]/g, '')
    return config.bannedUsers.some(banned => {
        const cleanBanned = banned.replace(/[^0-9]/g, '')
        return cleanNumber.includes(cleanBanned) || cleanBanned.includes(cleanNumber)
    })
}

function setBotNumber(number) {
    if (number) {
        config.bot.number = number.replace(/[^0-9]/g, '')
    }
}

function isSelf(number) {
    if (!number || !config.bot.number) return false
    const cleanNumber = number.replace(/[^0-9]/g, '')
    const botNumber = config.bot.number.replace(/[^0-9]/g, '')
    return cleanNumber.includes(botNumber) || botNumber.includes(cleanNumber)
}

function getConfig() {
    return config
}

module.exports = {
    ...config,
    config,
    getConfig,
    isOwner,
    isPremium,
    isBanned,
    setBotNumber,
    isSelf
}
