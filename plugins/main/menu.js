/**
 * @file plugins/main/menu.js
 * @description Plugin menu dengan UI premium - full unicode, tags, compact
 * @author Ourin-AI Team
 * @version 5.0.0
 */

const config = require('../../config');
const { formatUptime, getTimeGreeting } = require('../../src/lib/formatter');
const { getCommandsByCategory, getCategories } = require('../../src/lib/plugins');
const { getDatabase } = require('../../src/lib/database');
const fs = require('fs');
const path = require('path');

/**
 * Konfigurasi plugin menu
 */
const pluginConfig = {
    name: 'menu',
    alias: ['help', 'bantuan', 'commands', 'm'],
    category: 'main',
    description: 'Menampilkan menu utama bot',
    usage: '.menu [kategori]',
    example: '.menu owner',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    limit: 0,
    isEnabled: true
};

/**
 * Unicode decorations
 */
const U = {
    // Box Drawing
    tl: '╭', tr: '╮', bl: '╰', br: '╯',
    h: '─', v: '│', vl: '├', vr: '┤',
    hl: '┬', hb: '┴', cross: '┼',
    
    // Bullets & Arrows
    bullet: '◦', diamond: '◇', star: '✦',
    arrow: '➤', arrowR: '→', arrowD: '↳',
    check: '', cross2: '✗', dot: '•',
    
    // Decorative
    sparkle: '✨', fire: '🔥', bolt: '⚡',
    crown: '👑', gem: '💎', heart: '❤️',
    shield: '🛡️', sword: '⚔️', magic: '✦',
    
    // Status
    online: '🟢', offline: '🔴', away: '🟡',
    verified: '', badge: '🏷️'
};

/**
 * Emoji untuk setiap kategori
 */
const CATEGORY_EMOJIS = {
    owner: '👑',
    main: '🏠',
    utility: '🔧',
    fun: '🎮',
    group: '👥',
    download: '📥',
    search: '🔍',
    tools: '🛠️',
    sticker: '🖼️',
    ai: '🤖',
    game: '🎯',
    media: '🎬',
    info: 'ℹ️'
};

/**
 * Deskripsi untuk setiap kategori
 */
const CATEGORY_DESC = {
    owner: 'Owner Only',
    main: 'Menu Utama',
    utility: 'Tools & Utils',
    fun: 'Game & Fun',
    group: 'Group Mgmt',
    download: 'Downloader',
    search: 'Search',
    tools: 'Tools',
    sticker: 'Sticker',
    ai: 'AI Features',
    game: 'Games',
    media: 'Media',
    info: 'Information'
};

/**
 * Format waktu compact
 */
function formatTime(date) {
    return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    });
}

/**
 * Format tanggal compact
 */
