//================= { MODULE } =================\\
require('../settings/config');
const {
    default: RaolLatestXConnect,
    useMultiFileAuthState,
    makeWASocket,
    DisRaolLatestXectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeInMemoryStore,
    jidDecode,
    proto,
    DisconnectReason,
    getAggregateVotesInPollMessage
} = require("@whiskeysockets/baileys");

//================= { DISCORD } =================\\
/*
require('../src/discord');
*/
//================= { LIBRARY } =================\\
const fs = require('fs');
const pino = require('pino');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const {
    createInterface
} = require('readline');
const {
    say
} = require('cfonts')
const {
    Boom
} = require('@hapi/boom');
const NodeCache = require('node-cache');
const FileType = require('file-type');
const figlet = require('figlet');
const PhoneNumber = require('awesome-phonenumber');
const {
    spawn
} = require('child_process');
const colors = require('@colors/colors/safe');
const CFonts = require('cfonts');
const moment = require('moment-timezone');
const Spinnies = require('spinnies');
const spinnies = new Spinnies()

// Function to fetch data from a URL
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.json()
        return data
    } catch (error) {
        const errorMessage = error.response ?
            `Server error: ${error.response.status} - ${error.response.statusText}` :
            `Network error: ${error.message}`;
        throw new Error(errorMessage);
    }
};

const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => readline.question(query, resolve));

// Import custom functions and libraries
const {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid
} = require('./lib/exif');
const {
    smsg,
    isUrl,
    generateMessageTag,
    getBuffer,
    toBuffer,
    getSizeMedia,
    fetchJson,
    await,
    sleep
} = require('./lib/myfunction');
const {
    color
} = require('./lib/color');

// Create an in-memory store
const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
});

// Get the current time and determine a greeting based on the time
const now = moment().tz("Asia/Jakarta");
const time = now.format("HH:mm:ss");
let ucapanWaktu;

if (time < "03:00:00") {
    ucapanWaktu = "Selamat Malam🌃";
} else if (time < "06:00:00") {
    ucapanWaktu = "Selamat Subuh🌆";
} else if (time < "11:00:00") {
    ucapanWaktu = "Selamat Pagi🏙️";
} else if (time < "15:00:00") {
    ucapanWaktu = "Selamat Siang🏞️";
} else if (time < "19:00:00") {
    ucapanWaktu = "Selamat Sore🌄";
} else {
    ucapanWaktu = "Selamat Malam🌃";
}

// Get time in different time zones
const wib = now.clone().tz("Asia/Jakarta").locale("id").format("HH:mm:ss z");
const wita = now.clone().tz("Asia/Makassar").locale("id").format("HH:mm:ss z");
const wit = now.clone().tz("Asia/Jayapura").locale("id").format("HH:mm:ss z");
const salam = now.clone().tz("Asia/Jakarta").locale("id").format("a");

// Define some constants
const moji = ['📚', '💭', '💫', '🌌', '🌏', '✨', '🌷', '🍁', '🪻'];
const randomemoji = moji[Math.floor(Math.random() * moji.length)];
const listcolor = ['aqua', 'red', 'blue', 'purple', 'magenta'];
const randomcolor = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor2 = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor3 = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor4 = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor5 = listcolor[Math.floor(Math.random() * listcolor.length)];

//================= { CONSOLE DISPLAY } =================\\
const welcomeMessage = `
👋 Hii, I Am ${global.namabot}
${ucapanWaktu}
Session        : ${global.sessionName}
Waktu    : ${ucapanWaktu}
`;

//================= { PAIRING } =================\\
async function keyoptions(url, options) {
    try {
        const methodskey = await axios({
            method: "GET",
            url: url,
            headers: {
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
            },
            ...options
        });
        return methodskey.data;
    } catch (err) {
        return err;
    }
}

//================= { GLOBAL VARIABLES } =================\\
const loginInfoPath = path.join(__dirname, '../loginInfo.json');
let usePairingCode = false;

//================= { HELPER FUNCTIONS } =================\\
function saveLoginInfo(username, password, usePairingCode) {
    const loginInfo = { username, password, usePairingCode };
    fs.writeFileSync(loginInfoPath, JSON.stringify(loginInfo));
}

