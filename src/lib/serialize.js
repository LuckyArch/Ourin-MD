/**
 * @file src/lib/serialize.js
 * @description Message serializer lengkap dengan full fitur untuk memformat pesan WhatsApp
 * @author Ourin-AI Team
 * @version 2.0.0
 * 
 * Fitur:
 * - Full context info untuk setiap pesan
 * - Modular reply dengan berbagai tipe
 * - Support untuk semua tipe media
 * - Quote message dengan context
 * - Fake reply/forward support
 */

const { 
    downloadContentFromMessage, 
    getContentType, 
    jidDecode,
    proto,
    generateWAMessageFromContent,
    generateWAMessage,
    areJidsSameUser
} = require('@rexxhayanasi/elaina-baileys');
const { writeFileSync, mkdirSync, existsSync, unlinkSync } = require('fs');
const { join } = require('path');
const config = require('../../config');
const { isLid, lidToJid, convertLidArray, decodeAndNormalize } = require('./lidHelper');

/**
 * @typedef {Object} ContextInfo
 * @property {string} stanzaId - ID pesan yang di-quote
 * @property {string} participant - JID participant yang di-quote
 * @property {Object} quotedMessage - Pesan yang di-quote
 * @property {string[]} mentionedJid - Array JID yang di-mention
 * @property {boolean} isForwarded - Apakah pesan forwarded
 * @property {number} forwardingScore - Skor forwarding
 * @property {Object} externalAdReply - External ad reply (thumbnail)
 */

/**
 * @typedef {Object} SerializedMessage
 * @property {string} id - ID unik pesan
 * @property {string} chat - JID chat/group
 * @property {string} sender - JID pengirim
 * @property {string} senderNumber - Nomor pengirim tanpa @s.whatsapp.net
 * @property {string} pushName - Nama display pengirim
 * @property {boolean} fromMe - Apakah pesan dari bot sendiri
 * @property {boolean} isGroup - Apakah pesan dari group
 * @property {boolean} isOwner - Apakah pengirim adalah owner
 * @property {boolean} isPremium - Apakah pengirim adalah premium user
 * @property {boolean} isBanned - Apakah pengirim dibanned
 * @property {boolean} isBot - Apakah pengirim adalah bot
 * @property {string} type - Tipe pesan
 * @property {string} body - Isi pesan text
 * @property {string} command - Command tanpa prefix
 * @property {string} prefix - Prefix yang digunakan
 * @property {string[]} args - Array argumen
 * @property {string} text - Text setelah command
 * @property {boolean} isCommand - Apakah pesan adalah command
 * @property {boolean} isMedia - Apakah ada media
 * @property {boolean} isImage - Apakah gambar
 * @property {boolean} isVideo - Apakah video
 * @property {boolean} isAudio - Apakah audio
 * @property {boolean} isSticker - Apakah sticker
 * @property {boolean} isDocument - Apakah dokumen
 * @property {boolean} isContact - Apakah kontak
 * @property {boolean} isLocation - Apakah lokasi
 * @property {boolean} isQuoted - Apakah ada pesan yang di-quote
 * @property {Object} quoted - Objek pesan yang di-quote
 * @property {string[]} mentionedJid - Array JID yang di-mention
 * @property {Object} groupMetadata - Metadata group (jika di group)
 * @property {boolean} isAdmin - Apakah pengirim admin group
 * @property {boolean} isBotAdmin - Apakah bot adalah admin
 * @property {Function} reply - Fungsi reply text
 * @property {Function} replyWithMentions - Fungsi reply dengan mentions
 * @property {Function} replyImage - Fungsi reply gambar
 * @property {Function} replyVideo - Fungsi reply video
 * @property {Function} replyAudio - Fungsi reply audio
 * @property {Function} replySticker - Fungsi reply sticker
 * @property {Function} replyDocument - Fungsi reply dokumen
 * @property {Function} replyContact - Fungsi reply kontak
 * @property {Function} replyLocation - Fungsi reply lokasi
 * @property {Function} replyWithQuote - Fungsi reply dengan fake quote
 * @property {Function} react - Fungsi react emoji
 * @property {Function} download - Fungsi download media
 * @property {Function} delete - Fungsi delete pesan
 * @property {Function} forward - Fungsi forward pesan
 */

