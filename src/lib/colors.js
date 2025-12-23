/**
 * @file src/lib/colors.js
 * @description Custom futuristic console logger dengan 4 warna utama
 * @author Ourin-AI Team
 * @version 2.0.0
 * 
 * Color Scheme:
 * - Bright Green (#00FF00) - untuk highlights & icons
 * - Phantom Purple (#9B30FF) - untuk accents
 * - White (#FFFFFF) - untuk brackets & text utama
 * - Gray (#808080) - untuk text secondary
 */

/**
 * ANSI Escape Codes untuk terminal colors
 */
const CODES = {
    // Reset
    reset: '\x1b[0m',
    
    // Styles
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    
    // Main 4 Colors
    green: '\x1b[92m',      // Bright Green
    purple: '\x1b[35m',     // Phantom Purple
    white: '\x1b[97m',      // Bright White
    gray: '\x1b[90m',       // Gray
    
    // Extended colors (RGB)
    phantom: '\x1b[38;2;155;48;255m',   // #9B30FF Phantom Purple
    lime: '\x1b[38;2;0;255;0m',         // #00FF00 Bright Green/Lime
    silver: '\x1b[38;2;192;192;192m',   // #C0C0C0 Silver Gray
    
    // Additional
    red: '\x1b[91m',
    yellow: '\x1b[93m',
    blue: '\x1b[94m',
    cyan: '\x1b[96m',
    magenta: '\x1b[95m',
    
    // Background
    bgBlack: '\x1b[40m',
    bgGray: '\x1b[100m'
};

/**
 * Color helper functions dengan 4 warna utama
 */
const c = {
    // Main colors
    green: (text) => `${CODES.lime}${text}${CODES.reset}`,
    purple: (text) => `${CODES.phantom}${text}${CODES.reset}`,
    white: (text) => `${CODES.white}${text}${CODES.reset}`,
    gray: (text) => `${CODES.gray}${text}${CODES.reset}`,
    
    // Styles
    bold: (text) => `${CODES.bold}${text}${CODES.reset}`,
    dim: (text) => `${CODES.dim}${text}${CODES.reset}`,
    
    // Combinations
    greenBold: (text) => `${CODES.bold}${CODES.lime}${text}${CODES.reset}`,
    purpleBold: (text) => `${CODES.bold}${CODES.phantom}${text}${CODES.reset}`,
    whiteBold: (text) => `${CODES.bold}${CODES.white}${text}${CODES.reset}`,
    grayDim: (text) => `${CODES.dim}${CODES.gray}${text}${CODES.reset}`,
    
    // Extra
    red: (text) => `${CODES.red}${text}${CODES.reset}`,
    yellow: (text) => `${CODES.yellow}${text}${CODES.reset}`,
    cyan: (text) => `${CODES.cyan}${text}${CODES.reset}`
};

/**
 * Box drawing characters
 */
const BOX = {
    tl: '╭', tr: '╮', bl: '╰', br: '╯',
    h: '─', v: '│', cross: '┼'
};

/**
 * ASCII Art Banner - Ultra Futuristic
 */
const ASCII_BANNER = `
${c.purple('╔══════════════════════════════════════════════════════════════╗')}
${c.purple('║')}  ${c.green('  ██████╗ ██╗   ██╗██████╗ ██╗███╗   ██╗     █████╗ ██╗ ')}  ${c.purple('║')}
${c.purple('║')}  ${c.green(' ██╔═══██╗██║   ██║██╔══██╗██║████╗  ██║    ██╔══██╗██║ ')}  ${c.purple('║')}
${c.purple('║')}  ${c.green(' ██║   ██║██║   ██║██████╔╝██║██╔██╗ ██║    ███████║██║ ')}  ${c.purple('║')}
${c.purple('║')}  ${c.green(' ██║   ██║██║   ██║██╔══██╗██║██║╚██╗██║    ██╔══██║██║ ')}  ${c.purple('║')}
${c.purple('║')}  ${c.green(' ╚██████╔╝╚██████╔╝██║  ██║██║██║ ╚████║    ██║  ██║██║ ')}  ${c.purple('║')}
${c.purple('║')}  ${c.green('  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝    ╚═╝  ╚═╝╚═╝ ')}  ${c.purple('║')}
${c.purple('╠══════════════════════════════════════════════════════════════╣')}
${c.purple('║')}  ${c.white('WhatsApp Multi-Device Bot')}  ${c.gray('│')}  ${c.green('Powered by Baileys')}              ${c.purple('║')}
${c.purple('╚══════════════════════════════════════════════════════════════╝')}
`;

/**
 * Mini banner untuk startup
 */
const MINI_BANNER = `
${c.purple('┌─────────────────────────────────┐')}
${c.purple('│')}  ${c.greenBold('OURIN-AI')} ${c.gray('• WhatsApp MD Bot')}   ${c.purple('│')}
${c.purple('└─────────────────────────────────┘')}
`;

/**
 * Format timestamp
 */
function getTimestamp() {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
    return c.gray(time);
}

