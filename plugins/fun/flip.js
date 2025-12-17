/**
 * @file plugins/fun/flip.js
 * @description Plugin untuk membalik koin
 * @author Ourin-AI Team
 * @version 1.0.0
 */

const { randomPick } = require('../../src/lib/functions');

/**
 * Konfigurasi plugin flip
 * @type {import('../../src/lib/plugins').PluginConfig}
 */
const pluginConfig = {
    name: 'flip',
    alias: ['coinflip', 'koin', 'coin'],
    category: 'fun',
    description: 'Membalik koin',
    usage: '.flip',
    example: '.flip',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    limit: 0,
    isEnabled: true
};

/**
 * Hasil flip koin
 * @constant
 */
const COIN_SIDES = [
    { name: 'Kepala', emoji: '👤' },
    { name: 'Ekor', emoji: '🦅' }
];

/**
 * Handler untuk command flip
 * @param {Object} m - Serialized message
 * @returns {Promise<void>}
 */
async function handler(m) {
    const result = randomPick(COIN_SIDES);
    
    let flipText = `🪙 *Flip Koin*\n\n`;
    flipText += `Hasil: ${result.emoji} *${result.name}*`;
    
    await m.reply(flipText);
}

module.exports = {
    config: pluginConfig,
    handler
};