/**
 * Decode JID menjadi format yang lebih bersih
 * @param {string} jid - JID yang akan di-decode
 * @returns {string|null} JID yang sudah di-decode atau null
 */
function decodeJid(jid) {
    if (!jid) return null;
    if (/:\d+@/gi.test(jid)) {
        const decoded = jidDecode(jid) || {};
        return (decoded.user && decoded.server && decoded.user + '@' + decoded.server) || jid;
    }
    return jid;
}

/**
 * Mendapatkan type content dari pesan
 * @param {Object} message - Objek pesan WhatsApp
 * @returns {string|null} Type content
 */
function getMessageType(message) {
    if (!message) return null;
    return getContentType(message);
}

/**
 * Mendapatkan text/body dari berbagai tipe pesan
 * @param {Object} message - Objek pesan WhatsApp
 * @param {string} type - Tipe pesan
 * @returns {string} Text/body pesan
 */
function getMessageBody(message, type) {
    if (!message || !type) return '';
    
    const messageContent = message[type];
    if (!messageContent) return '';
    
    switch (type) {
        case 'conversation':
            return message.conversation || '';
        case 'extendedTextMessage':
            return messageContent.text || '';
        case 'imageMessage':
        case 'videoMessage':
        case 'documentMessage':
            return messageContent.caption || '';
        case 'buttonsResponseMessage':
            return messageContent.selectedButtonId || '';
        case 'listResponseMessage':
            return messageContent.singleSelectReply?.selectedRowId || '';
        case 'templateButtonReplyMessage':
            return messageContent.selectedId || '';
        case 'interactiveResponseMessage':
            try {
                return JSON.parse(messageContent.nativeFlowResponseMessage?.paramsJson || '{}')?.id || '';
            } catch {
                return '';
            }
        case 'pollCreationMessage':
            return messageContent.name || '';
        default:
            return '';
    }
}

/**
 * Parse command dan argumen dari body pesan
 * @param {string} body - Body pesan
 * @param {string} prefix - Prefix command
 * @returns {Object} Command info
 */
function parseCommand(body, prefix) {
    const result = {
        isCommand: false,
        command: '',
        prefix: '',
        args: [],
        text: '',
        fullArgs: ''
    };
    
    if (!body) return result;
    
    const prefixList = config.command?.multiPrefix ? config.command.prefixList : [prefix];
    
    for (const p of prefixList) {
        if (body.startsWith(p)) {
            result.isCommand = true;
            result.prefix = p;
            
            const withoutPrefix = body.slice(p.length).trim();
            const parts = withoutPrefix.split(/\s+/);
            
            result.command = config.command?.caseSensitive 
                ? parts[0] 
                : parts[0].toLowerCase();
            result.args = parts.slice(1);
            result.text = result.args.join(' ');
            result.fullArgs = withoutPrefix.slice(result.command.length).trim();
            
            break;
        }
    }
    
    return result;
}

/**
 * Serialize quoted message dengan full context
 * @param {Object} message - Objek pesan utama
 * @param {string} type - Tipe pesan
 * @param {Object} sock - Socket connection
 * @returns {Promise<Object|null>} Quoted message object
 */
