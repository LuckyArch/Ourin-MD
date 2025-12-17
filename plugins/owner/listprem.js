/**
 * @file plugins/owner/listprem.js
 * @description Plugin untuk melihat daftar premium user
 * @author Ourin-AI Team
 * @version 1.0.0
 */

const config = require('../../config');

/**
 * Konfigurasi plugin listprem
 * @type {import('../../src/lib/plugins').PluginConfig}
 */
const pluginConfig = {
    name: 'listprem',
    alias: ['listpremium', 'premlist'],
    category: 'owner',
    description: 'Melihat daftar premium user',
    usage: '.listprem',
    example: '.listprem',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    limit: 0,
    isEnabled: true
};

/**
 * Handler untuk command listprem
 * @param {Object} m - Serialized message
 * @param {Object} context - Handler context
 * @returns {Promise<void>}
 */
async function handler(m, { config: botConfig }) {
    const premiumUsers = botConfig.premiumUsers || [];
    
    if (premiumUsers.length === 0) {
        await m.reply('💎 Tidak ada premium user yang terdaftar');
        return;
    }
    
    let listText = `╭─「 💎 PREMIUM 」─\n`;
    listText += `│\n`;
    
    for (let i = 0; i < premiumUsers.length; i++) {
        const number = premiumUsers[i];
        listText += `│ ${i + 1}. ${number}\n`;
    }
    
    listText += `│\n`;
    listText += `╰────────────────\n\n`;
    listText += `📊 Total: ${premiumUsers.length} premium user`;
    
    await m.reply(listText);
}

module.exports = {
    config: pluginConfig,
    handler
};