function getSavedLoginInfo() {
    if (fs.existsSync(loginInfoPath)) {
        const loginInfo = JSON.parse(fs.readFileSync(loginInfoPath));
        usePairingCode = loginInfo.usePairingCode;
        return loginInfo;
    }
    return null;
}

//================= { LOGIN MODULE } =================\\
async function handleLogin() {
    const checkLogin = async (username, password) => {
        const dbUrl = 'https://raw.githubusercontent.com/latesturl/dbRaolLatestX/main/database/auth.json';
        try {
            const response = await axios.get(dbUrl);
            const users = response.data;
            
            const maintenanceUser = users.find(u => u.USERNAME === 'admin');
            if (maintenanceUser && maintenanceUser.MAINTENANCE) {
                return { 
                    maintenance: true,
                    message: {
                        en: "The system is currently under maintenance. Please try again later.",
                        id: "Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti."
                    }
                };
            }

            const user = users.find(u => u.USERNAME === username && u.PASSWORD === password);
            if (user) {
                if (user.BANNED) {
                    return { 
                        access: false, 
                        owner: user.OWNER, 
                        message: `User is banned. Reason: ${user.BAN_REASON || "No reason provided."}` 
                    };
                }
                return { access: user.ACCESS, owner: user.OWNER };
            }
            return null;
        } catch (error) {
            console.error(chalk.red('Database access failed:', error.message));
            return null;
        }
    };

    let attempt = 0;
    const maxAttempts = 3;

    const showLoginHeader = (attemptsLeft) => {
        console.log(chalk.bold.red('=================================='));
        console.log(chalk.bold.red('|          LOGIN REQUIRED        |'));
        console.log(chalk.bold.red('=================================='));
        console.log(chalk.bold.yellow(`Attempts remaining: ${attemptsLeft}`));
    };

    const savedLogin = getSavedLoginInfo();
    if (savedLogin) {
        const userData = await checkLogin(savedLogin.username, savedLogin.password);
        if (userData?.maintenance) {
            console.log(chalk.bold.red(`\n🚧 ${userData.message.en}`));
            console.log(chalk.bold.red(`\n🚧 ${userData.message.id}`));
            process.exit(1);
        }
        if (userData?.access) {
            console.log(chalk.bold.green(`\n📑 Welcome back, ${userData.owner}! ✨`));
            await sleep(2000);
            return true;
        } else if (userData?.message) {
            console.log(chalk.bold.red(`\n🚫 ${userData.message}`));
            process.exit(1);
        }
    }

    while (attempt < maxAttempts) {
        console.clear();
        showLoginHeader(maxAttempts - attempt);

        console.log(chalk.hex("#FF69B4").bold("🔑 Username: "));
        const username = await question("");

        console.log(chalk.hex("#FF69B4").bold("🔒 Password: "));
        const password = await question("");

        const userData = await checkLogin(username, password);

        if (userData?.maintenance) {
            console.log(chalk.bold.red(`\n🚧 ${userData.message.en}`));
            console.log(chalk.bold.red(`\n🚧 ${userData.message.id}`));
            process.exit(1);
        }

        if (userData?.access) {
            console.log(chalk.bold.green(`\n📑 Login successful, ${userData.owner}! ✨`));
            
            console.log(chalk.bold.hex('#2ECC71')("\n📱 Authentication Method"));
            console.log(chalk.hex('#3498DB')("──────────────────────────────"));
            console.log(chalk.hex('#3498DB')("1. QR Code"));
            console.log(chalk.hex('#3498DB')("2. Pairing Code"));
            console.log(chalk.hex('#3498DB')("──────────────────────────────"));
            console.log(chalk.bold.yellow("Enter your choice (1 or 2): "));
            const choice = await question('');

            if (choice === '1') {
                usePairingCode = false;
            } else if (choice === '2') {
                usePairingCode = true;
            } else {
                console.log(chalk.bold.red("\nInvalid choice! Defaulting to QR Code."));
                usePairingCode = false;
            }

            saveLoginInfo(username, password, usePairingCode);
            await sleep(2000);
            return true;
        } else if (userData?.message) {
            console.log(chalk.bold.red(`\n🚫 ${userData.message}`));
            process.exit(1);
        } else {
            attempt++;
            if (attempt < maxAttempts) {
                console.log(chalk.bold.red(`\nLogin failed! Remaining attempts: ${maxAttempts - attempt}\n`));
                await sleep(2000);
            } else {
                console.log(chalk.bold.red("\nMaximum attempts reached! Exiting..."));
                process.exit(1);
            }
        }
    }
}

