/**
 * @file plugins/owner/setmode.js
 * @description Plugin untuk mengubah mode bot
 * @author Ourin-AI Team
 * @version 1.0.0
 */

const config = require('../../config');

/**
 * Konfigurasi plugin setmode
 * @type {import('../../src/lib/plugins').PluginConfig}
 */
const pluginConfig = {
    name: 'setmode',
    alias: ['mode', 'public', 'self'],
    category: 'owner',
    description: 'Mengubah mode bot (public/self/group)',
    usage: '.setmode <mode>',
    example: '.setmode public',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    limit: 0,
    isEnabled: true
};

/**
 * Mode yang tersedia
 * @constant
 */
const AVAILABLE_MODES = ['public', 'self', 'group', 'private'];

/**
 * Handler untuk command setmode
 * @param {Object} m - Serialized message
 * @param {Object} context - Handler context
 * @returns {Promise<void>}
 */
async function handler(m, { config: botConfig }) {
    const newMode = m.args[0]?.toLowerCase();
    
    if (!newMode) {
        let modeText = `🔄 *Mode Bot*\n\n`;
        modeText += `Mode saat ini: *${botConfig.mode || 'public'}*\n\n`;
        modeText += `Mode tersedia:\n`;
        modeText += `• public - Bot merespon semua user\n`;
        modeText += `• self - Bot hanya merespon owner\n`;
        modeText += `• group - Bot hanya merespon di group\n`;
        modeText += `• private - Bot hanya merespon di private chat\n\n`;
        modeText += `Penggunaan: ${m.prefix}setmode <mode>`;
        
        await m.reply(modeText);
        return;
    }
    
    if (!AVAILABLE_MODES.includes(newMode)) {
        await m.reply(`❌ Mode tidak valid!\n\nMode tersedia: ${AVAILABLE_MODES.join(', ')}`);
        return;
    }
    
    config.mode = newMode;
    
    const modeEmojis = {
        public: '🌐',
        self: '🔒',
        group: '👥',
        private: '📱'
    };
    
    await m.reply(`${modeEmojis[newMode]} Mode bot berhasil diubah ke *${newMode}*`);
}

module.exports = {
    config: pluginConfig,
    handler
};
