const fs = require('fs');
const moment = require('moment-timezone');
const chalk = require('chalk');
const { runtime } = require('../start/lib/myfunction');
const { addCountCmd, getPosiCmdUser } = require('../start/tmp/helpers/command');

module.exports = async (RaolLatestX, m, command, args, isOwner, isCreator, isCmd, prefix, pushname, ftroli, fkontak, randomemoji, ucapanWaktu, pendaftar, budy) => {
//================= { WARNING } =================\\
switch (command) {
//================= { WARNING } =================\\
case "menu":
case "help": {
    RaolLatestX.sendMessage(m.chat, { react: { text: `${randomemoji}`, key: m.key } });
    const owned = global.ownNumb + "@s.whatsapp.net";

    const nodeVersion = process.version;
    const packageJson = require('../package.json');
    const baileysVersion = packageJson.dependencies['@whiskeysockets/baileys'] || packageJson.devDependencies['@whiskeysockets/baileys'];
    const botStatus = RaolLatestX.public ? 'Public' : 'Self';

    await RaolLatestX.sendMessage(m.chat, {
        video: { url: 'https://files.catbox.moe/b568wr.mp4' },
        gifPlayback: true,
        caption: `Hello *${pushname}*, this is the bot menu!\n\n` +
                 `─ Time: *${ucapanWaktu}*\n` +
                 `─ Runtime: *${runtime(process.uptime())}*\n` +
                 `─ Node.js: *${nodeVersion}*\n` +
                 `─ Baileys: *${baileysVersion}*\n` +
                 `─ Status: *${botStatus}*`,
        footer: `Powered by LatestURL`,
        contextInfo: {
            mentionedJid: [m.sender, owned],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterName: `#RaolLatestX`,
                newsletterJid: `120363395676155390@newsletter`,
            },
        },
        headerType: 1,
        viewOnce: true
    }, { quoted: ftroli });

    await RaolLatestX.sendMessage(m.chat, {
        audio: { url: 'https://files.catbox.moe/rgjgzu.mp3' },
        ptt: true,
        mimetype: 'audio/mpeg',
        contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterName: `#RaolLatestX`,
                newsletterJid: `120363395676155390@newsletter`,
            },
        },
    }, { quoted: ftroli });
}
break;
case 'public': {
    if (!isOwner) return;
    RaolLatestX.sendMessage(m.chat, {
        react: {
            text: `${randomemoji}`,
            key: m.key
        }
    });
    RaolLatestX.public = true;
    m.reply('succes');
    break;
}

case 'self': {
    if (!isOwner) return;
    RaolLatestX.sendMessage(m.chat, {
        react: {
            text: `${randomemoji}`,
            key: m.key
        }
    });
    RaolLatestX.public = false;
    m.reply('succes');
    break;
}
//================= { WARNING } =================\\
        default:
            if (budy.startsWith('=>')) {
                if (!isOwner) return;
                function Return(sul) {
                    sat = JSON.stringify(sul, null, 2);
                    bang = util.format(sat);
                    if (sat == undefined) {
                        bang = util.format(sul);
                    }
                    return m.reply(bang);
                }
                try {
                    m.reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)));
                } catch (e) {
                    m.reply(String(e));
                }
            }

            if (budy.startsWith('>')) {
                if (!isOwner) return;
                try {
                    let evaled = await eval(budy.slice(2));
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                    await m.reply(evaled);
                } catch (err) {
                    await m.reply(String(err));
                }
            }

            if (budy.startsWith('$')) {
                if (!isOwner) return;
                require("child_process").exec(budy.slice(2), (err, stdout) => {
                    if (err) return m.reply(`${err}`);
                    if (stdout) return m.reply(stdout);
                });
            }
    }
};
//================= { WARNING } =================\\