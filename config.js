/**
 * @file config.js
 * @description Konfigurasi utama untuk WhatsApp Bot Ourin-AI
 * @author Ourin-AI Team
 * @version 1.0.0
 * 
 * File ini berisi semua konfigurasi yang dapat disesuaikan untuk bot.
 * Modifikasi nilai-nilai di bawah sesuai kebutuhan Anda.
 */

/**
 * @typedef {Object} BotConfig
 * @property {string} botName - Nama bot yang akan ditampilkan di menu
 * @property {string} botVersion - Versi bot saat ini
 * @property {string} ownerName - Nama pemilik bot
 * @property {string[]} ownerNumber - Array nomor WhatsApp owner (format: 62xxx)
 * @property {string[]} premiumUsers - Array nomor WhatsApp user premium
 * @property {string} prefix - Prefix untuk command bot
 * @property {string} mode - Mode operasi bot (public/self/group)
 * @property {string} language - Bahasa default bot
 * @property {string} timezone - Timezone untuk waktu bot
 */

/**
 * @typedef {Object} LimitConfig
 * @property {number} defaultLimit - Limit harian untuk user biasa
 * @property {number} premiumLimit - Limit harian untuk user premium
 * @property {number} ownerLimit - Limit untuk owner (tidak terbatas jika -1)
 */

/**
 * @typedef {Object} MessageConfig
 * @property {string} wait - Pesan saat bot memproses request
 * @property {string} success - Pesan sukses
 * @property {string} error - Pesan error
 * @property {string} ownerOnly - Pesan untuk command khusus owner
 * @property {string} premiumOnly - Pesan untuk command khusus premium
 * @property {string} groupOnly - Pesan untuk command khusus group
 * @property {string} privateOnly - Pesan untuk command khusus private chat
 * @property {string} cooldown - Pesan saat cooldown aktif
 * @property {string} limitExceeded - Pesan saat limit terlampaui
 * @property {string} maintenance - Pesan saat bot dalam mode maintenance
 */

/**
 * @typedef {Object} MenuStyleConfig
 * @property {string} thumbnail - URL gambar thumbnail untuk menu
 * @property {string} headerChar - Karakter untuk header menu
 * @property {string} bodyChar - Karakter untuk body menu
 * @property {string} footerChar - Karakter untuk footer menu
 * @property {string} lineChar - Karakter garis horizontal
 * @property {string} cornerTopLeft - Karakter sudut kiri atas
 * @property {string} cornerBottomLeft - Karakter sudut kiri bawah
 * @property {string} bullet - Karakter bullet point
 * @property {string} arrow - Karakter arrow
 */

/**
 * @typedef {Object} FeatureToggleConfig
 * @property {boolean} antiSpam - Aktifkan fitur anti spam
 * @property {boolean} antiCall - Aktifkan fitur anti call
 * @property {boolean} autoRead - Aktifkan auto read message
 * @property {boolean} autoTyping - Aktifkan typing indicator
 * @property {boolean} autoRecording - Aktifkan recording indicator untuk voice
 * @property {boolean} welcomeMessage - Aktifkan welcome message di group
 * @property {boolean} leaveMessage - Aktifkan leave message di group
 */

/**
 * Konfigurasi utama bot
 * @type {Object}
 */
