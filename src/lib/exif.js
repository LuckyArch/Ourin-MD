/**
 * @file src/lib/exif.js
 * @description Library untuk penanganan EXIF sticker menggunakan node-webpmux + fluent-ffmpeg
 * @author Ourin-AI Team
 * @version 1.1.0
 */

const fs = require('fs');
const path = require('path');
const Crypto = require('crypto');

// FFmpeg setup
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// node-webpmux for proper WebP EXIF handling
let webpmux;

/**
 * Initialize webpmux module
 */
async function initWebpmux() {
    if (!webpmux) {
        try {
            webpmux = require('node-webpmux');
        } catch (e) {
            console.error('[EXIF] Failed to load node-webpmux:', e.message);
        }
    }
    return webpmux;
}

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
 * Convert image buffer to WebP using FFmpeg with contain mode (no crop)
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise<Buffer>} WebP buffer
 */
function imageToWebpFFmpeg(buffer) {
    return new Promise((resolve, reject) => {
        const tmpDir = getTempDir();
        const inputPath = path.join(tmpDir, `img_${Date.now()}_${Crypto.randomBytes(4).toString('hex')}.png`);
        const outputPath = path.join(tmpDir, `sticker_${Date.now()}_${Crypto.randomBytes(4).toString('hex')}.webp`);
        
        fs.writeFileSync(inputPath, buffer);
        
        ffmpeg(inputPath)
            .outputOptions([
                '-vcodec', 'libwebp',
                '-vf', "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,setsar=1",
                '-loop', '0',
                '-preset', 'default',
                '-an',
                '-vsync', '0',
                '-quality', '80'
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
 * Convert video buffer to animated WebP using FFmpeg with contain mode
 * @param {Buffer} buffer - Video buffer
 * @param {Object} options - Options
 * @returns {Promise<Buffer>} Animated WebP buffer
 */
function videoToWebpFFmpeg(buffer, options = {}) {
    return new Promise((resolve, reject) => {
        const tmpDir = getTempDir();
        const inputPath = path.join(tmpDir, `vid_${Date.now()}_${Crypto.randomBytes(4).toString('hex')}.mp4`);
        const outputPath = path.join(tmpDir, `animated_${Date.now()}_${Crypto.randomBytes(4).toString('hex')}.webp`);
        
        fs.writeFileSync(inputPath, buffer);
        
        const duration = options.duration || 5;
        const fps = options.fps || 15;
        
        ffmpeg(inputPath)
            .inputOptions(['-y'])
            .outputOptions([
                '-vcodec', 'libwebp',
                '-vf', `fps=${fps},scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,setsar=1`,
                '-loop', '0',
                '-ss', '0',
                '-t', String(duration),
                '-preset', 'default',
                '-an',
                '-vsync', '0'
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
 * Add EXIF to WebP using node-webpmux
 * @param {Buffer} webpBuffer - Buffer WebP
 * @param {Object} options - Opsi metadata
 * @returns {Promise<Buffer>} WebP buffer dengan EXIF
 */
async function addExifToWebp(webpBuffer, options = {}) {
    await initWebpmux();
    
    if (!webpmux) {
        // Fallback to old method if webpmux not available
        return addExifToWebpFallback(webpBuffer, options);
    }
    
    try {
        const exif = createExif(options);
        const img = new webpmux.Image();
        
        await img.load(webpBuffer);
        img.exif = exif;
        
        return await img.save(null);
    } catch (error) {
        console.error('[EXIF] webpmux error:', error.message);
        return addExifToWebpFallback(webpBuffer, options);
    }
}

/**
 * Create sticker from image buffer with EXIF
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Metadata options
 * @returns {Promise<Buffer>} Sticker WebP buffer with EXIF
 */
async function createStickerFromImage(imageBuffer, options = {}) {
    // Convert image to WebP with contain mode
    const webpBuffer = await imageToWebpFFmpeg(imageBuffer);
    
    // Add EXIF metadata
    return await addExifToWebp(webpBuffer, options);
}

/**
 * Create animated sticker from video buffer with EXIF
 * @param {Buffer} videoBuffer - Video buffer
 * @param {Object} options - Metadata and conversion options
 * @returns {Promise<Buffer>} Animated sticker WebP buffer with EXIF
 */
async function createStickerFromVideo(videoBuffer, options = {}) {
    // Convert video to animated WebP with contain mode
    const webpBuffer = await videoToWebpFFmpeg(videoBuffer, {
        duration: options.duration || 5,
        fps: options.fps || 15
    });
    
    // Add EXIF metadata
    return await addExifToWebp(webpBuffer, {
        packname: options.packname,
        author: options.author,
        emojis: options.emojis
    });
}

/**
 * Fallback method untuk add EXIF (manual buffer manipulation)
 * @param {Buffer} webpBuffer - Buffer WebP
 * @param {Object} options - Opsi metadata
 * @returns {Buffer} WebP buffer dengan EXIF
 */
function addExifToWebpFallback(webpBuffer, options = {}) {
    const exif = createExif(options);
    
    // Check if already has EXIF
    const hasExif = webpBuffer.indexOf(Buffer.from('EXIF')) !== -1;
    
    if (hasExif) {
        return replaceExifInWebp(webpBuffer, exif);
    }
    
    // WebP structure: RIFF + size + WEBP + chunks
    const riffHeader = webpBuffer.slice(0, 4);
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
    const exifIndex = webpBuffer.indexOf(Buffer.from('EXIF'));
    
    if (exifIndex === -1) {
        return addExifToWebpFallback(webpBuffer, {});
    }
    
    const oldExifSize = webpBuffer.readUInt32LE(exifIndex + 4);
    const padding = oldExifSize % 2 === 1 ? 1 : 0;
    
    const beforeExif = webpBuffer.slice(0, exifIndex);
    const afterExif = webpBuffer.slice(exifIndex + 8 + oldExifSize + padding);
    
    const exifChunkId = Buffer.from('EXIF');
    const exifSize = Buffer.alloc(4);
    exifSize.writeUInt32LE(newExif.length);
    
    const newPadding = newExif.length % 2 === 1 ? Buffer.from([0x00]) : Buffer.alloc(0);
    
    const newWebp = Buffer.concat([beforeExif, exifChunkId, exifSize, newExif, newPadding, afterExif]);
    
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
        // VP8 chunk
        const vp8Index = buffer.indexOf(Buffer.from('VP8 '));
        if (vp8Index !== -1) {
            const width = buffer.readUInt16LE(vp8Index + 14) & 0x3FFF;
            const height = buffer.readUInt16LE(vp8Index + 16) & 0x3FFF;
            return { width, height };
        }
        
        // VP8L chunk (lossless)
        const vp8lIndex = buffer.indexOf(Buffer.from('VP8L'));
        if (vp8lIndex !== -1) {
            const bits = buffer.readUInt32LE(vp8lIndex + 9);
            const width = (bits & 0x3FFF) + 1;
            const height = ((bits >> 14) & 0x3FFF) + 1;
            return { width, height };
        }
        
        // VP8X chunk (extended)
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
 * Clean temporary files
 * @param {number} [maxAge=3600000] - Max age in ms (default 1 hour)
 */
function cleanTempFiles(maxAge = 3600000) {
    const tmpDir = path.join(process.cwd(), 'tmp');
    
    if (!fs.existsSync(tmpDir)) {
        return;
    }
    
    const now = Date.now();
    const files = fs.readdirSync(tmpDir);
    
    for (const file of files) {
        if (file.startsWith('exif_') || file.startsWith('input_') || 
            file.startsWith('output_') || file.startsWith('img_') || 
            file.startsWith('vid_') || file.startsWith('sticker_') ||
            file.startsWith('animated_')) {
            const filePath = path.join(tmpDir, file);
            try {
                const stat = fs.statSync(filePath);
                if (now - stat.mtimeMs > maxAge) {
                    fs.unlinkSync(filePath);
                }
            } catch {
                // Ignore errors
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
    addExifToWebp,
    addExifToWebpFallback,
    replaceExifInWebp,
    readExifFromWebp,
    initWebpmux,
    
    // FFmpeg conversion functions
    imageToWebpFFmpeg,
    videoToWebpFFmpeg,
    
    // Full sticker creation (conversion + EXIF)
    createStickerFromImage,
    createStickerFromVideo,
    
    // Validation
    isValidWebp,
    isAnimatedWebp,
    getWebpDimensions,
    
    // Utilities
    generateStickerId,
    cleanTempFiles,
    getTempDir,
    
    // FFmpeg instance
    ffmpeg,
    
    // Presets & defaults
    DEFAULT_METADATA,
    PRESETS
};
