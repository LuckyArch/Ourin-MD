const config = require('../../config')
const { getDatabase } = require('../../src/lib/database')
const path = require('path')
const fs = require('fs')

const pluginConfig = {
    name: 'welcome',
    alias: ['setwelcome', 'welcomemsg'],
    category: 'group',
    description: 'Mengatur welcome message untuk grup',
    usage: '.welcome <on/off>',
    example: '.welcome on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    limit: 0,
    isEnabled: true
}

function getWelcomeEmoji() {
    const emojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🎁', '🌸', '🌺', '🔥']
    return emojis[Math.floor(Math.random() * emojis.length)]
}

function getRandomGreeting() {
    const greetings = [
        'Selamat datang',
        'Welcome',
        'Hai hai',
        'Halo',
        'Yoo',
        'Assalamualaikum',
        'Salam kenal'
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
}

function buildWelcomeMessage(participant, groupName, groupDesc, memberCount) {
    const emoji = getWelcomeEmoji()
    const greeting = getRandomGreeting()
    const participantName = participant.split('@')[0]
    
    let text = ''
    text += `╭━━━━━━━━━━━━━━━━╮\n`
    text += `┃ ${emoji} *MEMBER BARU* ${emoji}\n`
    text += `╰━━━━━━━━━━━━━━━━╯\n\n`
    text += `${greeting}, @${participantName}! 👋\n\n`
    text += `🏠 *Grup:* ${groupName}\n`
    text += `👥 *Member:* ${memberCount} orang\n\n`
    
    if (groupDesc && groupDesc.trim()) {
        text += `📋 *Deskripsi:*\n`
        text += `${groupDesc.substring(0, 200)}${groupDesc.length > 200 ? '...' : ''}\n\n`
    }
    
    text += `━━━━━━━━━━━━━━━━━\n`
    text += `🎯 Jangan lupa baca rules ya!\n`
    text += `💬 Saling menghargai sesama member\n`
    text += `🚫 Dilarang spam dan promosi\n`
    text += `━━━━━━━━━━━━━━━━━\n\n`
    text += `*Semoga betah!* ${emoji}`
    
    return text
}

async function sendWelcomeMessage(sock, groupJid, participant, groupMeta) {
    const db = getDatabase()
    const groupData = db.getGroup(groupJid)
    
    if (!groupData?.welcome) return false
    
    const text = buildWelcomeMessage(
        participant,
        groupMeta.subject,
        groupMeta.desc,
        groupMeta.participants?.length || 0
    )
    
    const botName = config.bot?.name || 'Ourin-AI'
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || botName
    
    let thumbPath = path.join(process.cwd(), 'assets', 'images', 'welcome.jpg')
    let thumbBuffer = null
    
    if (!fs.existsSync(thumbPath)) {
        thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin.jpg')
    }
    
    if (fs.existsSync(thumbPath)) {
        thumbBuffer = fs.readFileSync(thumbPath)
    }
    
    const contextInfo = {
        mentionedJid: [participant],
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127
        },
        externalAdReply: {
            title: `Welcome to ${groupMeta.subject}`,
            body: botName,
            mediaType: 1,
            showAdAttribution: false,
            renderLargerThumbnail: true
        }
    }
    
    if (thumbBuffer) {
        contextInfo.externalAdReply.thumbnail = thumbBuffer
    }
    
    try {
        await sock.sendMessage(groupJid, {
            text: text,
            contextInfo: contextInfo
        })
        return true
    } catch (error) {
        return false
    }
}

async function handler(m, { sock, args }) {
    const db = getDatabase()
    const subCommand = args[0]?.toLowerCase()
    
    if (!subCommand) {
        const groupData = db.getGroup(m.chat)
        const status = groupData?.welcome ? '✅ ON' : '❌ OFF'
        
        await m.reply(
            `🎉 *Welcome Message*\n\n` +
            `Status: ${status}\n\n` +
            `Gunakan:\n` +
            `• \`.welcome on\` - Aktifkan\n` +
            `• \`.welcome off\` - Nonaktifkan`
        )
        return
    }
    
    if (subCommand === 'on') {
        db.updateGroup(m.chat, { welcome: true })
        await m.reply(`✅ Welcome message *diaktifkan*!`)
        return
    }
    
    if (subCommand === 'off') {
        db.updateGroup(m.chat, { welcome: false })
        await m.reply(`❌ Welcome message *dinonaktifkan*!`)
        return
    }
    
    await m.reply(`❌ Gunakan \`.welcome on\` atau \`.welcome off\``)
}

module.exports = {
    config: pluginConfig,
    handler,
    sendWelcomeMessage,
    buildWelcomeMessage
}