function formatDateShort(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Handler untuk command menu
 */
async function handler(m, { sock, config: botConfig, db, uptime }) {
    const prefix = botConfig.command?.prefix || '.';
    const args = m.args;
    
    const user = db.getUser(m.sender);
    const now = new Date();
    const timeStr = formatTime(now);
    const dateStr = formatDateShort(now);
    
    const categories = getCategories();
    const commandsByCategory = getCommandsByCategory();

    const tags = [];
    if (m.isOwner) tags.push(`${U.crown} OWNER`);
    else if (m.isPremium) tags.push(`${U.gem} PREMIUM`);
    else tags.push(`${U.dot} USER`);
    
    const statusTag = tags.join(' ');
    
    if (args[0]) {
        const categoryName = args[0].toLowerCase();
        
        if (commandsByCategory[categoryName]) {
            const commands = commandsByCategory[categoryName];
            const emoji = CATEGORY_EMOJIS[categoryName] || '📋';
            
            let txt = '';
            txt += `${U.tl}${U.h.repeat(20)}${U.tr}\n`;
            txt += `${U.v} ${emoji} *${categoryName.toUpperCase()}*\n`;
            txt += `${U.v} ${U.dot} ${commands.length} commands\n`;
            txt += `${U.vl}${U.h.repeat(20)}${U.vr}\n`;
            
            for (const cmd of commands) {
                txt += `${U.v} ${U.arrowR} ${prefix}${cmd}\n`;
            }
            
            txt += `${U.bl}${U.h.repeat(20)}${U.br}\n`;
            txt += `\n${U.sparkle} _Ketik command untuk info_`;
            
            await sendMenuWithUI(m, sock, txt, botConfig, statusTag, prefix, categories, commandsByCategory);
            return;
        }
        
        await m.reply(`${U.cross2} Kategori *${args[0]}* tidak ada!`);
        return;
    }
    
    const greeting = getTimeGreeting();
    const uptimeFormatted = formatUptime(uptime);
    const totalUsers = db.getUserCount();
    
    let totalCommands = 0;
    for (const category of categories) {
        totalCommands += (commandsByCategory[category] || []).length;
    }
    let txt = '';
    
    txt += `${U.sparkle} ${greeting}, *${m.pushName}*!\n\n`;
    
    txt += `${U.tl}${U.h}「 ${U.badge} *USER INFO* 」${U.h}${U.tr}\n`;
    txt += `${U.v} ${U.dot} *Name*: ${m.pushName}\n`;
    txt += `${U.v} ${U.dot} *Tag*: ${statusTag}\n`;
    txt += `${U.v} ${U.dot} *Limit*: ${user?.limit || 25}\n`;
    txt += `${U.v} ${U.dot} *Time*: ${timeStr} WIB\n`;
    txt += `${U.bl}${U.h.repeat(22)}${U.br}\n\n`;
    txt += `${U.tl}${U.h}「 🤖 *BOT INFO* 」${U.h}${U.tr}\n`;
    txt += `${U.v} ${U.dot} *Bot*: ${botConfig.bot?.name || 'Ourin-AI'}\n`;
    txt += `${U.v} ${U.dot} *Ver*: v${botConfig.bot?.version || '1.0.0'}\n`;
    txt += `${U.v} ${U.dot} *Mode*: ${botConfig.mode || 'public'}\n`;
    txt += `${U.v} ${U.dot} *Prefix*: [ ${prefix} ]\n`;
    txt += `${U.v} ${U.dot} *Uptime*: ${uptimeFormatted}\n`;
    txt += `${U.v} ${U.dot} *Users*: ${totalUsers}\n`;
    txt += `${U.bl}${U.h.repeat(22)}${U.br}\n\n`;
    txt += `${U.tl}${U.h}「 📚 *KATEGORI* 」${U.h}${U.tr}\n`;
    
    for (const category of categories) {
        if (category === 'owner' && !m.isOwner) continue;
        const emoji = CATEGORY_EMOJIS[category] || '📋';
        const desc = CATEGORY_DESC[category] || 'Commands';
        const cmdCount = (commandsByCategory[category] || []).length;
        const catName = category.charAt(0).toUpperCase() + category.slice(1);
        
        txt += `${U.v} ${emoji} *${catName}* (${cmdCount})\n`;
        txt += `${U.v}    ${U.arrowD} ${prefix}menu ${category}\n`;
    }
    txt += `${U.v}\n`;
    txt += `${U.bl}${U.h}「 Total: ${totalCommands} 」${U.h}${U.br}\n\n`;
    txt += `${U.star} *${botConfig.bot?.name || 'Ourin-AI'}*\n`;
    txt += `${U.dot} ${dateStr}`;
    
    await sendMenuWithUI(m, sock, txt, botConfig, statusTag, prefix, categories, commandsByCategory);
}

/**
 * Mengirim menu dengan UI premium
 */
async function sendMenuWithUI(m, sock, text, botConfig, statusTag, prefix, categories, commandsByCategory) {
    const botName = botConfig.bot?.name || 'Ourin-AI';
    const saluranId = botConfig.saluran?.id || '120363208449943317@newsletter';
    const saluranName = botConfig.saluran?.name || botName;
    const saluranLink = botConfig.saluran?.link || '';
    const fakeStatusQuoted = {
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast'
        },
        message: {
            extendedTextMessage: {
                text: `${U.sparkle} *${botName}*`,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: saluranId,
                        newsletterName: saluranName,
                        serverMessageId: 127
                    }
                }
            }
        }
    };
    
    const categoryRows = [];
    for (const category of categories) {
        if (category === 'owner' && !m.isOwner) continue;
        const emoji = CATEGORY_EMOJIS[category] || '📋';
        const desc = CATEGORY_DESC[category] || 'Commands';
        const cmdCount = (commandsByCategory[category] || []).length;
        
        categoryRows.push({
            title: `${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)}`,
            description: `${desc} • ${cmdCount} cmd`,
            rowId: `${prefix}menu ${category}`
        });
    }

    const buttons = [
        {
            buttonId: `${prefix}owner`,
            buttonText: { displayText: `${U.crown} OWNER` },
            buttonType: 1
        },
        {
            buttonId: `${prefix}runtime`,
            buttonText: { displayText: `${U.bolt} RUNTIME` },
            buttonType: 1
        },
        {
            buttonId: `${prefix}ping`,
            buttonText: { displayText: `${U.online} PING` },
            buttonType: 1
        }
    ];

    let imagePath = path.join(process.cwd(), 'assets', 'images', 'ourin.jpg');
    let thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin2.jpg');
    
    let imageBuffer = null;
    let thumbBuffer = null;
    
    if (fs.existsSync(imagePath)) {
        imageBuffer = fs.readFileSync(imagePath);
    }
    if (fs.existsSync(thumbPath)) {
        thumbBuffer = fs.readFileSync(thumbPath);
    }
    
    const messageContent = {
        caption: text,
        contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: saluranId,
                newsletterName: saluranName,
                serverMessageId: 127
            },
            externalAdReply: {
                title: `${botName} ${U.verified}`,
                body: `${statusTag} • Ver: ${botConfig.bot?.version || '1.0.0'}`,
                sourceUrl: saluranLink,
                mediaType: 1,
                showAdAttribution: false,
                renderLargerThumbnail: false
            }
        },
        footer: `${botName}`,
        headerType: 1
    };
    
    if (thumbBuffer) {
        messageContent.contextInfo.externalAdReply.thumbnail = thumbBuffer;
    }

    if (imageBuffer) {
        messageContent.image = imageBuffer;
        messageContent.caption = text;
    } else {
        messageContent.text = text;
    }

    messageContent.buttons = buttons;
    
    try {
        await sock.sendMessage(m.chat, messageContent, {
            quoted: fakeStatusQuoted
        });
    } catch (error) {
        await m.reply(text);
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
