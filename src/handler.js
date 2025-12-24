/**
 * @file src/handler.js
 * @description Message handler utama untuk memproses pesan dan menjalankan plugin
 * @author Ourin-AI Team
 * @version 2.0.0
 */

const config = require('../config');
const { isSelf } = require('../config');
const { serialize } = require('./lib/serialize');
const { getPlugin, getPluginCount } = require('./lib/plugins');
const { getDatabase } = require('./lib/database');
const { formatUptime, createWaitMessage, createErrorMessage } = require('./lib/formatter');
const { getUptime } = require('./connection');
const { logger, logMessage, logCommand, c } = require('./lib/colors');
const { isLid, lidToJid, convertLidArray } = require('./lib/lidHelper');

/**
 * @typedef {Object} HandlerContext
 * @property {Object} sock - Socket connection
 * @property {Object} m - Serialized message
 * @property {Object} config - Bot configuration
 * @property {Object} db - Database instance
 * @property {number} uptime - Bot uptime
 */

/**
 * Anti-spam map untuk tracking pesan per user
 * @type {Map<string, number>}
 */
const spamMap = new Map();

/**
 * Cek apakah user sedang spam
 * @param {string} jid - JID user
 * @returns {boolean} True jika sedang spam
 */
function isSpamming(jid) {
    if (!config.features?.antiSpam) return false;
    
    const now = Date.now();
    const lastMessage = spamMap.get(jid) || 0;
    const interval = config.features?.antiSpamInterval || 3000;
    
    if (now - lastMessage < interval) {
        return true;
    }
    
    spamMap.set(jid, now);
    return false;
}

/**
 * Cek permission untuk menjalankan command
 * @param {Object} m - Serialized message
 * @param {Object} pluginConfig - Konfigurasi plugin
 * @returns {{allowed: boolean, reason: string}} Object dengan status dan alasan
 */
function checkPermission(m, pluginConfig) {
    if (pluginConfig.isOwner && !m.isOwner) {
        return { allowed: false, reason: config.messages?.ownerOnly || '🚫 Owner only!' };
    }
    
    if (pluginConfig.isPremium && !m.isPremium && !m.isOwner) {
        return { allowed: false, reason: config.messages?.premiumOnly || '💎 Premium only!' };
    }
    
    if (pluginConfig.isGroup && !m.isGroup) {
        return { allowed: false, reason: config.messages?.groupOnly || '👥 Group only!' };
    }
    
    if (pluginConfig.isPrivate && m.isGroup) {
        return { allowed: false, reason: config.messages?.privateOnly || '📱 Private chat only!' };
    }
    
    return { allowed: true, reason: '' };
}

/**
 * Cek mode bot
 * @param {Object} m - Serialized message
 * @returns {boolean} True jika boleh diproses
 */
function checkMode(m) {
    const mode = config.mode || 'public'
    
    if (mode === 'self') {
        return m.fromMe || m.isOwner
    }
    
    return true
}

/**
 * Handler utama untuk memproses pesan
 * @param {Object} msg - Raw message dari Baileys
 * @param {Object} sock - Socket connection
 * @returns {Promise<void>}
 * @example
 * sock.ev.on('messages.upsert', async ({ messages }) => {
 *   await messageHandler(messages[0], sock);
 * });
 */
