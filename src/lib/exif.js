/**
 * @file src/lib/exif.js
 * @description Library untuk penanganan EXIF sticker dan media
 * @author Ourin-AI Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const Crypto = require('crypto');

/**
 * Default sticker metadata
 */
const DEFAULT_METADATA = {
    packname: 'Ourin-AI',
    author: 'Bot',
    packId: 'com.ourin.sticker',
    emojis: ['🤖']
};

/**
 * Create EXIF buffer untuk sticker
 * @param {Object} options - Opsi metadata
 * @param {string} [options.packname] - Nama pack sticker
 * @param {string} [options.author] - Nama author
 * @param {string} [options.packId] - Package ID
 * @param {string[]} [options.emojis] - Array emoji
 * @returns {Buffer} EXIF buffer
 */
function createExif(options = {}) {
    const packname = options.packname || DEFAULT_METADATA.packname;
    const author = options.author || DEFAULT_METADATA.author;
    const packId = options.packId || DEFAULT_METADATA.packId;
    const emojis = options.emojis || DEFAULT_METADATA.emojis;
    
    const json = {
        'sticker-pack-id': packId,
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'emojis': emojis,
        'is-avatar-sticker': 0,
        'android-app-store-link': '',
        'ios-app-store-link': ''
    };
    
    let exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00,
        0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00,
        0x00, 0x00
    ]);
    
    let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    let exif = Buffer.concat([exifAttr, jsonBuffer]);
    
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    
    return exif;
}

/**
 * Create EXIF file untuk sticker
 * @param {Object} options - Opsi metadata
 * @param {string} [options.packname] - Nama pack sticker
 * @param {string} [options.author] - Nama author
 * @param {string} [options.packId] - Package ID
 * @param {string[]} [options.emojis] - Array emoji
 * @returns {string} Path ke file EXIF
 */
function createExifFile(options = {}) {
    const exifBuffer = createExif(options);
    const tmpDir = path.join(process.cwd(), 'tmp');
    
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    const exifPath = path.join(tmpDir, `exif_${Date.now()}.exif`);
    fs.writeFileSync(exifPath, exifBuffer);
    
    return exifPath;
}

/**
 * Add EXIF to WebP buffer
 * @param {Buffer} webpBuffer - Buffer WebP
 * @param {Object} options - Opsi metadata
 * @returns {Buffer} WebP buffer dengan EXIF
 */
function addExifToWebp(webpBuffer, options = {}) {
    const exif = createExif(options);
    
    // Check if already has EXIF
    const hasExif = webpBuffer.indexOf(Buffer.from('EXIF')) !== -1;
    
    if (hasExif) {
        // Remove existing EXIF and add new one
        return replaceExifInWebp(webpBuffer, exif);
    }
    
    // WebP structure: RIFF + size + WEBP + chunks
    const riffHeader = webpBuffer.slice(0, 4);
    const fileSize = webpBuffer.readUInt32LE(4);
    const webpSignature = webpBuffer.slice(8, 12);
    const webpData = webpBuffer.slice(12);
    
    // Create EXIF chunk
    const exifChunkId = Buffer.from('EXIF');
    const exifSize = Buffer.alloc(4);
    exifSize.writeUInt32LE(exif.length);
    
    const exifChunk = Buffer.concat([exifChunkId, exifSize, exif]);
    
    // Pad to even length if needed
    const padding = exif.length % 2 === 1 ? Buffer.from([0x00]) : Buffer.alloc(0);
    
    // Combine all parts
    const newWebpData = Buffer.concat([webpData, exifChunk, padding]);
    const newFileSize = Buffer.alloc(4);
    newFileSize.writeUInt32LE(4 + newWebpData.length);
    
    return Buffer.concat([riffHeader, newFileSize, webpSignature, newWebpData]);
}

/**
 * Replace EXIF in WebP buffer
 * @param {Buffer} webpBuffer - Buffer WebP
 * @param {Buffer} newExif - New EXIF buffer
 * @returns {Buffer} WebP buffer dengan EXIF baru
 */
function replaceExifInWebp(webpBuffer, newExif) {
    // Find EXIF chunk
    const exifIndex = webpBuffer.indexOf(Buffer.from('EXIF'));
    
    if (exifIndex === -1) {
        return addExifToWebp(webpBuffer, {});
    }
    
    // Read old EXIF size
    const oldExifSize = webpBuffer.readUInt32LE(exifIndex + 4);
    const padding = oldExifSize % 2 === 1 ? 1 : 0;
    
    // Parts before and after EXIF
    const beforeExif = webpBuffer.slice(0, exifIndex);
    const afterExif = webpBuffer.slice(exifIndex + 8 + oldExifSize + padding);
    
    // Create new EXIF chunk
    const exifChunkId = Buffer.from('EXIF');
    const exifSize = Buffer.alloc(4);
    exifSize.writeUInt32LE(newExif.length);
    
    const newPadding = newExif.length % 2 === 1 ? Buffer.from([0x00]) : Buffer.alloc(0);
    
    // Combine
    const newWebp = Buffer.concat([beforeExif, exifChunkId, exifSize, newExif, newPadding, afterExif]);
    
    // Update file size in RIFF header
    const newFileSize = newWebp.length - 8;
    newWebp.writeUInt32LE(newFileSize, 4);
    
    return newWebp;
}