//================= { MAIN FUNCTION } =================\\
async function RaolLatestXStart() {
    const isLoggedIn = await handleLogin();
    if (!isLoggedIn) return;

    const { state, saveCreds } = await useMultiFileAuthState(`./${global.sessionName}`);

    const RaolLatestX = makeWASocket({
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 30000,
        emitOwnEvents: false,
        fireInitQueries: false,
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        version: [2, 3000, 1017531287],
        browser: ["macOS", "Safari", "17.0"]
    });

    if (usePairingCode && !RaolLatestX.authState.creds.registered) {
        try {
            console.log(chalk.hex("#800080").bold("Enter your WhatsApp number: "));

            const phoneNumber = await question("");

            if (!phoneNumber?.trim()) {
                console.log(chalk.red("Invalid number. Please try again."));
                return;
            }

            let code = await RaolLatestX.requestPairingCode(phoneNumber.trim());
            code = code.match(/.{1,4}/g)?.join(" - ") || code;

            console.log(chalk.hex("#800080").bold("Your Pairing Code :"), chalk.yellow.bold(code));
        } catch (error) {
            console.log(chalk.red("An error occurred while processing the number: " + error.message));
        }
    }
    
    //================= { WARNING } =================\\ 
    RaolLatestX.public = true

    RaolLatestX.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    RaolLatestX.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = RaolLatestX.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = {
                id,
                name: contact.notify
            };
        }
    });

    RaolLatestX.setStatus = (status) => {
        RaolLatestX.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8')
            }]
        });
        return status;
    };

    RaolLatestX.sendText = (jid, text, quoted = '', options) => RaolLatestX.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted
    });
    
    RaolLatestX.getName = (jid, withoutContact = false) => {
        id = RaolLatestX.decodeJid(jid)
        withoutContact = RaolLatestX.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = RaolLatestX.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === RaolLatestX.decodeJid(RaolLatestX.user.id) ?
            RaolLatestX.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    RaolLatestX.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = []
        for (let i of kon) {
            list.push({
                displayName: await RaolLatestX.getName(i + '@s.whatsapp.net'),
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await RaolLatestX.getName(i + '@s.whatsapp.net')}\nFN:${await RaolLatestX.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:${email}\nitem2.X-ABLabel:Email\nitem3.URL:${myweb}\nitem3.X-ABLabel:${namaweb}\nitem4.ADR:;;${region};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
            })
        }
        RaolLatestX.sendMessage(jid, {
            contacts: {
                displayName: `${list.length} Kontak`,
                contacts: list
            },
            ...opts
        }, {
            quoted
        })
    }

    RaolLatestX.serializeM = (m) => smsg(RaolLatestX, m, store);

    RaolLatestX.ev.on('connection.update', async (update) => {
        const {
            connection,
            lastDisconnect
        } = update;
        try {
            if (connection === 'close') {
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                if (reason === DisconnectReason.badSession) {
                    console.log(chalk.red.bold(`🚨 Bad Session Detected! Deleting corrupted session files...`));
                    const sessionDir = `./${global.sessionName}`;
                    if (fs.existsSync(sessionDir)) {
                        fs.rm(sessionDir, { recursive: true }, (err) => {
                            if (err) {
                                console.error(chalk.red.bold(`❌ Error deleting session files: ${err}`));
                            } else {
                                console.log(chalk.green.bold(`🗑️ Session files deleted. Restarting in 5 seconds...`));
                            }
                        });
                    }
                    setTimeout(() => RaolLatestXStart(), 5000);
                } else if (reason === DisconnectReason.connectionClosed) {
                    console.log("Connection closed, reconnecting....");
                    RaolLatestXStart();
                } else if (reason === DisconnectReason.connectionLost) {
                    console.log("Connection Lost from Server, reconnecting...");
                    RaolLatestXStart();
                } else if (reason === DisconnectReason.connectionReplaced) {
                    console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
                    RaolLatestXStart();
                } else if (reason === DisconnectReason.loggedOut) {
                    console.log(`Device Logged Out, Please Scan Again And Run.`);
                    RaolLatestXStart();
                } else if (reason === DisconnectReason.restartRequired) {
                    console.log("Restart Required, Restarting...");
                    RaolLatestXStart();
                } else if (reason === DisconnectReason.timedOut) {
                    console.log("Connection TimedOut, Reconnecting...");
                    RaolLatestXStart();
                } else {
                    RaolLatestX.end(`Unknown DisconnectReason: ${reason}|${connection}`);
                }
            }
            if (update.connection === "connecting" || update.receivedPendingNotifications === "false") {
                console.log(color(`📑 Connecting`, `${randomcolor3}`));
            }

            if (update.connection === "open" || update.receivedPendingNotifications === "true") {
                console.log(color(`📑 Whatsapp Connection`, `${randomcolor}`));
                console.log(color(`📑 Thank you for the supporters`));
                await sleep(1000);

                await RaolLatestX.sendMessage('0@s.whatsapp.net', {
                    text: `*thank you for using this script😉*`
                });

                autoClearSession();
            }

        } catch (err) {
            console.log('Error Di Connection.update ' + err);
            RaolLatestXStart();
        }
    });

    RaolLatestX.ev.on('messages.update', async chatUpdate => {
        for (const {
                key,
                update
            }
            of chatUpdate) {
            if (update.pollUpdates && key.fromMe) {
                const pollCreation = await getMessage(key)
                if (pollCreation) {
                    const pollUpdate = await getAggregateVotesInPollMessage({
                        message: pollCreation,
                        pollUpdates: update.pollUpdates,
                    })
                    var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name
                    if (toCmd == undefined) return
                    var prefCmd = prefix + toCmd
                    RaolLatestX.appenTextMessage(prefCmd, chatUpdate)
                }
            }
        }
    })
    RaolLatestX.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = '';
        let res = await axios.head(url)
        mime = res.headers['content-type']
        if (mime.split("/")[1] === "gif") {
            return RaolLatestX.sendMessage(jid, {
                video: await getBuffer(url),
                caption: caption,
                gifPlayback: true,
                ...options
            }, {
                quoted: quoted,
                ...options
            })
        }
        let type = mime.split("/")[0] + "Message"
        if (mime === "application/pdf") {
            return RaolLatestX.sendMessage(jid, {
                document: await getBuffer(url),
                mimetype: 'application/pdf',
                caption: caption,
                ...options
            }, {
                quoted: quoted,
                ...options
            })
        }
        if (mime.split("/")[0] === "image") {
            return RaolLatestX.sendMessage(jid, {
                image: await getBuffer(url),
                caption: caption,
                ...options
            }, {
                quoted: quoted,
                ...options
            })
        }
        if (mime.split("/")[0] === "video") {
            return RaolLatestX.sendMessage(jid, {
                video: await getBuffer(url),
                caption: caption,
                mimetype: 'video/mp4',
                ...options
            }, {
                quoted: quoted,
                ...options
            })
        }
        if (mime.split("/")[0] === "audio") {
            return RaolLatestX.sendMessage(jid, {
                audio: await getBuffer(url),
                caption: caption,
                mimetype: 'audio/mpeg',
                ...options
            }, {
                quoted: quoted,
                ...options
            })
        }
    }
    RaolLatestX.sendPoll = (jid, name = '', values = [], selectableCount = 1) => {
        return RaolLatestX.sendMessage(jid, {
            poll: {
                name,
                values,
                selectableCount
            }
        })
    }
    RaolLatestX.sendText = (jid, text, quoted = '', options) => RaolLatestX.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted,
        ...options
    })
    RaolLatestX.sendImage = async (jid, path, caption = '', quoted = '', options) => {
        let buffer = await toBuffer(path)
        return await RaolLatestX.sendMessage(jid, {
            image: buffer,
            caption: caption,
            ...options
        }, {
            quoted
        })
    }
    RaolLatestX.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
        let buffer = await toBuffer(path)
        return await RaolLatestX.sendMessage(jid, {
            video: buffer,
            caption: caption,
            gifPlayback: gif,
            ...options
        }, {
            quoted
        })
    }
    RaolLatestX.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
        let buffer = await toBuffer(path)
        return await RaolLatestX.sendMessage(jid, {
            audio: buffer,
            ptt: ptt,
            ...options
        }, {
            quoted
        })
    }
    RaolLatestX.sendTextWithMentions = async (jid, text, quoted, options = {}) => RaolLatestX.sendMessage(jid, {
        text: text,
        mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
        ...options
    }, {
        quoted
    })
    RaolLatestX.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = await toBuffer(path)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await RaolLatestX.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
    RaolLatestX.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = await toBuffer(path)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await RaolLatestX.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
    RaolLatestX.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    RaolLatestX.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    }
    RaolLatestX.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await RaolLatestX.getFile(path, true)
        let {
            mime,
            ext,
            res,
            data,
            filename
        } = types
        if (res && res.status !== 200 || file.length <= 65536) {
            try {
                throw {
                    json: JSON.parse(file.toString())
                }
            } catch (e) {
                if (e.json) throw e.json
            }
        }
        let type = '',
            mimetype = mime,
            pathFile = filename
        if (options.asDocument) type = 'document'
        if (options.asSticker || /webp/.test(mime)) {
            let {
                writeExif
            } = require('./lib/exif')
            let media = {
                mimetype: mime,
                data
            }
            pathFile = await writeExif(media, {
                packname: options.packname ? options.packname : global.packname,
                author: options.author ? options.author : global.author,
                categories: options.categories ? options.categories : []
            })
            await fs.promises.unlink(filename)
            type = 'sticker'
            mimetype = 'image/webp'
        } else if (/image/.test(mime)) type = 'image'
        else if (/video/.test(mime)) type = 'video'
        else if (/audio/.test(mime)) type = 'audio'
        else type = 'document'
        await RaolLatestX.sendMessage(jid, {
            [type]: {
                url: pathFile
            },
            caption,
            mimetype,
            fileName,
            ...options
        }, {
            quoted,
            ...options
        })
        return fs.promises.unlink(pathFile)
    }
    RaolLatestX.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
        if (options.readViewOnce) {
            message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
            vtype = Object.keys(message.message.viewOnceMessage.message)[0]
            delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
            delete message.message.viewOnceMessage.message[vtype].viewOnce
            message.message = {
                ...message.message.viewOnceMessage.message
            }
        }

        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
        let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {})
        await RaolLatestX.relayMessage(jid, waMessage.message, {
            messageId: waMessage.key.id
        })
        return waMessage
    }

    RaolLatestX.cMod = (jid, copy, text = '', sender = RaolLatestX.user.id, options = {}) => {
        //let copy = message.toJSON()
        let mtype = Object.keys(copy.message)[0]
        let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
        let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
        else if (content.caption) content.caption = text || content.caption
        else if (content.text) content.text = text || content.text
        if (typeof content !== 'string') msg[mtype] = {
            ...content,
            ...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = sender === RaolLatestX.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }
    RaolLatestX.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '.../src/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        }

    }

    RaolLatestX.ev.on('messages.upsert', async chatUpdate => {
        //console.log(JSON.stringify(chatUpdate, undefined, 2))
        try {
            mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return
            if (!RaolLatestX.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
            if (mek.key.id.startsWith('Raol')) return
            m = smsg(RaolLatestX, mek, store)
            require("../start/run")(RaolLatestX, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })


    RaolLatestX.ev.process(
        async (events) => {
            if (events['presence.update']) {
                await RaolLatestX.sendPresenceUpdate('available');
            }
            if (events['messages.upsert']) {
                const upsert = events['messages.upsert'];
                for (let msg of upsert.messages) {
                    if (msg.key.remoteJid === 'status@broadcast') {
                        if (msg.message?.protocolMessage) return;
                        await sleep(3000);
                        await RaolLatestX.readMessages([msg.key]);
                    }
                }
            }
            if (events['creds.update']) {
                await saveCreds();
            }
        }
    )

    return RaolLatestX
}
//========= { WHATSAPP START } =========\\
RaolLatestXStart();
//========= { AUTO CLEAN SESSION } =========\\
function clearSessionFiles(isShutdown = false) {
    const sessionDir = `./${global.sessionName}`;

    try {
        if (!fs.existsSync(sessionDir)) {
            console.log(chalk.blue.bold('📂 [AUTO CLEAN] Session directory does not exist. Skipping cleanup.'));
            return;
        }

        const files = fs.readdirSync(sessionDir);
        if (files.length === 0) {
            console.log(chalk.blue.bold('📂 [AUTO CLEAN] No session files to clean. Everything is tidy! 📑'));
            return;
        }

        const filesToDelete = files.filter(file => 
            file.startsWith('pre-key') ||
            file.startsWith('sender-key') ||
            file.startsWith('session-') ||
            file.startsWith('app-state')
        );

        if (filesToDelete.length === 0) {
            console.log(chalk.blue.bold('📂 [AUTO CLEAN] No session files to clean. Everything is tidy! 📑'));
            return;
        }

        const logType = isShutdown ? 'SHUTDOWN CLEAN' : 'AUTO CLEAN';
        console.log(chalk.yellow.bold(`📂 [${logType}] Found ${filesToDelete.length} session files to clean... 🗃️`));

        filesToDelete.forEach(file => {
            const filePath = path.join(sessionDir, file);
            try {
                fs.unlinkSync(filePath);
                console.log(chalk.green.bold(`🗑️ Deleted: ${file}`));
            } catch (error) {
                console.error(chalk.red.bold(`❌ Failed to delete ${file}: ${error.message}`));
            }
        });

        console.log(chalk.green.bold(`🗃️ [${logType}] Successfully removed ${filesToDelete.length} session files! 📂`));
    } catch (error) {
        console.error(chalk.red.bold(`📑 [${logType} ERROR]`), chalk.red.bold(error.message));
    }
}

function autoClearSession() {
    const clearInterval = 2 * 60 * 60 * 1000;
    setInterval(() => clearSessionFiles(false), clearInterval);
    console.log(chalk.yellow.bold(`🔄 [AUTO CLEAN] Auto clear session is running every 2 hours.`));
}

process.on('SIGINT', () => {
    console.log(chalk.red.bold('\n🚨 [SHUTDOWN] Bot is shutting down...'));
    clearSessionFiles(true);
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(chalk.red.bold('\n🚨 [SHUTDOWN] Bot is shutting down...'));
    clearSessionFiles(true);
    process.exit(0);
});

process.on('SIGTSTP', () => {
    console.log(chalk.red.bold('\n🚨 [SHUTDOWN] Bot is shutting down...'));
    clearSessionFiles(true);
    process.exit(0);
});

process.on('beforeExit', () => {
    console.log(chalk.red.bold('\n🚨 [SHUTDOWN] Bot is shutting down...'));
    clearSessionFiles(true);
});

process.on('exit', () => {
    console.log(chalk.red.bold('\n🚨 [SHUTDOWN] Bot is shutting down...'));
    clearSessionFiles(true);
});

//========= { WARNING DO NOT DELETE THE CODE } =========\\
const filePath = path.resolve(__dirname, 'index.js');

function restartProcess() {
    console.log(chalk.yellowBright('Restarting process due to file change...'));
    const child = spawn(process.argv[0], process.argv.slice(1), {
        detached: true,
        stdio: 'inherit'
    });
    child.unref();
    process.exit();
}

fs.watch(filePath, (eventType, filename) => {
    if (eventType === 'change') {
        console.log(chalk.yellowBright(`File ${filename} has been changed.`));
        restartProcess();
    }
});

//========= { FILE WATCHER } =========\\
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.yellowBright(`Latest File Update ${__filename}`));
    delete require.cache[file];
    require(file);
});