const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestWaWebVersion
} = require("@whiskeysockets/baileys");

const P = require("pino");

let starting = false;

async function startBot() {
  if (starting) return;
  starting = true;

  try {
    const { state, saveCreds } =
      await useMultiFileAuthState("auth");

    let version;

    try {
      const latest = await fetchLatestWaWebVersion();
      version = latest.version;
      console.log(
        "Using WhatsApp Web version:",
        version.join(".")
      );
    } catch (err) {
      console.log(
        "Could not fetch WhatsApp Web version."
      );
    }

    const sock = makeWASocket({
      auth: state,
      logger: P({ level: "silent" }),
      printQRInTerminal: false,
      ...(version ? { version } : {})
    });

    sock.ev.on("creds.update", saveCreds);

    let pairingRequested = false;

    sock.ev.on(
      "connection.update",
      async (update) => {
        const {
          connection,
          lastDisconnect
        } = update;

        if (connection === "connecting") {
          console.log(
            "Connecting to WhatsApp..."
          );

          if (
            !state.creds.registered &&
            !pairingRequested
          ) {
            const phoneNumber =
              process.env.PHONE_NUMBER;

            if (!phoneNumber) {
              console.log(
                "❌ PHONE_NUMBER environment variable is missing"
              );
              return;
            }

            pairingRequested = true;

            try {
              await new Promise(
                resolve => setTimeout(resolve, 2000)
              );

              const code =
                await sock.requestPairingCode(
                  phoneNumber.trim()
                );

              console.log(
                "================================"
              );
              console.log(
                "🌎 WORLD OF Q'S BOT"
              );
              console.log(
                "PAIRING CODE:",
                code
              );
              console.log(
                "================================"
              );
            } catch (error) {
              console.log(
                "❌ Pairing code error:",
                error.message
              );

              pairingRequested = false;
            }
          }
        }

        if (connection === "open") {
          console.log(
            "🌎 World Of Q's Bot is Online! ✅"
          );

          starting = false;
        }

        if (connection === "close") {
          const statusCode =
            lastDisconnect?.error?.output
              ?.statusCode;

          console.log(
            "Connection closed. Status:",
            statusCode
          );

          starting = false;

          if (
            statusCode ===
            DisconnectReason.loggedOut
          ) {
            console.log(
              "❌ WhatsApp logged out."
            );
            return;
          }

          if (
            statusCode ===
            DisconnectReason.restartRequired
          ) {
            console.log(
              "⚠️ WhatsApp requested a restart."
            );
            return;
          }

          if (statusCode === 515) {
            console.log(
              "⚠️ Pairing connection closed with 515."
            );
            console.log(
              "Do not request another pairing code immediately."
            );
            return;
          }

          if (statusCode === 401) {
            console.log(
              "❌ WhatsApp authentication rejected (401)."
            );
            return;
          }

          console.log(
            "Connection closed without automatic pairing retry."
          );
        }
      }
    );

    sock.ev.on(
      "messages.upsert",
      async ({ messages }) => {
        for (const msg of messages) {
          if (
            !msg.message ||
            msg.key.fromMe
          ) {
            continue;
          }

          const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage
              ?.text ||
            "";

          const chat =
            msg.key.remoteJid;

          if (text === ".ping") {
            await sock.sendMessage(
              chat,
              {
                text:
                  "🏓 Pong!\nWorld Of Q's Bot is online ✅"
              }
            );
          }

          else if (text === ".help") {
            await sock.sendMessage(
              chat,
              {
                text:
                  "🌎 World Of Q's Bot\n\nType .menu to see commands."
              }
            );
          }

          else if (text === ".menu") {
            await sock.sendMessage(
              chat,
              {
                text:
`🌎 WORLD OF Q'S BOT

🤖 Basic
.ping
.help
.menu

✨ More features coming soon!`
              }
            );
          }
        }
      }
    );

  } catch (error) {
    console.log(
      "❌ Bot start error:",
      error.message
    );

    starting = false;
  }
}

startBot();
