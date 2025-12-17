/**
 * @file src/lib/formatter.js
 * @description Utility untuk formatting text, menu, dan dashboard dengan style yang menarik
 * @author Ourin-AI Team
 * @version 1.0.0
 */

const config = require('../../config');

/**
 * @typedef {Object} DashboardData
 * @property {string} userName - Nama user
 * @property {string} userStatus - Status user (Owner/Premium/Free)
 * @property {string} mode - Mode bot (Public/Self)
 * @property {number} totalUsers - Total pengguna bot
 * @property {number} userLimit - Limit user
 */

/**
 * @typedef {Object} BotInfoData
 * @property {string} botName - Nama bot
 * @property {string} developer - Nama developer
 * @property {string} version - Versi bot
 * @property {string} uptime - Uptime bot
 * @property {number} totalFeatures - Total fitur
 * @property {string} mode - Mode bot
 * @property {string} platform - Platform bot
 */

/**
 * @typedef {Object} UserProfileData
 * @property {string} name - Nama user
 * @property {string} number - Nomor user
 * @property {string} status - Status (Owner/Premium/Free)
 * @property {number} limit - Limit tersisa
 * @property {string} registeredAt - Tanggal registrasi
 */

/**
 * @typedef {Object} MenuCategory
 * @property {string} name - Nama kategori
 * @property {string} emoji - Emoji kategori
 * @property {string} description - Deskripsi kategori
 * @property {string[]} commands - Array command dalam kategori
 */

/**
 * Karakter untuk styling menu
 * @constant
 */
const CHARS = {
    cornerTopLeft: '╭',
    cornerTopRight: '╮',
    cornerBottomLeft: '╰',
    cornerBottomRight: '╯',
    horizontal: '─',
    vertical: '│',
    arrow: '➣',
    bullet: '◦',
    star: '✦',
    diamond: '◇',
    dot: '•',
    check: '',
    cross: '✗',
    line: '━'
};

/**
 * Emoji untuk berbagai kebutuhan
 * @constant
 */
const EMOJIS = {
    dashboard: '📊',
    info: 'ℹ️',
    user: '👤',
    bot: '🤖',
    owner: '👑',
    premium: '💎',
    free: '🆓',
    public: '🌐',
    self: '🔒',
    commands: '🖥️',
    utilities: '🔧',
    fun: '🎮',
    group: '👥',
    time: '⏰',
    uptime: '⏱️',
    version: '📌',
    speed: '⚡',
    limit: '📊',
    status: '📋',
    mode: '🔄',
    name: '📝',
    number: '📱',
    developer: '👨‍💻',
    total: '📈',
    tip: '💡',
    warning: '⚠️',
    success: '✅',
    error: '❌',
    loading: '⏳'
};

/**
 * Format uptime menjadi string yang mudah dibaca
 * @param {number} ms - Uptime dalam milliseconds
 * @returns {string} Formatted uptime string
 * @example
 * formatUptime(3661000); // "1h 1m 1s"
 * formatUptime(86400000); // "1d 0h 0m"
 */
function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
}

/**
 * Format tanggal ke format lokal Indonesia
 * @param {Date|number|string} date - Tanggal untuk diformat
 * @returns {string} Formatted date string
 * @example
 * formatDate(new Date()); // "17/12/2024, 12:30:45"
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleString('id-ID', {
        timeZone: config.locale?.timezone || 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Format nomor telepon ke format yang lebih readable
 * @param {string} number - Nomor telepon
 * @returns {string} Formatted number
 * @example
 * formatNumber('6281234567890'); // '62 812-3456-7890'
 */
function formatNumber(number) {
    if (!number) return '';
    const cleaned = number.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) return cleaned;
    
    if (cleaned.startsWith('62')) {
        const withoutCode = cleaned.slice(2);
        const formatted = withoutCode.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
        return `62 ${formatted}`;
    }
    
    return cleaned;
}