async function serializeQuotedMessage(message, type, sock) {
    if (!message || !type) return null;
    
    const messageContent = message[type];
    if (!messageContent) return null;
    
    const contextInfo = messageContent.contextInfo;
    if (!contextInfo || !contextInfo.quotedMessage) return null;
    
    const quotedMessage = contextInfo.quotedMessage;
    const quotedType = getMessageType(quotedMessage);
    
    const quoted = {
        id: contextInfo.stanzaId || '',
        sender: decodeJid(contextInfo.participant || ''),
        senderNumber: (decodeJid(contextInfo.participant || '') || '').replace(/@.+/g, ''),
        type: quotedType,
        body: getMessageBody(quotedMessage, quotedType),
        message: quotedMessage,
        mentionedJid: convertLidArray(contextInfo.mentionedJid || []),
        isMedia: ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(quotedType),
        isImage: quotedType === 'imageMessage',
        isVideo: quotedType === 'videoMessage',
        isAudio: quotedType === 'audioMessage',
        isSticker: quotedType === 'stickerMessage',
        isDocument: quotedType === 'documentMessage'
    };
    
    quoted.download = async (filename = null) => {
        if (!quoted.isMedia) return null;
        
        const stream = await downloadContentFromMessage(
            quotedMessage[quotedType],
            quotedType.replace('Message', '')
        );
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        if (filename) {
            const tempDir = join(process.cwd(), 'storage', 'temp');
            if (!existsSync(tempDir)) {
                mkdirSync(tempDir, { recursive: true });
            }
            const filepath = join(tempDir, filename);
            writeFileSync(filepath, buffer);
            return filepath;
        }
        
        return buffer;
    };
    
    return quoted;
}

/**
 * Membuat context info untuk fake reply
 * @param {string} jid - JID pengirim palsu
 * @param {string} text - Text pesan palsu
 * @param {string} [title] - Title/judul
 * @param {string} [body] - Body tambahan
 * @param {Buffer} [thumbnail] - Thumbnail gambar
 * @returns {Object} Context info object
 */
function createContextInfo(jid, text, title = '', body = '', thumbnail = null) {
    const contextInfo = {
        mentionedJid: [],
        forwardingScore: 999,
        isForwarded: true
    };
    
    if (jid && text) {
        contextInfo.quotedMessage = {
            conversation: text
        };
        contextInfo.participant = jid;
        contextInfo.stanzaId = 'OURINAI' + Date.now();
    }
    
    if (title || body || thumbnail) {
        contextInfo.externalAdReply = {
            showAdAttribution: true,
            title: title || config.bot?.name || 'Ourin-AI',
            body: body || '',
            mediaType: 1,
            renderLargerThumbnail: true,
            thumbnail: thumbnail,
            sourceUrl: ''
        };
    }
    
    return contextInfo;
}

/**
 * Serialize pesan WhatsApp menjadi objek lengkap dengan full fitur
 * @param {Object} sock - Socket connection Baileys
 * @param {Object} msg - Raw message dari Baileys event
 * @param {Object} [store] - Store untuk simpan data
 * @returns {Promise<SerializedMessage>} Objek pesan yang sudah di-serialize
 */
