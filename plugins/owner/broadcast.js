/**
 * @file plugins/owner/broadcast.js
 * @description Plugin untuk mengirim broadcast ke semua user
 * @author Ourin-AI Team
 * @version 1.0.0
 */

const { delay } = require('../../src/lib/functions');

/**
 * Konfigurasi plugin broadcast
 * @type {import('../../src/lib/plugins').PluginConfig}
 */
const pluginConfig = {
    name: 'broadcast',
    alias: ['bc', 'bcall'],
    category: 'owner',
    description: 'Kirim pesan broadcast ke semua user terdaftar',
    usage: '.broadcast <pesan>',
    example: '.broadcast Halo semua!',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    limit: 0,
    isEnabled: true
};

/**
 * Handler untuk command broadcast
 * @param {Object} m - Serialized message
 * @param {Object} context - Handler context
 * @returns {Promise<void>}
 */
async function handler(m, { sock, db, config: botConfig }) {
    if (!m.text) {
        await m.reply(`❌ Masukkan pesan untuk broadcast!\n\nContoh: ${m.prefix}broadcast Halo semua!`);
        return;
    }
    
    const users = db.getAllUsers();
    const userJids = Object.keys(users);
    
    if (userJids.length === 0) {
        await m.reply('📋 Tidak ada user terdaftar untuk broadcast');
        return;
    }
    
    await m.reply(`📢 Memulai broadcast ke ${userJids.length} user...`);
    
    const broadcastText = `📢 *BROADCAST*\n\n${m.text}\n\n_Pesan dari ${botConfig.bot?.name || 'Bot'}_`;
    
    let success = 0;
    let failed = 0;
    
    for (const jid of userJids) {
        try {
            await sock.sendMessage(`${jid}@s.whatsapp.net`, {
                text: broadcastText
            });
            success++;
            await delay(1000);
        } catch (error) {
            failed++;
        }
    }
    
    await m.reply(`✅ Broadcast selesai!\n\n• Berhasil: ${success}\n• Gagal: ${failed}\n• Total: ${userJids.length}`);
}

module.exports = {
    config: pluginConfig,
    handler
};