/**
 * Custom Logger dengan format futuristik
 * Format: [+] Message (gray secondary text)
 */
const logger = {
    /**
     * Info log - [+] green icon
     * @param {string} message - Pesan utama
     * @param {string} [detail] - Detail (gray)
     */
    info: (message, detail = '') => {
        const icon = `${c.white('[')}${c.green('+')}${c.white(']')}`;
        const detailStr = detail ? ` ${c.gray(detail)}` : '';
        console.log(`${icon} ${c.white(message)}${detailStr}`);
    },
    
    /**
     * Success log - [] green icon
     * @param {string} message - Pesan utama
     * @param {string} [detail] - Detail (gray)
     */
    success: (message, detail = '') => {
        const icon = `${c.white('[')}${c.green('')}${c.white(']')}`;
        const detailStr = detail ? ` ${c.gray(detail)}` : '';
        console.log(`${icon} ${c.green(message)}${detailStr}`);
    },
    
    /**
     * Warning log - [!] yellow icon
     * @param {string} message - Pesan utama
     * @param {string} [detail] - Detail (gray)
     */
    warn: (message, detail = '') => {
        const icon = `${c.white('[')}${c.yellow('!')}${c.white(']')}`;
        const detailStr = detail ? ` ${c.gray(detail)}` : '';
        console.log(`${icon} ${c.yellow(message)}${detailStr}`);
    },
    
    /**
     * Error log - [✗] red icon
     * @param {string} message - Pesan utama
     * @param {string} [detail] - Detail (gray)
     */
    error: (message, detail = '') => {
        const icon = `${c.white('[')}${c.red('✗')}${c.white(']')}`;
        const detailStr = detail ? ` ${c.gray(detail)}` : '';
        console.log(`${icon} ${c.red(message)}${detailStr}`);
    },
    
    /**
     * System log - [*] purple icon
     * @param {string} message - Pesan utama
     * @param {string} [detail] - Detail (gray)
     */
    system: (message, detail = '') => {
        const icon = `${c.white('[')}${c.purple('*')}${c.white(']')}`;
        const detailStr = detail ? ` ${c.gray(detail)}` : '';
        console.log(`${icon} ${c.purple(message)}${detailStr}`);
    },
    
    /**
     * Debug log - [~] gray icon
     * @param {string} message - Pesan utama
     * @param {string} [detail] - Detail (gray)
     */
    debug: (message, detail = '') => {
        const icon = `${c.white('[')}${c.gray('~')}${c.white(']')}`;
        const detailStr = detail ? ` ${c.gray(detail)}` : '';
        console.log(`${icon} ${c.gray(message)}${detailStr}`);
    },
    
    /**
     * Custom tag log
     * @param {string} tag - Tag name
     * @param {string} message - Pesan
     * @param {string} [detail] - Detail (gray)
     */
    tag: (tag, message, detail = '') => {
        const tagStr = `${c.white('[')}${c.green(tag)}${c.white(']')}`;
        const detailStr = detail ? ` ${c.gray(detail)}` : '';
        console.log(`${tagStr} ${c.white(message)}${detailStr}`);
    }
};

/**
 * Message box logger untuk chat messages
 * @param {string} chatType - Private/Group
 * @param {string} sender - Nama pengirim
 * @param {string} message - Pesan
 */
function logMessage(chatType, sender, message) {
    // Skip empty messages
    if (!message || message.trim() === '') return;
    
    // Skip Unknown senders
    if (!sender || sender === 'Unknown' || sender.trim() === '') return;
    
    const type = chatType === 'group' ? c.purple('GRP') : c.green('PVT');
    const time = getTimestamp();
    const msgDisplay = message.substring(0, 40) + (message.length > 40 ? '...' : '');
    
    console.log('');
    console.log(`${c.purple(BOX.tl)}${c.purple(BOX.h.repeat(45))}${c.purple(BOX.tr)}`);
    console.log(`${c.purple(BOX.v)} ${c.green('💬')} ${c.greenBold('MESSAGE RECEIVED')}`);
    console.log(`${c.purple(BOX.v)} ${c.gray('├─')} ${c.white('From')}: ${c.white(sender)}`);
    console.log(`${c.purple(BOX.v)} ${c.gray('├─')} ${c.white('Type')}: ${type}`);
    console.log(`${c.purple(BOX.v)} ${c.gray('├─')} ${c.white('Msg')}: ${c.gray(msgDisplay)}`);
    console.log(`${c.purple(BOX.v)} ${c.gray('└─')} ${c.white('Time')}: ${time}`);
    console.log(`${c.purple(BOX.bl)}${c.purple(BOX.h.repeat(45))}${c.purple(BOX.br)}`);
}

/**
 * Command execution box logger
 * @param {string} command - Command yang dieksekusi
 * @param {string} user - User yang menjalankan
 * @param {string} chatType - Private/Group
 */