/**
 * Format ukuran file ke format yang readable
 * @param {number} bytes - Ukuran dalam bytes
 * @returns {string} Formatted size string
 * @example
 * formatFileSize(1024); // "1.00 KB"
 * formatFileSize(1048576); // "1.00 MB"
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Buat garis horizontal
 * @param {number} length - Panjang garis
 * @param {string} [char='─'] - Karakter untuk garis
 * @returns {string} String garis
 */
function createLine(length = 20, char = CHARS.horizontal) {
    return char.repeat(length);
}

/**
 * Buat header box
 * @param {string} title - Judul header
 * @param {number} [width=20] - Lebar box
 * @returns {string} Header string
 * @example
 * createHeader('DASHBOARD'); 
 * // "╭─「 DASHBOARD 」─────╮"
 */
function createHeader(title, width = 20) {
    const titlePart = `${CHARS.horizontal}「 ${title} 」`;
    const remainingWidth = Math.max(0, width - titlePart.length - 2);
    return `${CHARS.cornerTopLeft}${titlePart}${createLine(remainingWidth)}${CHARS.cornerTopRight}`;
}

/**
 * Buat footer box
 * @param {number} [width=20] - Lebar box
 * @returns {string} Footer string
 * @example
 * createFooter(); // "╰────────────────────╯"
 */
function createFooter(width = 20) {
    return `${CHARS.cornerBottomLeft}${createLine(width)}${CHARS.cornerBottomRight}`;
}

/**
 * Buat baris body dengan bullet
 * @param {string} text - Text untuk baris
 * @param {string} [prefix='│'] - Prefix baris
 * @param {string} [bullet='◦'] - Karakter bullet
 * @returns {string} Formatted body line
 */
function createBodyLine(text, prefix = CHARS.vertical, bullet = CHARS.bullet) {
    return `${prefix} ${bullet} ${text}`;
}

/**
 * Buat baris dengan arrow
 * @param {string} label - Label
 * @param {string} value - Nilai
 * @returns {string} Formatted line dengan arrow
 * @example
 * createArrowLine('Nama', 'Ourin-AI'); // "│ ➣ Nama: Ourin-AI"
 */
function createArrowLine(label, value) {
    return `${CHARS.vertical} ${CHARS.arrow} ${label}: ${value}`;
}

/**
 * Buat dashboard info
 * @param {DashboardData} data - Data untuk dashboard
 * @returns {string} Formatted dashboard string
 */
function createDashboard(data) {
    const {
        userName = 'User',
        userStatus = 'Free User',
        mode = 'Public',
        totalUsers = 0,
        userLimit = 25
    } = data;
    
    const lines = [
        `${CHARS.cornerTopLeft}${CHARS.horizontal}「 ${EMOJIS.dashboard} DASHBOARD 」${CHARS.horizontal}`,
        `${CHARS.vertical}`,
        createArrowLine('Nama', userName),
        createArrowLine('Status User', userStatus),
        createArrowLine('Mode', mode),
        createArrowLine('Pengguna', totalUsers.toString()),
        createArrowLine('Limit', userLimit.toString()),
        `${CHARS.vertical}`,
        `${CHARS.cornerBottomLeft}${createLine(24)}`
    ];
    
    return lines.join('\n');
}

/**
 * Buat info bot
 * @param {BotInfoData} data - Data info bot
 * @returns {string} Formatted bot info string
 */
function createBotInfo(data) {
    const {
        botName = config.bot?.name || 'Ourin-AI',
        developer = config.owner?.name || 'Owner',
        version = config.bot?.version || '1.0.0',
        uptime = '0s',
        totalFeatures = 0,
        mode = config.mode || 'public',
        platform = 'Node.js'
    } = data;
    
    const lines = [
        `${CHARS.horizontal} *Informasi Bot* ${CHARS.horizontal}`,
        ``,
        `${CHARS.dot} Nama-Bot : ${botName} 🌿`,
        `${CHARS.dot} Developer : ${developer}`,
        `${CHARS.dot} Mode : ${mode.charAt(0).toUpperCase() + mode.slice(1)}`,
        `${CHARS.dot} Version : ${version}`,
        `${CHARS.dot} Uptime : ${uptime}`,
        `${CHARS.dot} Total-Fitur : ${totalFeatures}`,
        `${CHARS.dot} Platform : ${platform}`,
        ``
    ];
    
    return lines.join('\n');
}

