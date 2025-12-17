/**
 * @file plugins/main/owner.js
 * @description Plugin untuk menampilkan informasi kontak owner
 * @author Ourin-AI Team
 * @version 1.0.0
 */

const config = require('../../config');

/**
 * Konfigurasi plugin owner
 * @type {import('../../src/lib/plugins').PluginConfig}
 */
const pluginConfig = {
    name: 'owner',
    alias: ['creator', 'dev', 'developer'],
    category: 'main',
    description: 'Menampilkan kontak owner bot',
    usage: '.owner',
    example: '.owner',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    limit: 0,
    isEnabled: true
};

/**
 * Handler untuk command owner
 * @param {Object} m - Serialized message
 * @param {Object} context - Handler context
 * @returns {Promise<void>}
 */
async function handler(m, { sock, config: botConfig }) {
    const ownerNumbers = botConfig.owner?.number || ['6281234567890'];
    const ownerName = botConfig.owner?.name || 'Owner';
    
    let ownerText = `👑 *Kontak Owner Bot*\n\n`;
    ownerText += `Nama: ${ownerName}\n`;
    ownerText += `Bot: ${botConfig.bot?.name || 'Ourin-AI'}\n\n`;
    ownerText += `Jika ada pertanyaan atau masalah, silakan hubungi owner!\n\n`;
    
    await m.reply(ownerText);
    
    for (const number of ownerNumbers) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${ownerName} (Owner ${botConfig.bot?.name || 'Bot'})
TEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}
END:VCARD`;
        
        await sock.sendMessage(m.chat, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: m.raw });
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
