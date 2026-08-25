const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");
const qrcode = require("qrcode-terminal");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });

    if (connection === "open") {
      console.log("🌎 World Of Q's Bot is Online!");
    }

    if (
      connection === "close" &&
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
    ) {
      startBot();
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    const chat = msg.key.remoteJid;

    if (text === ".menu") {
      await sock.sendMessage(chat, {
        text: `🌎 WORLD OF Q'S BOT

🤖 Basic
.menu
.help
.ping
.owner
.joke
.quote

👥 Groups
.groupinfo
.tagall

✨ More features coming soon!`
      });
    }

    else if (text === ".help") {
      await sock.sendMessage(chat, {
        text: "🌎 World Of Q's Bot\n\nType .menu to see all commands."
      });
    }

    else if (text === ".ping") {
      await sock.sendMessage(chat, {
        text: "🏓 Pong!\nWorld Of Q's Bot is online ✅"
      });
    }

    else if (text === ".owner") {
      await sock.sendMessage(chat, {
        text: "👑 Owner: World Of Q's"
      });
    }

    else if (text === ".joke") {
      await sock.sendMessage(chat, {
        text: "😂 Bot نے کہا: میں offline نہیں ہوتا، بس کبھی کبھی سوچتا ہوں!"
      });
    }

    else if (text === ".quote") {
      await sock.sendMessage(chat, {
        text: "✨ Keep learning. Keep building. Keep asking questions."
      });
    }

    else if (text === ".groupinfo" && chat.endsWith("@g.us")) {
      const group = await sock.groupMetadata(chat);

      await sock.sendMessage(chat, {
        text: `👥 Group Info

Name: ${group.subject}
Members: ${group.participants.length}`
      });
    }

    else if (text === ".tagall" && chat.endsWith("@g.us")) {
      const group = await sock.groupMetadata(chat);
      const mentions = group.participants.map(user => user.id);
      const tagged = mentions.map(user => "@" + user.split("@")[0]).join(" ");

      await sock.sendMessage(chat, {
        text: "📢 " + tagged,
        mentions: mentions
      });
    }
  });
}

startBot();