const config = {
    /**
     * Informasi Bot
     * @type {BotConfig}
     */
    bot: {
        name: 'Ourin-AI',
        version: '1.0.0',
        description: 'WhatsApp Multi-Device Bot dengan sistem plugin modular',
        developer: '( Zann / Lucky Archz )',
        website: '',
        github: ''
    },

    /**
     * Informasi Owner
     */
    owner: {
        name: 'Owner',
        number: ['6283xxx'],
        organization: '',
        socialMedia: {
            instagram: 'https://instagram.com/ourin_ai',
            github: 'https://github.com/ourin-ai',
            youtube: 'https://youtube.com/ourin_ai'
        },
    },

    /**
     * Informasi Saluran WangsaFauzan
     */
    saluran: {
        id: '-@newsletter',
        name: "OURIN AI",
        link: "xxxxxx"
    },

    /**
     * Pengaturan Command
     */
    command: {
        prefix: '.',
        multiPrefix: false,
        prefixList: ['.', '!', '#', '/'],
        caseSensitive: false
    },

    /**
     * Mode Operasi Bot
     * @description
     * - 'public': Bot merespon semua user
     * - 'self': Bot hanya merespon owner
     * - 'group': Bot hanya merespon di group
     * - 'private': Bot hanya merespon di private chat
     */
    mode: 'public',

    /**
     * Pengaturan Bahasa dan Waktu
     */
    locale: {
        language: 'id',
        timezone: 'Asia/Jakarta',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss'
    },

    /**
     * Pengaturan Limit
     * @type {LimitConfig}
     */
    limits: {
        defaultLimit: 25,
        premiumLimit: 100,
        ownerLimit: -1,
        resetTime: '00:00'
    },

    /**
     * User Premium
     * @description Array nomor WhatsApp user premium (format: 62xxx tanpa +)
     */
    premiumUsers: [],

    /**
     * Banned Users
     * @description Array nomor WhatsApp user yang dibanned
     */
    bannedUsers: [],

    /**
     * Template Pesan
     * @type {MessageConfig}
     */
    messages: {
        wait: '⏳ *Tunggu sebentar...*',
        success: '✅ *Berhasil!*',
        error: '❌ *Terjadi kesalahan!*',
        ownerOnly: '🚫 *Perintah ini khusus untuk owner!*',
        premiumOnly: '💎 *Perintah ini khusus untuk user premium!*',
        groupOnly: '👥 *Perintah ini hanya bisa digunakan di group!*',
        privateOnly: '📱 *Perintah ini hanya bisa digunakan di private chat!*',
        cooldown: '⏱️ *Tunggu %time% detik sebelum menggunakan perintah ini lagi!*',
        limitExceeded: '📊 *Limit harian Anda sudah habis! Reset pada pukul 00:00*',
        maintenance: '🔧 *Bot sedang dalam mode maintenance, mohon tunggu!*',
        notRegistered: '📝 *Anda belum terdaftar! Ketik %prefix%daftar untuk mendaftar*',
        invalidFormat: '❌ *Format salah! Gunakan: %usage%*'
    },

    /**
     * Style Menu
     * @type {MenuStyleConfig}
     */
    menuStyle: {
        thumbnail: '',
        headerChar: '┏',
        bodyChar: '┃',
        footerChar: '┗',
        lineChar: '━',
        cornerTopLeft: '╭',
        cornerBottomLeft: '╰',
        cornerTopRight: '╮',
        cornerBottomRight: '╯',
        verticalLine: '│',
        bullet: '◦',
        arrow: '➣',
        star: '✦',
        diamond: '◇'
    },

    /**
     * Emoji untuk Kategori Menu
     */
    categoryEmojis: {
        owner: '👑',
        main: '🏠',
        utility: '🔧',
        fun: '🎮',
        group: '👥',
        download: '📥',
        search: '🔍',
        tools: '🛠️',
        info: 'ℹ️',
        media: '🎬',
        sticker: '🖼️',
        game: '🎯',
        ai: '🤖',
        anonymous: '🎭'
    },

    /**
     * Toggle Fitur
     * @type {FeatureToggleConfig}
     */
    features: {
        antiSpam: true,
        antiSpamInterval: 3000,
        antiCall: true,
        autoRead: false,
        autoTyping: true,
        autoRecording: false,
        welcomeMessage: true,
        leaveMessage: true,
        logMessage: true,
        selfMode: false
    },

    /**
     * Pengaturan Session
     * @description Konfigurasi koneksi WhatsApp
     * 
     * pairingCode: Jika true, gunakan pairing code alih-alih QR Code
     * pairingNumber: Nomor WhatsApp untuk pairing (wajib jika pairingCode true)
     *                Format: 62xxx (tanpa + atau spasi)
     */
    session: {
        folderName: 'session',
        autoReconnect: true,
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
        printQRInTerminal: true,
        pairingCode: true,
        pairingNumber: '62xxx'
    },

    /**
     * Mode Development
     * @description Pengaturan untuk development mode
     * 
     * enabled: Aktifkan dev mode (auto reload plugins)
     * watchPlugins: Auto reload saat plugin berubah
     * debugLog: Tampilkan debug log
     */
    dev: {
        enabled: false,
        watchPlugins: true,
        debugLog: false
    },

    /**
     * Pengaturan Database
     */
    database: {
        path: './src/database',
        backupInterval: 3600000,
        autoSave: true,
        autoSaveInterval: 60000
    },

    /**
     * Pengaturan API Eksternal
     * @description API keys untuk layanan eksternal
     */
    apis: {
        openai: '',
        removebg: '',
        imgbb: '',
        github: ''
    },

    /**
     * Pengaturan Sticker
     */
    sticker: {
        packname: 'Ourin-AI',
        author: 'Bot WhatsApp',
        quality: 50,
        background: ''
    },

    /**
     * Pengaturan Group
     */
    group: {
        antiLink: false,
        antiLinkAction: 'warn',
        antiToxic: false,
        antiToxicAction: 'warn',
        welcomeImage: true,
        leaveImage: true
    }
};

