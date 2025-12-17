/**
 * @file src/connection.js
 * @description Handler koneksi WhatsApp menggunakan Baileys dengan Pairing Code support
 * @author Ourin-AI Team
 * @version 1.0.0
 */

const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} = require('@rexxhayanasi/elaina-baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const config = require('../config');
const colors = require('./lib/colors');
const { extendSocket } = require('./lib/sockHelper');

/**
 * @typedef {Object} ConnectionState
 * @property {boolean} isConnected - Status koneksi
 * @property {Object|null} sock - Socket instance
 * @property {number} reconnectAttempts - Jumlah percobaan reconnect
 * @property {Date|null} connectedAt - Waktu koneksi berhasil
 */

/**
 * State koneksi global
 * @type {ConnectionState}
 */
const connectionState = {
    isConnected: false,
    sock: null,
    reconnectAttempts: 0,
    connectedAt: null
};

/**
 * Logger instance dengan level minimal
 * @type {Object}
 */
const logger = pino({ 
    level: 'silent'
});

/**
 * Interface untuk input terminal
 * @type {readline.Interface|null}
 */
let rl = null;

/**
 * Suppress internal Baileys console logs
 */
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

const suppressPatterns = [
    'Failed to decrypt message',
    'Bad MAC',
    'Session error',
    'Closing session',
    'SessionEntry',
    'Closing open session',
    '_chains',
    'chainKey',
    'registrationId',
    'currentRatchet',
    'ephemeralKeyPair',
    'indexInfo',
    'baseKey'
];

console.log = (...args) => {
    const message = args.join(' ');
    const shouldSuppress = suppressPatterns.some(pattern => message.includes(pattern));
    if (!shouldSuppress) {
        originalConsoleLog.apply(console, args);
    }
};

console.error = (...args) => {
    const message = args.join(' ');
    const shouldSuppress = suppressPatterns.some(pattern => message.includes(pattern));
    if (!shouldSuppress) {
        originalConsoleError.apply(console, args);
    }
};

/**
 * Membuat readline interface
 * @returns {readline.Interface}
 */
function createReadlineInterface() {
    if (rl) {
        rl.close();
    }
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return rl;
}

/**
 * Prompt untuk input
 * @param {string} question - Pertanyaan
 * @returns {Promise<string>} Input dari user
 */
function askQuestion(question) {
    return new Promise((resolve) => {
        const interface = createReadlineInterface();
        interface.question(question, (answer) => {
            interface.close();
            resolve(answer.trim());
        });
    });
}

/**
 * Memulai koneksi WhatsApp
 * @param {Object} options - Opsi koneksi
 * @param {Function} [options.onMessage] - Callback untuk pesan baru
 * @param {Function} [options.onConnectionUpdate] - Callback untuk update koneksi
 * @param {Function} [options.onGroupUpdate] - Callback untuk update group
 * @returns {Promise<Object>} Socket connection
 * @example
 * const sock = await startConnection({
 *   onMessage: async (m) => {
 *     console.log('New message:', m.body);
 *   }
 * });
 */
async function startConnection(options = {}) {
    const sessionPath = path.join(process.cwd(), 'storage', config.session?.folderName || 'session');
    
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    
    const { version, isLatest } = await fetchLatestBaileysVersion();
    colors.logger.info('Connection', `Menggunakan WA v${version.join('.')}, isLatest: ${isLatest}`);
    
    const usePairingCode = config.session?.pairingCode === true;
    const pairingNumber = config.session?.pairingNumber || '';
    
    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: !usePairingCode && (config.session?.printQRInTerminal ?? true),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        browser: ['Ubuntu', 'Chrome', '20.0.0'],
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        defaultQueryTimeoutMs: undefined
    });
    
    connectionState.sock = sock;
    
    // Extend socket with helper methods
    extendSocket(sock);
    
    if (usePairingCode && !sock.authState.creds.registered) {
        let phoneNumber = pairingNumber;
        
        if (!phoneNumber) {
            console.log('');
            colors.logger.warn('Pairing', 'Nomor pairing tidak diset di config!');
            console.log('');
            phoneNumber = await askQuestion(colors.cyan('📱 Masukkan nomor WhatsApp (contoh: 6281234567890): '));
        }
        
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        if (!phoneNumber.startsWith('62')) {
            if (phoneNumber.startsWith('0')) {
                phoneNumber = '62' + phoneNumber.slice(1);
            } else {
                phoneNumber = '62' + phoneNumber;
            }
        }
        
        colors.logger.info('Pairing', `Meminta pairing code untuk ${phoneNumber}...`);
        
        try {
            const code = await sock.requestPairingCode(phoneNumber, "OURINNAI");
            console.log('');
            console.log(colors.createBanner([
                '',
                '   PAIRING CODE   ',
                '',
                `   ${colors.bold(colors.brightGreen(code))}   `,
                '',
                '  Masukkan kode ini di WhatsApp  ',
                '  Settings > Linked Devices > Link a Device  ',
                ''
            ], 'green'));
            console.log('');
        } catch (error) {
            colors.logger.error('Pairing', 'Gagal mendapatkan pairing code:', error.message);
        }
    }
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr && !usePairingCode) {
            colors.logger.info('QR', 'QR Code diterima, silakan scan!');
        }
        
        if (connection === 'close') {
            connectionState.isConnected = false;
            
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
                : true;
            
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            colors.logger.warn('Connection', `Terputus. Status: ${statusCode}. Reconnect: ${shouldReconnect}`);
            
            if (shouldReconnect) {
                connectionState.reconnectAttempts++;
                const maxAttempts = config.session?.maxReconnectAttempts || 10;
                
                if (connectionState.reconnectAttempts <= maxAttempts) {
                    const delay = config.session?.reconnectInterval || 5000;
                    colors.logger.info('Connection', `Menyambung ulang dalam ${delay}ms... (${connectionState.reconnectAttempts}/${maxAttempts})`);
                    
                    setTimeout(() => {
                        startConnection(options);
                    }, delay);
                } else {
                    colors.logger.error('Connection', 'Maksimum percobaan reconnect tercapai. Restart manual diperlukan.');
                }
            } else {
                colors.logger.info('Connection', 'Logged out. Hapus folder session dan restart.');
                connectionState.reconnectAttempts = 0;
            }
        }
        
        if (connection === 'open') {
            connectionState.isConnected = true;
            connectionState.reconnectAttempts = 0;
            connectionState.connectedAt = new Date();
            
            console.log('');
            colors.logger.success('Connection', 'Terhubung ke WhatsApp!');
            colors.logger.info('Bot', `Nama: ${config.bot?.name || 'Ourin-AI'}`);
            colors.logger.info('Bot', `Nomor: ${sock.user?.id?.split(':')[0] || 'Unknown'}`);
            console.log('');
        }
        
        if (options.onConnectionUpdate) {
            await options.onConnectionUpdate(update, sock);
        }
    });
    
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        for (const msg of messages) {
            if (!msg.message) continue;
            
            // Filter non-user messages
            const jid = msg.key.remoteJid || '';
            
            // Skip status broadcast
            if (jid === 'status@broadcast') continue;
            
            // Skip newsletter/channel messages
            if (jid.endsWith('@newsletter')) {
                colors.logger.debug('Skip', 'Newsletter message filtered');
                continue;
            }
            
            // Skip lid messages (legacy)
            if (jid.endsWith('@lid')) {
                colors.logger.debug('Skip', 'LID message filtered');
                continue;
            }
            
            // Skip broadcast lists
            if (jid.endsWith('@broadcast')) {
                colors.logger.debug('Skip', 'Broadcast message filtered');
                continue;
            }
            
            // Skip undefined/invalid JIDs
            if (!jid || jid === 'undefined' || jid.length < 5) {
                colors.logger.debug('Skip', 'Invalid JID filtered');
                continue;
            }
            
            if (options.onMessage) {
                try {
                    await options.onMessage(msg, sock);
                } catch (error) {
                    colors.logger.error('Message', error.message);
                }
            }
        }
    });
    
    sock.ev.on('group-participants.update', async (update) => {
        if (options.onGroupUpdate) {
            await options.onGroupUpdate(update, sock);
        }
    });
    
    sock.ev.on('groups.update', async (updates) => {
        for (const update of updates) {
            colors.logger.debug('Group', `Updated: ${update.id}`);
        }
    });
    
    if (config.features?.antiCall) {
        sock.ev.on('call', async (calls) => {
            for (const call of calls) {
                if (call.status === 'offer') {
                    colors.logger.warn('Call', `Menolak panggilan dari ${call.from}`);
                    await sock.rejectCall(call.id, call.from);
                    
                    await sock.sendMessage(call.from, {
                        text: '🚫 *Auto Reject Call*\n\nMaaf, bot tidak menerima panggilan. Silakan kirim pesan teks saja.'
                    });
                }
            }
        });
    }
    
    return sock;
}

