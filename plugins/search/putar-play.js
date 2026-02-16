const axios = require("axios")
const config = require("../../config")
const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const execAsync = promisify(exec)

const NEOXR_BASE = "https://api.neoxr.eu/api/youtube"

const pluginConfig = {
    name: "putar-play",
    alias: ["putar-play"],
    category: "search",
    description: "Putar musik dari YouTube (Neoxr API)",
    usage: ".putar-play <url>",
    example: ".putar-play https://youtube.com/watch?v=xxxxx",
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.text?.trim()
    if (!url) return m.reply(`🎵 *putar-play*\n\n> Contoh:\n\`${m.prefix}putar-play https://youtube.com/watch?v=xxxxx\``)

    m.react("🎧")

    try {
        const apikey = config.APIkey?.neoxr || config.config?.APIkey?.neoxr
        if (!apikey) throw new Error("API key neoxr belum diatur di config.js")

        const { data: result } = await axios.get(NEOXR_BASE, {
            params: {
                url,
                type: "audio",
                quality: "128kbps",
                apikey
            },
            timeout: 30000
        })

        if (!result?.status) throw new Error(result?.message || "Gagal mengambil audio dari neoxr")

        const audioUrl = result.data?.url
        if (!audioUrl) throw new Error("URL audio tidak tersedia")

        const audioResponse = await axios.get(audioUrl, {
            responseType: "arraybuffer",
            timeout: 60000
        })

        const tempDir = path.join(__dirname, "../../temp")
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

        const ts = Date.now()
        const inputFile = path.join(tempDir, `${ts}_input.mp3`)
        const outputFile = path.join(tempDir, `${ts}_output.opus`)

        fs.writeFileSync(inputFile, audioResponse.data)

        await execAsync(`ffmpeg -y -i "${inputFile}" -c:a libopus -b:a 64k "${outputFile}"`)

        await sock.sendMessage(m.chat, {
            audio: fs.readFileSync(outputFile),
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                externalAdReply: {
                    title: result.title || "YouTube Audio",
                    body: `Selamat menikmati lagu ini yak 🍀`,
                    thumbnailUrl: result.thumbnail,
                    sourceUrl: url,
                    mediaUrl: url,
                    mediaType: 2,
                    renderLargerThumbnail: true
                }
            }
        }, {
            quoted: {
                key: {
                    participant: "0@s.whatsapp.net",
                    ...(m.chat ? { remoteJid: "status@broadcast" } : {})
                },
                message: {
                    contactMessage: {
                        displayName: `${config.bot?.name || "Ourin AI"}`,
                        vcard: "BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Ponsel\nEND:VCARD",
                        sendEphemeral: true
                    }
                }
            }
        })

        m.react("✅")

        try { fs.unlinkSync(inputFile) } catch {}
        try { fs.unlinkSync(outputFile) } catch {}

    } catch (err) {
        console.error("[putar-play]", err)
        m.react("❌")
        m.reply(`❌ *Error*: ${err.message || err}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