/**
 * Fungsi untuk mendapatkan konfigurasi
 * @param {string} path - Path konfigurasi dengan dot notation (contoh: 'bot.name')
 * @param {*} defaultValue - Nilai default jika path tidak ditemukan
 * @returns {*} Nilai konfigurasi
 * @example
 * const botName = getConfig('bot.name', 'Default Bot');
 * const ownerNumber = getConfig('owner.number', []);
 */
function getConfig(path, defaultValue = null) {
    const keys = path.split('.');
    let result = config;
    
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return defaultValue;
        }
    }
    
    return result;
}

/**
 * Fungsi untuk mengecek apakah nomor adalah owner
 * @param {string} number - Nomor WhatsApp untuk dicek
 * @returns {boolean} True jika nomor adalah owner
 * @example
 * if (isOwner('6281234567890')) {
 *   console.log('Ini owner!');
 * }
 */
function isOwner(number) {
    if (!number) return false;
    const cleanNumber = number.replace(/[^0-9]/g, '');
    return config.owner.number.some(owner => {
        const cleanOwner = owner.replace(/[^0-9]/g, '');
        return cleanNumber.includes(cleanOwner) || cleanOwner.includes(cleanNumber);
    });
}

/**
 * Fungsi untuk mengecek apakah nomor adalah premium user
 * @param {string} number - Nomor WhatsApp untuk dicek
 * @returns {boolean} True jika nomor adalah premium user
 * @example
 * if (isPremium('6281234567890')) {
 *   console.log('Ini premium user!');
 * }
 */
function isPremium(number) {
    if (!number) return false;
    if (isOwner(number)) return true;
    const cleanNumber = number.replace(/[^0-9]/g, '');
    return config.premiumUsers.some(premium => {
        const cleanPremium = premium.replace(/[^0-9]/g, '');
        return cleanNumber.includes(cleanPremium) || cleanPremium.includes(cleanNumber);
    });
}

/**
 * Fungsi untuk mengecek apakah nomor dibanned
 * @param {string} number - Nomor WhatsApp untuk dicek
 * @returns {boolean} True jika nomor dibanned
 */
function isBanned(number) {
    if (!number) return false;
    const cleanNumber = number.replace(/[^0-9]/g, '');
    return config.bannedUsers.some(banned => {
        const cleanBanned = banned.replace(/[^0-9]/g, '');
        return cleanNumber.includes(cleanBanned) || cleanBanned.includes(cleanNumber);
    });
}

module.exports = {
    ...config,
    config,
    getConfig,
    isOwner,
    isPremium,
    isBanned
};