/**
 * Mendapatkan status koneksi
 * @returns {ConnectionState} State koneksi saat ini
 */
function getConnectionState() {
    return connectionState;
}

/**
 * Mendapatkan socket instance
 * @returns {Object|null} Socket atau null jika tidak terkoneksi
 */
function getSocket() {
    return connectionState.sock;
}

/**
 * Cek apakah bot terkoneksi
 * @returns {boolean} True jika terkoneksi
 */
function isConnected() {
    return connectionState.isConnected;
}

/**
 * Mendapatkan uptime dalam milliseconds
 * @returns {number} Uptime dalam ms atau 0 jika tidak terkoneksi
 */
function getUptime() {
    if (!connectionState.connectedAt) return 0;
    return Date.now() - connectionState.connectedAt.getTime();
}

/**
 * Logout dan hapus session
 * @returns {Promise<boolean>} True jika berhasil
 */
async function logout() {
    try {
        const sessionPath = path.join(process.cwd(), 'storage', config.session?.folderName || 'session');
        
        if (connectionState.sock) {
            await connectionState.sock.logout();
        }
        
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
        
        connectionState.isConnected = false;
        connectionState.sock = null;
        connectionState.connectedAt = null;
        
        colors.logger.success('Connection', 'Logged out dan session dihapus');
        return true;
    } catch (error) {
        colors.logger.error('Connection', 'Logout error:', error.message);
        return false;
    }
}

module.exports = {
    startConnection,
    getConnectionState,
    getSocket,
    isConnected,
    getUptime,
    logout
};