/**
 * Buat user profile
 * @param {UserProfileData} data - Data user profile
 * @returns {string} Formatted user profile string
 */
function createUserProfile(data) {
    const {
        name = 'User',
        number = '',
        status = 'Free',
        limit = 25,
        registeredAt = ''
    } = data;
    
    const statusEmoji = status === 'Owner' ? EMOJIS.owner : 
                       status === 'Premium' ? EMOJIS.premium : 
                       EMOJIS.free;
    
    const lines = [
        `【 USER PROFILE 】`,
        `${EMOJIS.name} Nama   : ${name}`,
        `${EMOJIS.number} Nomor  : ${formatNumber(number)}`,
        `${statusEmoji} Status : ${status}`,
        `${EMOJIS.limit} Limit  : ${limit}`,
        ``
    ];
    
    if (registeredAt) {
        lines.splice(5, 0, `${EMOJIS.time} Daftar : ${registeredAt}`);
    }
    
    return lines.join('\n');
}

/**
 * Buat status bot
 * @param {Object} data - Data status bot
 * @returns {string} Formatted bot status string
 */
function createBotStatus(data) {
    const {
        botName = config.bot?.name || 'Ourin-AI',
        uptime = '0s',
        mode = 'Public',
        totalCommands = 0,
        totalUsers = 0,
        speed = '0.00s'
    } = data;
    
    const lines = [
        `【 BOT STATUS 】`,
        `${EMOJIS.bot} Bot      : ${botName}`,
        `${EMOJIS.uptime} Uptime   : ${uptime}`,
        `${EMOJIS.mode} Mode     : ${mode}`,
        `${EMOJIS.commands} Commands : ${totalCommands} fitur`,
        `${EMOJIS.user} Pengguna : ${totalUsers} users`,
        `${EMOJIS.speed} Speed    : ${speed}`,
        ``
    ];
    
    return lines.join('\n');
}

/**
 * Buat kategori menu
 * @param {MenuCategory} category - Data kategori
 * @param {string} prefix - Prefix command
 * @returns {string} Formatted category menu
 */
function createCategoryMenu(category, prefix = config.command?.prefix || '.') {
    const { name, emoji, description = '', commands = [] } = category;
    
    if (commands.length === 0) {
        return '';
    }
    
    const header = `${emoji} *${name}*`;
    const commandList = commands.map(cmd => `${CHARS.vertical} ${prefix}${cmd}`).join('\n');
    const footer = `${CHARS.cornerBottomLeft}${createLine(15)}`;
    
    return `${header}\n${commandList}\n${footer}`;
}

/**
 * Buat kategori menu dengan sub-description
 * @param {Object} data - Data kategori menu
 * @returns {string} Formatted category section
 */
function createCategorySection(data) {
    const { emoji, title, command, description, prefix = '.' } = data;
    
    const lines = [
        `${emoji} *${title}*`,
        `  Ketik: ${prefix}${command}`,
        `  ${CHARS.vertical} ( ${description} )`,
        ``
    ];
    
    return lines.join('\n');
}

/**
 * Buat main menu lengkap
 * @param {Object} data - Data untuk main menu
 * @returns {string} Formatted main menu string
 */
function createMainMenu(data) {
    const {
        greeting = '',
        userName = 'User',
        userStatus = 'Free User',
        categories = [],
        botInfo = {},
        prefix = config.command?.prefix || '.'
    } = data;
    
    const parts = [];
    
    if (greeting) {
        parts.push(greeting);
        parts.push('');
    }
    
    parts.push(createDashboard({ userName, userStatus, ...data }));
    parts.push('');
    
    parts.push(createBotInfo(botInfo));
    parts.push('');
    
    for (const category of categories) {
        parts.push(createCategorySection({
            ...category,
            prefix
        }));
    }
    
    parts.push(`${EMOJIS.tip} *Tips:* Jika kamu tidak tahu cara menggunakan Bot`);
    parts.push(`Kamu bisa tanya ke owner`);
    parts.push(`${CHARS.vertical} Mode: ${data.mode || 'Public'}`);
    
    return parts.join('\n');
}

