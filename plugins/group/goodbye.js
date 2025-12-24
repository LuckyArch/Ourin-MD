const config = require('../../config')
const { getDatabase } = require('../../src/lib/database')
const path = require('path')
const fs = require('fs')

const pluginConfig = {
    name: 'goodbye',
    alias: ['setgoodbye', 'leave', 'bye'],
    category: 'group',
    description: 'Mengatur goodbye message untuk grup',
    usage: '.goodbye <on/off>',
    example: '.goodbye on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    limit: 0,
    isEnabled: true
}

function getGoodbyeEmoji() {
    const emojis = ['👋', '😢', '💔', '🥺', '😭', '🌙', '✨', '🎭', '🚪']
    return emojis[Math.floor(Math.random() * emojis.length)]
}

function getRandomFarewell() {
    const farewells = [
        'Selamat tinggal',
        'Goodbye',
        'Bye bye',
        'Sampai jumpa',
        'Dadah',
        'See you',
        'Take care'
    ]
    return farewells[Math.floor(Math.random() * farewells.length)]
}

function buildGoodbyeMessage(participant, groupName, memberCount) {
    const emoji = getGoodbyeEmoji()
    const farewell = getRandomFarewell()
    const participantName = participant.split('@')[0]
    
    let text = ''
    text += `╭━━━━━━━━━━━━━━━━╮\n`
    text += `┃ ${emoji} *MEMBER KELUAR* ${emoji}\n`
    text += `╰━━━━━━━━━━━━━━━━╯\n\n`
    text += `${farewell}, @${participantName}! 👋\n\n`
    text += `🏠 *Grup:* ${groupName}\n`
    text += `👥 *Sisa Member:* ${memberCount} orang\n\n`
    text += `━━━━━━━━━━━━━━━━━\n`
    text += `Terima kasih sudah bergabung!\n`
    text += `Semoga sukses selalu~ ✨\n`
    text += `━━━━━━━━━━━━━━━━━`
    
    return text
}

async function sendGoodbyeMessage(sock, groupJid, participant, groupMeta) {
    const db = getDatabase()
    const groupData = db.getGroup(groupJid)
    
    if (!groupData?.goodbye && groupData?.goodbye !== undefined) {
        if (!groupData?.leave) return false
    }
    
    if (groupData?.goodbye === false && groupData?.leave === false) {
        return false
    }
    
    const text = buildGoodbyeMessage(
        participant,
        groupMeta.subject,
        groupMeta.participants?.length || 0
    )
    
    const botName = config.bot?.name || 'Ourin-AI'
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || botName
    
    let thumbPath = path.join(process.cwd(), 'assets', 'images', 'goodbye.jpg')
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
            title: `Goodbye from ${groupMeta.subject}`,
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
        const status = (groupData?.goodbye || groupData?.leave) ? '✅ ON' : '❌ OFF'
        
        await m.reply(
            `👋 *Goodbye Message*\n\n` +
            `Status: ${status}\n\n` +
            `Gunakan:\n` +
            `• \`.goodbye on\` - Aktifkan\n` +
            `• \`.goodbye off\` - Nonaktifkan`
        )
        return
    }
    
    if (subCommand === 'on') {
        db.updateGroup(m.chat, { goodbye: true, leave: true })
        await m.reply(`✅ Goodbye message *diaktifkan*!`)
        return
    }
    
    if (subCommand === 'off') {
        db.updateGroup(m.chat, { goodbye: false, leave: false })
        await m.reply(`❌ Goodbye message *dinonaktifkan*!`)
        return
    }
    
    await m.reply(`❌ Gunakan \`.goodbye on\` atau \`.goodbye off\``)
}

module.exports = {
    config: pluginConfig,
    handler,
    sendGoodbyeMessage,
    buildGoodbyeMessage
}