async function messageHandler(msg, sock) {
    try {
        const m = await serialize(sock, msg);
        
        if (!m) return;
        if (!m.message) return;
        
        // Get database instance
        const db = getDatabase();
        
        // Self mode check - only bot number can access
        const selfModeEnabled = db.setting('selfMode');
        if (selfModeEnabled && !isSelf(m.senderNumber)) {
            // Silently ignore non-bot users in self mode
            return;
        }
        
        if (m.isBanned) {
            logger.warn('Banned user', m.sender);
            return;
        }
        
        if (!checkMode(m)) {
            return;
        }
        
        if (config.features?.autoRead) {
            await sock.readMessages([m.key]);
        }
        
        // db already declared above
        if (!m.pushName || m.pushName === 'Unknown' || m.pushName.trim() === '') {
            return;
        }
        
        db.setUser(m.sender, {
            name: m.pushName,
            lastSeen: new Date().toISOString()
        });
        
        // Only log non-command messages
        if (config.features?.logMessage && !m.isCommand) {
            const chatType = m.isGroup ? 'group' : 'private';
            logMessage(chatType, m.pushName, m.body);
        }
        
        if (!m.isCommand) return;
        
        if (isSpamming(m.sender)) {
            return;
        }
        
        const plugin = getPlugin(m.command);
        
        if (!plugin) {
            return;
        }
        
        if (!plugin.config.isEnabled) {
            return;
        }
        
        const permission = checkPermission(m, plugin.config);
        if (!permission.allowed) {
            await m.reply(permission.reason);
            return;
        }
        
        const user = db.getUser(m.sender);
        
        if (!m.isOwner && plugin.config.cooldown > 0) {
            const cooldownRemaining = db.checkCooldown(m.sender, m.command, plugin.config.cooldown);
            if (cooldownRemaining) {
                const cooldownMsg = (config.messages?.cooldown || '⏱️ Tunggu %time% detik')
                    .replace('%time%', cooldownRemaining);
                await m.reply(cooldownMsg);
                return;
            }
        }
        
        if (!m.isOwner && !m.isPremium && plugin.config.limit > 0) {
            const currentLimit = user?.limit || 0;
            if (currentLimit < plugin.config.limit) {
                await m.reply(config.messages?.limitExceeded || '📊 Limit habis!');
                return;
            }
            db.updateLimit(m.sender, -plugin.config.limit);
        }
        
        if (config.features?.autoTyping) {
            await sock.sendPresenceUpdate('composing', m.chat);
        }
        
        const context = {
            sock,
            m,
            config,
            db,
            uptime: getUptime(),
            plugins: {
                count: getPluginCount()
            }
        };
        
        // Log command execution with box style
        const chatType = m.isGroup ? 'group' : 'private';
        logCommand(`${m.prefix}${m.command}`, m.pushName, chatType);
        
        await plugin.handler(m, context);
        
        if (!m.isOwner && plugin.config.cooldown > 0) {
            db.setCooldown(m.sender, m.command, plugin.config.cooldown);
        }
        
        db.incrementStat('commandsExecuted');
        db.incrementStat(`command_${m.command}`);
        
        if (config.features?.autoTyping) {
            await sock.sendPresenceUpdate('paused', m.chat);
        }
        
    } catch (error) {
        logger.error('Handler', error.message);
        
        try {
            const m = await serialize(sock, msg);
            if (m) {
                await m.reply(createErrorMessage('Terjadi kesalahan saat memproses command!'));
            }
        } catch {
            logger.error('Failed to send error message');
        }
    }
}

/**
 * Handler untuk update group participants
 * @param {Object} update - Update data
 * @param {Object} sock - Socket connection
 * @returns {Promise<void>}
 */
async function groupHandler(update, sock) {
    try {
        const { id: groupJid, participants, action } = update
        
        const db = getDatabase()
        
        let groupData = db.getGroup(groupJid)
        if (!groupData) {
            db.createGroup(groupJid, {
                welcome: config.welcome?.defaultEnabled ?? true,
                goodbye: config.goodbye?.defaultEnabled ?? true,
                leave: config.goodbye?.defaultEnabled ?? true
            })
            groupData = db.getGroup(groupJid)
        }
        
        const groupMeta = await sock.groupMetadata(groupJid)
        
        let sendWelcomeMessage, sendGoodbyeMessage
        try {
            sendWelcomeMessage = require('../plugins/group/welcome').sendWelcomeMessage
            sendGoodbyeMessage = require('../plugins/group/goodbye').sendGoodbyeMessage
        } catch (e) {
            return
        }
        
        for (let participant of participants) {
            if (isLid(participant)) {
                participant = lidToJid(participant)
            }
            
            if (action === 'add') {
                await sendWelcomeMessage(sock, groupJid, participant, groupMeta)
            }
            
            if (action === 'remove') {
                await sendGoodbyeMessage(sock, groupJid, participant, groupMeta)
            }
        }
        
    } catch (error) {
        console.error('[GroupHandler] Error:', error.message)
    }
}

module.exports = {
    messageHandler,
    groupHandler,
    checkPermission,
    checkMode,
    isSpamming
};