async function serialize(sock, msg, store = {}) {
    if (!msg) return null;
    if (!msg.message) return null;
    
    const m = {};
    
    m.key = msg.key;
    m.id = msg.key.id;
    m.chat = decodeJid(msg.key.remoteJid);
    m.fromMe = msg.key.fromMe;
    m.isGroup = m.chat.endsWith('@g.us');
    
    m.sender = decodeJid(
        m.isGroup 
            ? msg.key.participant 
            : m.fromMe 
                ? sock.user.id 
                : m.chat
    );
    m.senderNumber = m.sender ? m.sender.replace(/@.+/g, '') : '';
    
    m.pushName = msg.pushName || 'Unknown';
    
    m.isOwner = config.isOwner(m.sender);
    m.isPremium = config.isPremium(m.sender);
    m.isBanned = config.isBanned(m.sender);
    m.isBot = m.fromMe;
    
    let messageData = msg.message;
    if (messageData.ephemeralMessage) {
        messageData = messageData.ephemeralMessage.message;
    }
    if (messageData.viewOnceMessageV2) {
        messageData = messageData.viewOnceMessageV2.message;
        m.isViewOnce = true;
    }
    if (messageData.viewOnceMessage) {
        messageData = messageData.viewOnceMessage.message;
        m.isViewOnce = true;
    }
    if (messageData.documentWithCaptionMessage) {
        messageData = messageData.documentWithCaptionMessage.message;
    }
    
    m.type = getMessageType(messageData);
    m.message = messageData;
    m.body = getMessageBody(messageData, m.type);
    
    const parsed = parseCommand(m.body, config.command?.prefix || '.');
    m.isCommand = parsed.isCommand;
    m.command = parsed.command;
    m.prefix = parsed.prefix;
    m.args = parsed.args;
    m.text = parsed.text;
    m.fullArgs = parsed.fullArgs;
    
    m.isQuoted = false;
    m.quoted = await serializeQuotedMessage(messageData, m.type, sock);
    if (m.quoted) {
        m.isQuoted = true;
    }
    
    const messageContent = messageData[m.type];
    m.mentionedJid = convertLidArray(messageContent?.contextInfo?.mentionedJid || []);
    
    m.isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(m.type);
    m.isImage = m.type === 'imageMessage';
    m.isVideo = m.type === 'videoMessage';
    m.isAudio = m.type === 'audioMessage';
    m.isSticker = m.type === 'stickerMessage';
    m.isDocument = m.type === 'documentMessage';
    m.isContact = m.type === 'contactMessage' || m.type === 'contactsArrayMessage';
    m.isLocation = m.type === 'locationMessage' || m.type === 'liveLocationMessage';
    m.isPoll = m.type === 'pollCreationMessage';
    
    m.groupMetadata = null;
    m.isAdmin = false;
    m.isBotAdmin = false;
    m.groupName = '';
    m.groupDesc = '';
    m.groupMembers = [];
    m.groupAdmins = [];
    
    if (m.isGroup) {
        try {
            m.groupMetadata = store.groupMetadata?.[m.chat] || await sock.groupMetadata(m.chat);
            m.groupName = m.groupMetadata.subject || '';
            m.groupDesc = m.groupMetadata.desc || '';
            m.groupMembers = m.groupMetadata.participants || [];
            m.groupAdmins = m.groupMembers.filter(p => p.admin).map(p => p.id);
            m.isAdmin = m.groupAdmins.includes(m.sender);
            m.isBotAdmin = m.groupAdmins.includes(decodeJid(sock.user.id));
        } catch (error) {
            // Silent fail for group metadata
        }
    }
    
    m.remoteJid = m.chat;
    m.jid = m.chat;
    m.from = m.chat;
    m.to = m.chat;
    m.botNumber = decodeJid(sock.user?.id)?.replace(/@.+/g, '') || '';
    m.botJid = decodeJid(sock.user?.id) || '';
    m.botName = sock.user?.name || config.bot?.name || 'Ourin-AI';
    m.messageId = m.id;
    m.chatId = m.chat;
    m.senderId = m.sender;
    m.isPrivate = !m.isGroup;
    m.isPrivateChat = !m.isGroup;
    m.isGroupChat = m.isGroup;
    m.mediaType = m.type;
    m.hasMedia = m.isMedia;
    m.mimetype = messageData[m.type]?.mimetype || '';
    m.fileLength = messageData[m.type]?.fileLength || 0;
    m.fileName = messageData[m.type]?.fileName || '';
    m.seconds = messageData[m.type]?.seconds || 0;
    m.ptt = messageData[m.type]?.ptt || false;
    m.isAnimated = messageData[m.type]?.isAnimated || false;
    m.quotedMsg = m.quoted;
    m.quotedBody = m.quoted?.body || '';
    m.quotedSender = m.quoted?.sender || '';
    m.quotedType = m.quoted?.type || '';
    m.hasQuotedMedia = m.quoted?.isMedia || false;
    m.hasQuotedImage = m.quoted?.isImage || false;
    m.hasQuotedVideo = m.quoted?.isVideo || false;
    m.hasQuotedSticker = m.quoted?.isSticker || false;
    m.hasQuotedAudio = m.quoted?.isAudio || false;
    m.hasQuotedDocument = m.quoted?.isDocument || false;
    m.isReply = m.isQuoted;
    m.hasMentions = m.mentionedJid.length > 0;
    m.isForwarded = messageData[m.type]?.contextInfo?.isForwarded || false;
    m.forwardingScore = messageData[m.type]?.contextInfo?.forwardingScore || 0;
    m.expiration = messageData[m.type]?.contextInfo?.expiration || 0;
    m.ephemeralSettingTimestamp = msg.messageTimestamp || 0;
    /**
     * Reply text dengan opsi
     * @param {string} text - Text untuk reply
     * @param {Object} [options={}] - Opsi tambahan
     * @returns {Promise<Object>} Sent message
     */
    m.reply = async (text, options = {}) => {
        const defaultOptions = {
            contextInfo: {
                mentionedJid: options.mentions || [],
                ...options.contextInfo
            }
        };
        
        return sock.sendMessage(m.chat, {
            text,
            ...defaultOptions,
            ...options
        }, {
            quoted: options.quoted !== false ? msg : undefined
        });
    };
    
    /**
     * Reply text dengan mentions otomatis
     * @param {string} text - Text yang berisi @nomor
     * @returns {Promise<Object>} Sent message
     */
    m.replyWithMentions = async (text) => {
        const mentions = [...text.matchAll(/@(\d+)/g)].map(match => `${match[1]}@s.whatsapp.net`);
        return m.reply(text, { mentions });
    };
    
    /**
     * Reply gambar
     * @param {Buffer|string} image - Buffer atau URL gambar
     * @param {string} [caption=''] - Caption
     * @param {Object} [options={}] - Opsi tambahan
     * @returns {Promise<Object>} Sent message
     */
    m.replyImage = async (image, caption = '', options = {}) => {
        let buffer = image;
        if (typeof image === 'string' && image.startsWith('http')) {
            const axios = require('axios');
            const response = await axios.get(image, { responseType: 'arraybuffer' });
            buffer = Buffer.from(response.data);
        }
        
        return sock.sendMessage(m.chat, {
            image: buffer,
            caption,
            contextInfo: options.contextInfo,
            mentions: options.mentions || []
        }, {
            quoted: options.quoted !== false ? msg : undefined
        });
    };
    
    /**
     * Reply video
     * @param {Buffer|string} video - Buffer atau URL video
     * @param {string} [caption=''] - Caption
     * @param {Object} [options={}] - Opsi tambahan
     * @returns {Promise<Object>} Sent message
     */
    m.replyVideo = async (video, caption = '', options = {}) => {
        let buffer = video;
        if (typeof video === 'string' && video.startsWith('http')) {
            const axios = require('axios');
            const response = await axios.get(video, { responseType: 'arraybuffer' });
            buffer = Buffer.from(response.data);
        }
        
        return sock.sendMessage(m.chat, {
            video: buffer,
            caption,
            gifPlayback: options.gif || false,
            contextInfo: options.contextInfo,
            mentions: options.mentions || []
        }, {
            quoted: options.quoted !== false ? msg : undefined
        });
    };
    
    /**
     * Reply audio/voice note
     * @param {Buffer|string} audio - Buffer atau URL audio
     * @param {boolean} [ptt=false] - Voice note atau bukan
     * @param {Object} [options={}] - Opsi tambahan
     * @returns {Promise<Object>} Sent message
     */
    m.replyAudio = async (audio, ptt = false, options = {}) => {
        let buffer = audio;
        if (typeof audio === 'string' && audio.startsWith('http')) {
            const axios = require('axios');
            const response = await axios.get(audio, { responseType: 'arraybuffer' });
            buffer = Buffer.from(response.data);
        }
        
        return sock.sendMessage(m.chat, {
            audio: buffer,
            ptt,
            mimetype: 'audio/mpeg'
        }, {
            quoted: options.quoted !== false ? msg : undefined
        });
    };
    
    /**
     * Reply sticker
     * @param {Buffer|string} sticker - Buffer sticker
     * @param {Object} [options={}] - Opsi tambahan
     * @returns {Promise<Object>} Sent message
     */
    m.replySticker = async (sticker, options = {}) => {
        let buffer = sticker;
        if (typeof sticker === 'string' && sticker.startsWith('http')) {
            const axios = require('axios');
            const response = await axios.get(sticker, { responseType: 'arraybuffer' });
            buffer = Buffer.from(response.data);
        }
        
        return sock.sendMessage(m.chat, {
            sticker: buffer
        }, {
            quoted: options.quoted !== false ? msg : undefined
        });
    };
    
    /**
     * Reply dokumen
     * @param {Buffer|string} document - Buffer dokumen
     * @param {string} fileName - Nama file
     * @param {string} [mimetype] - MIME type
     * @param {Object} [options={}] - Opsi tambahan
     * @returns {Promise<Object>} Sent message
     */
    m.replyDocument = async (document, fileName, mimetype = 'application/octet-stream', options = {}) => {
        let buffer = document;
        if (typeof document === 'string' && document.startsWith('http')) {
            const axios = require('axios');
            const response = await axios.get(document, { responseType: 'arraybuffer' });
            buffer = Buffer.from(response.data);
        }
        
        return sock.sendMessage(m.chat, {
            document: buffer,
            fileName,
            mimetype,
            caption: options.caption || ''
        }, {
            quoted: options.quoted !== false ? msg : undefined
        });
    };
    
    /**
     * Reply kontak
     * @param {string} number - Nomor kontak
     * @param {string} name - Nama kontak
     * @param {Object} [options={}] - Opsi tambahan
     * @returns {Promise<Object>} Sent message
     */
    m.replyContact = async (number, name, options = {}) => {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}
END:VCARD`;
        
        return sock.sendMessage(m.chat, {
            contacts: {
                displayName: name,
                contacts: [{ vcard }]
            }
        }, {
            quoted: options.quoted !== false ? msg : undefined
        });
    };
    
    /**
     * Reply lokasi
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude
     * @param {Object} [options={}] - Opsi tambahan
     * @returns {Promise<Object>} Sent message
     */
    m.replyLocation = async (latitude, longitude, options = {}) => {
        return sock.sendMessage(m.chat, {
            location: {
                degreesLatitude: latitude,
                degreesLongitude: longitude,
                name: options.name || '',
                address: options.address || ''
            }
        }, {
            quoted: options.quoted !== false ? msg : undefined
        });
    };
    
    /**
     * Reply dengan fake quote
     * @param {string} text - Text untuk reply
     * @param {string} fakeJid - JID palsu
     * @param {string} fakeText - Text palsu di quote
     * @param {Object} [options={}] - Opsi tambahan
     * @returns {Promise<Object>} Sent message
     */
    m.replyWithQuote = async (text, fakeJid, fakeText, options = {}) => {
        const fakeMsg = {
            key: {
                fromMe: false,
                participant: fakeJid,
                remoteJid: m.chat
            },
            message: {
                conversation: fakeText
            },
            pushName: options.pushName || 'Bot'
        };
        
        return sock.sendMessage(m.chat, {
            text,
            contextInfo: {
                ...createContextInfo(fakeJid, fakeText, options.title, options.body, options.thumbnail),
                mentionedJid: options.mentions || []
            }
        }, {
            quoted: fakeMsg
        });
    };
    
    /**
     * Reply dengan thumbnail (external ad reply)
     * @param {string} text - Text untuk reply
     * @param {Object} preview - Preview options
     * @param {string} preview.title - Judul
     * @param {string} [preview.body] - Body
     * @param {Buffer} [preview.thumbnail] - Thumbnail
     * @param {string} [preview.sourceUrl] - URL sumber
     * @param {Object} [options={}] - Opsi tambahan
     * @returns {Promise<Object>} Sent message
     */
    m.replyWithPreview = async (text, preview, options = {}) => {
        return sock.sendMessage(m.chat, {
            text,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: preview.title || config.bot?.name || 'Ourin-AI',
                    body: preview.body || '',
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnail: preview.thumbnail,
                    sourceUrl: preview.sourceUrl || ''
                },
                mentionedJid: options.mentions || []
            }
        }, {
            quoted: options.quoted !== false ? msg : undefined
        });
    };
    
    /**
     * React ke pesan
     * @param {string} emoji - Emoji untuk react
     * @returns {Promise<Object>} Result
     */
    m.react = async (emoji) => {
        return sock.sendMessage(m.chat, {
            react: {
                text: emoji,
                key: msg.key
            }
        });
    };
    
    /**
     * Download media dari pesan ini
     * @param {string} [filename] - Nama file untuk disimpan
     * @returns {Promise<Buffer|string>} Buffer atau path file
     */
    m.download = async (filename = null) => {
        if (!m.isMedia) return null;
        
        const stream = await downloadContentFromMessage(
            messageData[m.type],
            m.type.replace('Message', '')
        );
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        if (filename) {
            const tempDir = join(process.cwd(), 'storage', 'temp');
            if (!existsSync(tempDir)) {
                mkdirSync(tempDir, { recursive: true });
            }
            const filepath = join(tempDir, filename);
            writeFileSync(filepath, buffer);
            return filepath;
        }
        
        return buffer;
    };
    
    /**
     * Delete pesan ini
     * @returns {Promise<Object>} Result
     */
    m.delete = async () => {
        return sock.sendMessage(m.chat, {
            delete: msg.key
        });
    };
    
    /**
     * Forward pesan ke JID lain
     * @param {string} jid - JID tujuan
     * @param {boolean} [forceForward=false] - Force forward label
     * @returns {Promise<Object>} Result
     */
    m.forward = async (jid, forceForward = false) => {
        return sock.sendMessage(jid, {
            forward: msg,
            force: forceForward
        });
    };
    
    /**
     * Copy pesan ke JID lain
     * @param {string} jid - JID tujuan
     * @param {Object} [options={}] - Opsi tambahan
     * @returns {Promise<Object>} Result
     */
    m.copy = async (jid, options = {}) => {
        const content = {};
        
        if (m.isImage) {
            content.image = await m.download();
            content.caption = m.body;
        } else if (m.isVideo) {
            content.video = await m.download();
            content.caption = m.body;
        } else if (m.isAudio) {
            content.audio = await m.download();
        } else if (m.isSticker) {
            content.sticker = await m.download();
        } else if (m.isDocument) {
            content.document = await m.download();
            content.fileName = messageData[m.type]?.fileName || 'file';
            content.mimetype = messageData[m.type]?.mimetype;
        } else {
            content.text = m.body;
        }
        
        return sock.sendMessage(jid, content, options);
    };
    
    m.timestamp = msg.messageTimestamp;
    m.raw = msg;
    
    return m;
}

/**
 * Get number from JID
 * @param {string} jid - JID
 * @returns {string} Number
 */
function getNumber(jid) {
    if (!jid) return '';
    return jid.replace(/@.+/g, '');
}

/**
 * Create JID from number
 * @param {string} number - Nomor telepon
 * @returns {string} JID
 */
function createJid(number) {
    if (!number) return '';
    const cleaned = number.replace(/[^0-9]/g, '');
    return cleaned + '@s.whatsapp.net';
}

module.exports = {
    serialize,
    decodeJid,
    getMessageType,
    getMessageBody,
    parseCommand,
    serializeQuotedMessage,
    createContextInfo,
    getNumber,
    createJid
};
