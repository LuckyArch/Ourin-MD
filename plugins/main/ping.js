/**
 * @file plugins/main/ping.js
 * @description Plugin ping dengan informasi lengkap dan styling premium
 * @author Ourin-AI Team
 * @version 2.0.0
 */

const os = require('os');
const config = require('../../config');

/**
 * Konfigurasi plugin ping
 */
const pluginConfig = {
    name: 'ping',
    alias: ['p', 'speed', 'latency'],
    category: 'main',
    description: 'Cek response time dan status bot',
    usage: '.ping',
    example: '.ping',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    limit: 0,
    isEnabled: true
};

/**
 * Format bytes ke human readable
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format uptime
 */
function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const d = days;
    const h = hours % 24;
    const m = minutes % 60;
    const s = seconds % 60;
    
    let result = '';
    if (d > 0) result += `${d}d `;
    if (h > 0) result += `${h}h `;
    if (m > 0) result += `${m}m `;
    result += `${s}s`;
    
    return result.trim();
}

/**
 * Get CPU usage percentage
 */
function getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    for (const cpu of cpus) {
        for (const type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    }
    
    return ((1 - totalIdle / totalTick) * 100).toFixed(1);
}

/**
 * Get load average
 */
function getLoadAvg() {
    const load = os.loadavg();
    return load.map(l => l.toFixed(2)).join(' | ');
}

/**
 * Handler untuk command ping
 */
async function handler(m, { sock, config: botConfig, uptime }) {
    const start = Date.now();
    
    // Send initial message
    const sentMsg = await m.reply('🏓 _Pinging..._');
    
    const end = Date.now();
    const responseTime = end - start;
    
    // System info
    const memUsed = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpuUsage = getCpuUsage();
    const platform = os.platform();
    const arch = os.arch();
    const nodeVersion = process.version;
    const hostname = os.hostname();
    const cpuModel = os.cpus()[0]?.model || 'Unknown';
    const cpuCores = os.cpus().length;
    
    // Response time indicator
    let speedEmoji, speedText;
    if (responseTime < 100) {
        speedEmoji = '🟢';
        speedText = 'Excellent';
    } else if (responseTime < 300) {
        speedEmoji = '🟡';
        speedText = 'Good';
    } else if (responseTime < 500) {
        speedEmoji = '🟠';
        speedText = 'Average';
    } else {
        speedEmoji = '🔴';
        speedText = 'Slow';
    }
    
    // Build premium styled message
    let text = '';
    
    text += `> 🏓 **PONG!**\n`;
    text += `> _Response time: ${responseTime}ms_\n\n`;
    
    text += `╭──「 ⚡ *LATENCY* 」\n`;
    text += `│ ${speedEmoji} *Status*: ${speedText}\n`;
    text += `│ 📶 *Ping*: \`${responseTime}ms\`\n`;
    text += `│ ⏱️ *Uptime*: \`${formatUptime(uptime)}\`\n`;
    text += `╰─────────────\n\n`;
    
    text += `╭──「 💻 *SYSTEM* 」\n`;
    text += `│ 🖥️ *Host*: \`${hostname}\`\n`;
    text += `│ 💽 *Platform*: \`${platform} ${arch}\`\n`;
    text += `│ 🔧 *Node.js*: \`${nodeVersion}\`\n`;
    text += `╰─────────────\n\n`;
    
    text += `╭──「 🧠 *MEMORY* 」\n`;
    text += `│ 📊 *Heap Used*: \`${formatBytes(memUsed.heapUsed)}\`\n`;
    text += `│ 📈 *Heap Total*: \`${formatBytes(memUsed.heapTotal)}\`\n`;
    text += `│ 💾 *RSS*: \`${formatBytes(memUsed.rss)}\`\n`;
    text += `│ 🗄️ *System Used*: \`${formatBytes(usedMem)}\`\n`;
    text += `│ 🆓 *System Free*: \`${formatBytes(freeMem)}\`\n`;
    text += `╰─────────────\n\n`;
    
    text += `╭──「 🔥 *CPU* 」\n`;
    text += `│ 🏷️ *Model*: \`${cpuModel.substring(0, 30)}\`\n`;
    text += `│ 🔢 *Cores*: \`${cpuCores}\`\n`;
    text += `│ 📉 *Usage*: \`${cpuUsage}%\`\n`;
    text += `│ ⚖️ *Load Avg*: \`${getLoadAvg()}\`\n`;
    text += `╰─────────────\n\n`;
    
    text += `\`\`\`\n`;
    text += `Bot: ${botConfig.bot?.name || 'Ourin-AI'}\n`;
    text += `Ver: v${botConfig.bot?.version || '1.0.0'}\n`;
    text += `Dev: ${botConfig.bot?.developer || 'Developer'}\n`;
    text += `\`\`\``;
    
    // Edit the message with full info
    try {
        await sock.sendMessage(m.chat, { 
            text: text,
            edit: sentMsg.key 
        });
    } catch {
        // Fallback: send new message if edit fails
        await m.reply(text);
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
