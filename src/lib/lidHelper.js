/**
 * @file src/lib/lidHelper.js
 * @description Helper untuk konversi LID (Linked ID) ke format nomor telepon
 * @author Ourin-AI Team
 * @version 1.1.0
 */

const { jidDecode } = require('@rexxhayanasi/elaina-baileys');

/**
 * Cek apakah JID adalah format LID
 * @param {string} jid - JID untuk dicek
 * @returns {boolean} True jika LID
 */
function isLid(jid) {
    if (!jid) return false;
    return jid.endsWith('@lid');
}

/**
 * Convert LID ke format JID standard
 * @param {string} jid - JID yang mungkin LID
 * @returns {string} JID dalam format @s.whatsapp.net
 */
function lidToJid(jid) {
    if (!jid) return jid;
    if (jid.endsWith('@lid')) {
        return jid.replace('@lid', '@s.whatsapp.net');
    }
    return jid;
}

/**
 * Extract nomor dari JID apapun (termasuk LID)
 * @param {string} jid - JID
 * @returns {string} Nomor telepon
 */
function extractNumber(jid) {
    if (!jid) return '';
    return jid.replace(/@.+/g, '');
}

/**
 * Resolve LID menggunakan group metadata jika tersedia
 * @param {string} jid - JID yang mungkin LID
 * @param {Object} participants - Array participant dari group metadata
 * @returns {string} JID yang sudah resolve
 */
function resolveLidFromParticipants(jid, participants = []) {
    if (!jid || !isLid(jid)) return jid;
    
    // Cari di participants yang punya mapping
    const participant = participants.find(p => 
        p.id === jid || p.lid === jid
    );
    
    if (participant && participant.jid) {
        return participant.jid;
    }
    
    // Fallback: convert langsung
    return lidToJid(jid);
}

/**
 * Convert array of JIDs, replacing any LIDs
 * @param {string[]} jids - Array of JIDs
 * @param {Object[]} participants - Optional group participants
 * @returns {string[]} Array of converted JIDs
 */
function convertLidArray(jids, participants = []) {
    if (!Array.isArray(jids)) return [];
    
    return jids.map(jid => {
        if (isLid(jid)) {
            return resolveLidFromParticipants(jid, participants);
        }
        return jid;
    });
}

/**
 * Decode JID dan kembalikan dalam format standard
 * @param {string} jid - JID untuk didecode
 * @returns {string|null} JID yang sudah didecode atau null
 */
function decodeAndNormalize(jid) {
    if (!jid) return null;
    
    // Handle LID format first
    if (isLid(jid)) {
        jid = lidToJid(jid);
    }
    
    // Handle device suffix
    if (/:\d+@/gi.test(jid)) {
        const decoded = jidDecode(jid) || {};
        if (decoded.user && decoded.server) {
            return decoded.user + '@' + decoded.server;
        }
    }
    
    return jid;
}

/**
 * Konversi participant JID dari message
 * @param {Object} msg - Message object
 * @param {Object} sock - Socket connection
 * @returns {Promise<string>} Resolved participant JID
 */
async function resolveParticipant(msg, sock) {
    const participant = msg.key?.participant;
    
    if (!participant) return null;
    if (!isLid(participant)) return participant;
    
    // Try to get from node attributes if available
    if (msg.participantPn) {
        return msg.participantPn;
    }
    
    // Try group metadata
    if (msg.key?.remoteJid?.endsWith('@g.us') && sock) {
        try {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            const found = metadata.participants.find(p => p.id === participant);
            if (found && found.jid) {
                return found.jid;
            }
        } catch {
            // Silent fail
        }
    }
    
    // Fallback
    return lidToJid(participant);
}

module.exports = {
    isLid,
    lidToJid,
    extractNumber,
    resolveLidFromParticipants,
    convertLidArray,
    decodeAndNormalize,
    resolveParticipant
};