/**
 * Read EXIF from WebP buffer
 * @param {Buffer} webpBuffer - Buffer WebP
 * @returns {Object|null} EXIF metadata atau null
 */
function readExifFromWebp(webpBuffer) {
    const exifIndex = webpBuffer.indexOf(Buffer.from('EXIF'));
    
    if (exifIndex === -1) {
        return null;
    }
    
    const exifSize = webpBuffer.readUInt32LE(exifIndex + 4);
    const exifData = webpBuffer.slice(exifIndex + 8, exifIndex + 8 + exifSize);
    
    // Skip TIFF header (22 bytes) and parse JSON
    try {
        const jsonStart = 22;
        const jsonData = exifData.slice(jsonStart);
        return JSON.parse(jsonData.toString('utf8'));
    } catch {
        return null;
    }
}

/**
 * Validate WebP buffer
 * @param {Buffer} buffer - Buffer to validate
 * @returns {boolean} True if valid WebP
 */
function isValidWebp(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
        return false;
    }
    
    const riff = buffer.slice(0, 4).toString('ascii');
    const webp = buffer.slice(8, 12).toString('ascii');
    
    return riff === 'RIFF' && webp === 'WEBP';
}

/**
 * Check if WebP is animated
 * @param {Buffer} buffer - WebP buffer
 * @returns {boolean} True if animated
 */
function isAnimatedWebp(buffer) {
    if (!isValidWebp(buffer)) {
        return false;
    }
    
    // Check for ANIM or ANMF chunk
    return buffer.indexOf(Buffer.from('ANIM')) !== -1 || 
           buffer.indexOf(Buffer.from('ANMF')) !== -1;
}

/**
 * Get WebP dimensions
 * @param {Buffer} buffer - WebP buffer
 * @returns {{width: number, height: number}|null} Dimensions atau null
 */
function getWebpDimensions(buffer) {
    if (!isValidWebp(buffer)) {
        return null;
    }
    
    try {
        // Look for VP8 chunk
        const vp8Index = buffer.indexOf(Buffer.from('VP8 '));
        if (vp8Index !== -1) {
            const width = buffer.readUInt16LE(vp8Index + 14) & 0x3FFF;
            const height = buffer.readUInt16LE(vp8Index + 16) & 0x3FFF;
            return { width, height };
        }
        
        // Look for VP8L chunk (lossless)
        const vp8lIndex = buffer.indexOf(Buffer.from('VP8L'));
        if (vp8lIndex !== -1) {
            const bits = buffer.readUInt32LE(vp8lIndex + 9);
            const width = (bits & 0x3FFF) + 1;
            const height = ((bits >> 14) & 0x3FFF) + 1;
            return { width, height };
        }
        
        // Look for VP8X chunk (extended)
        const vp8xIndex = buffer.indexOf(Buffer.from('VP8X'));
        if (vp8xIndex !== -1) {
            const width = (buffer.readUIntLE(vp8xIndex + 12, 3) + 1);
            const height = (buffer.readUIntLE(vp8xIndex + 15, 3) + 1);
            return { width, height };
        }
        
        return null;
    } catch {
        return null;
    }
}

/**
 * Generate random sticker ID
 * @returns {string} Random sticker ID
 */
function generateStickerId() {
    return `sticker_${Date.now()}_${Crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Clean temporary EXIF files
 * @param {number} [maxAge=3600000] - Max age in ms (default 1 hour)
 */
function cleanTempExifFiles(maxAge = 3600000) {
    const tmpDir = path.join(process.cwd(), 'tmp');
    
    if (!fs.existsSync(tmpDir)) {
        return;
    }
    
    const now = Date.now();
    const files = fs.readdirSync(tmpDir);
    
    for (const file of files) {
        if (file.startsWith('exif_')) {
            const filePath = path.join(tmpDir, file);
            const stat = fs.statSync(filePath);
            
            if (now - stat.mtimeMs > maxAge) {
                try {
                    fs.unlinkSync(filePath);
                } catch {
                    // Ignore errors
                }
            }
        }
    }
}

/**
 * Sticker metadata presets
 */
const PRESETS = {
    default: {
        packname: 'Ourin-AI',
        author: 'Bot',
        emojis: ['🤖']
    },
    meme: {
        packname: 'Meme Pack',
        author: 'Ourin-AI',
        emojis: ['😂', '🤣']
    },
    love: {
        packname: 'Love Pack',
        author: 'Ourin-AI',
        emojis: ['❤️', '💕', '💖']
    },
    sad: {
        packname: 'Sad Pack',
        author: 'Ourin-AI',
        emojis: ['😢', '😭', '💔']
    },
    angry: {
        packname: 'Angry Pack',
        author: 'Ourin-AI',
        emojis: ['😠', '😡', '💢']
    }
};

module.exports = {
    // Core functions
    createExif,
    createExifFile,
    addExifToWebp,
    replaceExifInWebp,
    readExifFromWebp,
    
    // Validation
    isValidWebp,
    isAnimatedWebp,
    getWebpDimensions,
    
    // Utilities
    generateStickerId,
    cleanTempExifFiles,
    
    // Presets & defaults
    DEFAULT_METADATA,
    PRESETS
};