/**
 * Buat command list untuk kategori tertentu
 * @param {string} categoryName - Nama kategori
 * @param {string[]} commands - Array command
 * @param {string} prefix - Prefix command
 * @returns {string} Formatted command list
 */
function createCommandList(categoryName, commands, prefix = '.') {
    const emoji = config.categoryEmojis?.[categoryName.toLowerCase()] || '📋';
    
    const lines = [
        `${CHARS.cornerTopLeft}${CHARS.horizontal}❏ ${emoji} *${categoryName.toUpperCase()}*`,
        ''
    ];
    
    for (const cmd of commands) {
        lines.push(`${CHARS.vertical} ${prefix}${cmd}`);
    }
    
    lines.push('');
    lines.push(`${CHARS.cornerBottomLeft}${createLine(20)}`);
    
    return lines.join('\n');
}

/**
 * Buat pesan wait/loading
 * @param {string} [message='Tunggu sebentar...'] - Pesan loading
 * @returns {string} Formatted wait message
 */
function createWaitMessage(message = 'Tunggu sebentar...') {
    return `${EMOJIS.loading} *${message}*`;
}

/**
 * Buat pesan sukses
 * @param {string} [message='Berhasil!'] - Pesan sukses
 * @returns {string} Formatted success message
 */
function createSuccessMessage(message = 'Berhasil!') {
    return `${EMOJIS.success} *${message}*`;
}

/**
 * Buat pesan error
 * @param {string} [message='Terjadi kesalahan!'] - Pesan error
 * @returns {string} Formatted error message
 */
function createErrorMessage(message = 'Terjadi kesalahan!') {
    return `${EMOJIS.error} *${message}*`;
}

/**
 * Buat pesan warning
 * @param {string} message - Pesan warning
 * @returns {string} Formatted warning message
 */
function createWarningMessage(message) {
    return `${EMOJIS.warning} *${message}*`;
}

/**
 * Mendapatkan greeting berdasarkan waktu
 * @returns {string} Greeting message
 * @example
 * getTimeGreeting(); // "Selamat Pagi" (jika pagi hari)
 */
function getTimeGreeting() {
    const hour = new Date().toLocaleString('en-US', { 
        timeZone: config.locale?.timezone || 'Asia/Jakarta',
        hour: 'numeric',
        hour12: false
    });
    
    const h = parseInt(hour);
    
    if (h >= 4 && h < 10) return 'Selamat Pagi 🌅';
    if (h >= 10 && h < 15) return 'Selamat Siang ☀️';
    if (h >= 15 && h < 18) return 'Selamat Sore 🌇';
    return 'Selamat Malam 🌙';
}

/**
 * Capitalize setiap kata dalam string
 * @param {string} str - String untuk di-capitalize
 * @returns {string} Capitalized string
 * @example
 * capitalize('hello world'); // "Hello World"
 */
function capitalize(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Truncate text jika terlalu panjang
 * @param {string} text - Text untuk di-truncate
 * @param {number} maxLength - Panjang maksimal
 * @param {string} [suffix='...'] - Suffix jika di-truncate
 * @returns {string} Truncated text
 */
function truncate(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
}

module.exports = {
    CHARS,
    EMOJIS,
    formatUptime,
    formatDate,
    formatNumber,
    formatFileSize,
    createLine,
    createHeader,
    createFooter,
    createBodyLine,
    createArrowLine,
    createDashboard,
    createBotInfo,
    createUserProfile,
    createBotStatus,
    createCategoryMenu,
    createCategorySection,
    createMainMenu,
    createCommandList,
    createWaitMessage,
    createSuccessMessage,
    createErrorMessage,
    createWarningMessage,
    getTimeGreeting,
    capitalize,
    truncate
};
