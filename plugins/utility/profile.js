/**
 * @file plugins/utility/profile.js
 * @description Plugin untuk melihat profil user
 * @author Ourin-AI Team
 * @version 1.0.0
 */

const { formatNumber, formatDate } = require('../../src/lib/formatter');

/**
 * Konfigurasi plugin profile
 * @type {import('../../src/lib/plugins').PluginConfig}
 */
const pluginConfig = {
    name: 'profile',
    alias: ['me', 'profil', 'myprofile'],
    category: 'utility',
    description: 'Melihat profil user',
    usage: '.profile [@user]',
    example: '.profile',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    limit: 0,
    isEnabled: true
};

/**
 * Handler untuk command profile
 * @param {Object} m - Serialized message
 * @param {Object} context - Handler context
 * @returns {Promise<void>}
 */
async function handler(m, { sock, db }) {
    let targetJid = m.sender;
    let targetName = m.pushName;
    
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0];
        targetName = targetJid.split('@')[0];
    }
    
    const user = db.getUser(targetJid);
    
    const statusEmoji = m.isOwner ? '👑' : m.isPremium ? '💎' : '🆓';
    const statusText = m.isOwner ? 'Owner' : m.isPremium ? 'Premium' : 'Free';
    
    let profileText = `【 USER PROFILE 】\n\n`;
    profileText += `📝 *Nama*   : ${targetName}\n`;
    profileText += `📱 *Nomor*  : ${formatNumber(targetJid.replace('@s.whatsapp.net', ''))}\n`;
    profileText += `${statusEmoji} *Status* : ${statusText}\n`;
    profileText += `📊 *Limit*  : ${user?.limit || 25}\n`;
    
    if (user?.registeredAt) {
        profileText += `📅 *Daftar* : ${formatDate(user.registeredAt)}\n`;
    }
    
    if (user?.lastSeen) {
        profileText += `⏰ *Online* : ${formatDate(user.lastSeen)}\n`;
    }
    
    if (user?.exp !== undefined) {
        profileText += `✨ *EXP*    : ${user.exp}\n`;
        profileText += `📈 *Level*  : ${user.level || 1}\n`;
    }
    
    await m.reply(profileText);
}

module.exports = {
    config: pluginConfig,
    handler
};
