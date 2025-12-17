/**
 * @file src/lib/sockHelper.js
 * @description Helper methods untuk socket: sticker, file, contact, download
 * @author Ourin-AI Team
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');
const { downloadMediaMessage, getContentType } = require('@rexxhayanasi/elaina-baileys');
const { addExifToWebp, DEFAULT_METADATA } = require('./exif');

// FFmpeg setup
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Get temp directory
 */
function getTempDir() {
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
}

/**
 * Download buffer from URL
 */
async function downloadBuffer(url) {
    const axios = require('axios');
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    return Buffer.from(response.data);
}

/**
 * Convert image buffer to WebP sticker using sharp
 */
async function imageToWebp(buffer) {
    try {
        const sharp = require('sharp');
        return await sharp(buffer)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp({ quality: 80 })
            .toBuffer();
    } catch (error) {
        throw new Error('Failed to convert image to webp: ' + error.message);
    }
}

/**
 * Convert video to WebP sticker using fluent-ffmpeg
 */
function videoToWebp(buffer) {
    return new Promise((resolve, reject) => {
        const tmpDir = getTempDir();
        const inputPath = path.join(tmpDir, `input_${Date.now()}.mp4`);
        const outputPath = path.join(tmpDir, `output_${Date.now()}.webp`);
        
        fs.writeFileSync(inputPath, buffer);
        
        ffmpeg(inputPath)
            .inputOptions(['-y'])
            .outputOptions([
                '-vcodec', 'libwebp',
                '-vf', "fps=15,scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=0x00000000,setsar=1",
                '-loop', '0',
                '-ss', '0',
                '-t', '5',
                '-preset', 'default',
                '-an',
                '-vsync', '0',
                '-s', '512:512'
            ])
            .toFormat('webp')
            .on('end', () => {
                try {
                    const webpBuffer = fs.readFileSync(outputPath);
                    // Cleanup
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                    resolve(webpBuffer);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err) => {
                // Cleanup on error
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                reject(err);
            })
            .save(outputPath);
    });
}

/**
 * Simple image to webp without sharp (using raw webp)
 */
async function simpleImageToWebp(buffer) {
    const tmpDir = getTempDir();
    const inputPath = path.join(tmpDir, `img_${Date.now()}.png`);
    const outputPath = path.join(tmpDir, `sticker_${Date.now()}.webp`);
    
    fs.writeFileSync(inputPath, buffer);
    
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                '-vcodec', 'libwebp',
                '-vf', "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
                '-loop', '0',
                '-preset', 'default',
                '-an',
                '-vsync', '0'
            ])
            .toFormat('webp')
            .on('end', () => {
                try {
                    const webpBuffer = fs.readFileSync(outputPath);
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                    resolve(webpBuffer);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err) => {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                reject(err);
            })
            .save(outputPath);
    });
}

/**
 * Extend socket with helper methods
 */
