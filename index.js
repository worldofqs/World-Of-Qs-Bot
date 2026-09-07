const express = require('express');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WORLD OF QS</title>
            <style>
                body { background-color: #0d1b2a; color: #ffffff; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { border: 2px solid #ff9f1c; border-radius: 12px; padding: 30px; text-align: center; background-color: #1b263b; box-shadow: 0 4px 15px rgba(255, 159, 28, 0.2); }
                h1 { color: #ff9f1c; font-size: 24px; margin-bottom: 10px; }
                p { color: #e0e1dd; font-size: 14px; letter-spacing: 1px; }
                a { display: inline-block; margin-top: 15px; color: #ff9f1c; text-decoration: none; border: 1px solid #ff9f1c; padding: 8px 15px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>● WORLD OF QS IS RUNNING</h1>
                <p>POWERED BY WORLD OF QS</p>
                <a href="/pair">Get Pair Code</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/pair', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WORLD OF QS - PAIR CODE</title>
            <style>
                body { background-color: #0d1b2a; color: #ffffff; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { border: 2px solid #ff9f1c; border-radius: 12px; padding: 30px; text-align: center; background-color: #1b263b; box-shadow: 0 4px 15px rgba(255, 159, 28, 0.2); width: 300px; }
                h1 { color: #ff9f1c; font-size: 20px; margin-bottom: 15px; }
                input { width: 90%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #ff9f1c; background: #0d1b2a; color: #fff; text-align: center; }
                button { background-color: #ff9f1c; color: #0d1b2a; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; }
                #codeDisplay { margin-top: 15px; font-size: 18px; font-weight: bold; color: #2ec4b6; letter-spacing: 2px; }
                p { color: #e0e1dd; font-size: 12px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>WORLD OF QS</h1>
                <input type="text" id="num" placeholder="Enter Number (e.g. 923001234567)">
                <br>
                <button onclick="getCode()">GET CODE</button>
                <div id="codeDisplay"></div>
                <p>POWERED BY WORLD OF QS</p>
            </div>
            <script>
                async function getCode() {
                    const num = document.getElementById('num').value;
                    const display = document.getElementById('codeDisplay');
                    if (!num) {
                        display.style.color = '#e63946';
                        display.innerText = 'Please enter number!';
                        return;
                    }
                    display.style.color = '#ff9f1c';
                    display.innerText = 'Generating Code...';
                    try {
                        const res = await fetch('/code?number=' + encodeURIComponent(num));
                        const data = await res.json();
                        if (data.code) {
                            display.style.color = '#2ec4b6';
                            display.innerText = 'CODE: ' + data.code;
                        } else {
                            display.style.color = '#e63946';
                            display.innerText = data.error || 'Failed to generate code';
                        }
                    } catch (e) {
                        display.style.color = '#e63946';
                        display.innerText = 'Server Error!';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/code', async (req, res) => {
    let num = req.query.number;

    if (!num) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    num = num.replace(/[^0-9]/g, '');

    const sessionDir = path.join(os.tmpdir(), `session_${Math.random().toString(36).substring(7)}`);

    try {
        const { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'fatal' }),
            browser: ["Ubuntu", "Chrome", "20.0.04"]
        });

        sock.ev.on('creds.update', saveCreds);

        // Wait for socket initialization
        await delay(3000);

        if (!sock.authState.creds.registered) {
            let code = await sock.requestPairingCode(num);
            code = code?.match(/.{1,4}/g)?.join("-") || code;

            // Cleanup temp files
            setTimeout(() => {
                fs.remove(sessionDir).catch(() => {});
            }, 5000);

            return res.json({ code: code });
        } else {
            return res.status(400).json({ error: 'Number already paired' });
        }
    } catch (err) {
        console.error('Pair Error:', err);
        fs.remove(sessionDir).catch(() => {});
        return res.status(500).json({ error: 'Failed to generate pairing code!' });
    }
});

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