function logCommand(command, user, chatType) {
    const type = chatType === 'group' ? c.purple('GRP') : c.green('PVT');
    const time = getTimestamp();
    
    console.log('');
    console.log(`${c.purple(BOX.tl)}${c.purple(BOX.h.repeat(45))}${c.purple(BOX.tr)}`);
    console.log(`${c.purple(BOX.v)} ${c.green('⚡')} ${c.greenBold('COMMAND EXECUTED')}`);
    console.log(`${c.purple(BOX.v)} ${c.gray('├─')} ${c.white('Cmd')}: ${c.green(command)}`);
    console.log(`${c.purple(BOX.v)} ${c.gray('├─')} ${c.white('User')}: ${c.white(user)}`);
    console.log(`${c.purple(BOX.v)} ${c.gray('├─')} ${c.white('Type')}: ${type}`);
    console.log(`${c.purple(BOX.v)} ${c.gray('└─')} ${c.white('Time')}: ${time}`);
    console.log(`${c.purple(BOX.bl)}${c.purple(BOX.h.repeat(45))}${c.purple(BOX.br)}`);
}

/**
 * Plugin load logger
 * @param {string} name - Nama plugin
 * @param {string} category - Kategori plugin
 */
function logPlugin(name, category) {
    const icon = `${c.white('[')}${c.green('+')}${c.white(']')}`;
    console.log(`${icon} ${c.white('Plugin')}: ${c.green(name)} ${c.gray(`(${category})`)}`);
}

/**
 * Connection status box
 * @param {string} status - Status koneksi
 * @param {string} info - Info tambahan
 */
function logConnection(status, info = '') {
    const statusColor = status === 'connected' 
        ? c.green('● CONNECTED') 
        : status === 'connecting' 
            ? c.yellow('◐ CONNECTING')
            : c.red('○ DISCONNECTED');
    
    console.log('');
    console.log(`${c.purple('╔')}${c.purple('═'.repeat(40))}${c.purple('╗')}`);
    console.log(`${c.purple('║')} ${statusColor} ${info ? c.gray(`• ${info}`) : ''}`);
    console.log(`${c.purple('╚')}${c.purple('═'.repeat(40))}${c.purple('╝')}`);
}

/**
 * Error box logger
 * @param {string} title - Judul error
 * @param {string} message - Pesan error
 */
function logErrorBox(title, message) {
    console.log('');
    console.log(`${c.red('╔')}${c.red('═'.repeat(50))}${c.red('╗')}`);
    console.log(`${c.red('║')} ${c.red('✗')} ${c.red(title)}`);
    console.log(`${c.red('╠')}${c.red('═'.repeat(50))}${c.red('╣')}`);
    console.log(`${c.red('║')} ${c.gray(message.substring(0, 48))}`);
    console.log(`${c.red('╚')}${c.red('═'.repeat(50))}${c.red('╝')}`);
}

/**
 * Print banner
 * @param {boolean} [mini=false] - Use mini banner
 */
function printBanner(mini = false) {
    console.clear();
    console.log(mini ? MINI_BANNER : ASCII_BANNER);
}

/**
 * Startup info box
 * @param {Object} info - Info startup
 */
function printStartup(info = {}) {
    const {
        name = 'Ourin-AI',
        version = '1.0.0',
        developer = 'Developer',
        mode = 'public'
    } = info;
    
    console.log(`${c.gray('┌──')} ${c.greenBold('System Info')} ${c.gray('──────────────────┐')}`);
    console.log(`${c.gray('│')} ${c.white('Bot')}: ${c.green(name)}`);
    console.log(`${c.gray('│')} ${c.white('Version')}: ${c.purple(`v${version}`)}`);
    console.log(`${c.gray('│')} ${c.white('Developer')}: ${c.gray(developer)}`);
    console.log(`${c.gray('│')} ${c.white('Mode')}: ${c.green(mode)}`);
    console.log(`${c.gray('└')}${c.gray('─'.repeat(35))}${c.gray('┘')}`);
    console.log('');
}

/**
 * Divider line
 */
function divider() {
    console.log(c.gray('─'.repeat(50)));
}

module.exports = {
    // Colors
    c,
    CODES,
    
    // Logger
    logger,
    
    // Box loggers
    logMessage,
    logCommand,
    logPlugin,
    logConnection,
    logErrorBox,
    
    // Banner & Startup
    printBanner,
    printStartup,
    ASCII_BANNER,
    MINI_BANNER,
    
    // Utils
    getTimestamp,
    divider,
    BOX,
    
    // Direct color exports (legacy support)
    red: c.red,
    yellow: c.yellow,
    cyan: c.cyan,
    green: c.green,
    gray: c.gray,
    white: c.white,
    purple: c.purple,
    bold: c.bold,
    dim: c.dim,
    greenBold: c.greenBold,
    purpleBold: c.purpleBold,
    whiteBold: c.whiteBold,
    grayDim: c.grayDim,
    
    // Bright aliases
    brightGreen: c.green,
    brightRed: c.red,
    brightYellow: c.yellow,
    brightCyan: c.cyan
};