function extendSocket(sock) {
    /**
     * Send image as sticker
     */
    sock.sendImageAsSticker = async (jid, input, options = {}) => {
        let buffer;
        
        if (Buffer.isBuffer(input)) {
            buffer = input;
        } else if (typeof input === 'string') {
            if (input.startsWith('http')) {
                buffer = await downloadBuffer(input);
            } else if (fs.existsSync(input)) {
                buffer = fs.readFileSync(input);
            } else {
                throw new Error('Invalid input');
            }
        } else {
            throw new Error('Invalid input type');
        }
        
        let webpBuffer;
        try {
            const sharp = require('sharp');
            webpBuffer = await sharp(buffer)
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp({ quality: 80 })
                .toBuffer();
        } catch (err) {
            throw new Error('Failed to convert image: ' + err.message);
        }
        
        // Add EXIF metadata for packname and author
        try {
            webpBuffer = addExifToWebp(webpBuffer, {
                packname: options.packname || DEFAULT_METADATA.packname,
                author: options.author || DEFAULT_METADATA.author,
                emojis: options.emojis || DEFAULT_METADATA.emojis
            });
        } catch (e) {
            // If EXIF fails, still send without it
            console.log('[Sticker] EXIF error:', e.message);
        }
        
        return sock.sendMessage(jid, {
            sticker: webpBuffer
        }, {
            quoted: options.quoted
        });
    };
    
    /**
     * Send video as sticker (animated)
     */
    sock.sendVideoAsSticker = async (jid, input, options = {}) => {
        let buffer;
        
        if (Buffer.isBuffer(input)) {
            buffer = input;
        } else if (typeof input === 'string') {
            if (input.startsWith('http')) {
                buffer = await downloadBuffer(input);
            } else if (fs.existsSync(input)) {
                buffer = fs.readFileSync(input);
            } else {
                throw new Error('Invalid input');
            }
        } else {
            throw new Error('Invalid input type');
        }
        
        // Convert to animated WebP
        let webpBuffer = await videoToWebp(buffer);
        
        // Add EXIF metadata
        webpBuffer = addExifToWebp(webpBuffer, {
            packname: options.packname || DEFAULT_METADATA.packname,
            author: options.author || DEFAULT_METADATA.author,
            emojis: options.emojis || DEFAULT_METADATA.emojis
        });
        
        return sock.sendMessage(jid, {
            sticker: webpBuffer
        }, {
            quoted: options.quoted
        });
    };
    
    /**
     * Send file (auto-detect type)
     */
    sock.sendFile = async (jid, input, options = {}) => {
        let buffer;
        let filename = options.filename || 'file';
        let mimetype = options.mimetype;
        
        if (Buffer.isBuffer(input)) {
            buffer = input;
        } else if (typeof input === 'string') {
            if (input.startsWith('http')) {
                buffer = await downloadBuffer(input);
                filename = options.filename || path.basename(new URL(input).pathname) || 'file';
            } else if (fs.existsSync(input)) {
                buffer = fs.readFileSync(input);
                filename = options.filename || path.basename(input);
            } else {
                throw new Error('Invalid input');
            }
        } else {
            throw new Error('Invalid input type');
        }
        
        // Auto detect mimetype
        if (!mimetype) {
            const ext = path.extname(filename).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.mp4': 'video/mp4',
                '.mp3': 'audio/mpeg',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
                '.zip': 'application/zip'
            };
            mimetype = mimeTypes[ext] || 'application/octet-stream';
        }
        
        let messageContent = {};
        
        if (mimetype.startsWith('image/')) {
            messageContent.image = buffer;
            if (options.caption) messageContent.caption = options.caption;
        } else if (mimetype.startsWith('video/')) {
            messageContent.video = buffer;
            messageContent.mimetype = mimetype;
            if (options.caption) messageContent.caption = options.caption;
        } else if (mimetype.startsWith('audio/')) {
            messageContent.audio = buffer;
            messageContent.mimetype = mimetype;
            messageContent.ptt = options.ptt || false;
        } else {
            messageContent.document = buffer;
            messageContent.mimetype = mimetype;
            messageContent.fileName = filename;
            if (options.caption) messageContent.caption = options.caption;
        }
        
        return sock.sendMessage(jid, messageContent, {
            quoted: options.quoted
        });
    };
    
    /**
     * Send contact card
     */
    sock.sendContact = async (jid, contacts, options = {}) => {
        const contactArray = Array.isArray(contacts) ? contacts : [contacts];
        
        const vcards = contactArray.map(contact => {
            const name = contact.name || 'Unknown';
            const number = contact.number?.replace(/[^0-9]/g, '') || '';
            const org = contact.org || '';
            
            let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
            vcard += `FN:${name}\n`;
            if (org) vcard += `ORG:${org}\n`;
            vcard += `TEL;type=CELL;type=VOICE;waid=${number}:+${number}\n`;
            vcard += `END:VCARD`;
            
            return { vcard };
        });
        
        const displayName = contactArray.length === 1 
            ? contactArray[0].name || 'Contact'
            : `${contactArray.length} Contacts`;
        
        return sock.sendMessage(jid, {
            contacts: {
                displayName,
                contacts: vcards
            }
        }, {
            quoted: options.quoted
        });
    };
    
    /**
     * Download media message and save to file
     */
    sock.downloadAndSaveMediaMessage = async (msg, savePath = null) => {
        const message = msg.message || msg;
        const type = getContentType(message);
        
        if (!type) {
            throw new Error('No media found in message');
        }
        
        const buffer = await downloadMediaMessage(
            { message },
            'buffer',
            {},
            {
                logger: console,
                reuploadRequest: sock.updateMediaMessage
            }
        );
        
        let savedPath = null;
        
        if (savePath) {
            const dir = path.dirname(savePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(savePath, buffer);
            savedPath = savePath;
        }
        
        return {
            buffer,
            path: savedPath,
            type
        };
    };
    
    return sock;
}

module.exports = {
    extendSocket,
    downloadBuffer,
    imageToWebp,
    videoToWebp,
    simpleImageToWebp,
    getTempDir
};
