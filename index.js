const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pairCodeHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WORLD OF QS - PAIR CODE</title>
    <style>
        body {
            background-color: #0d1b2a;
            color: #ffffff;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .card {
            border: 2px solid #ff9f1c;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            background-color: #1b263b;
            box-shadow: 0 4px 15px rgba(255, 159, 28, 0.2);
            width: 300px;
        }
        h1 { color: #ff9f1c; font-size: 20px; margin-bottom: 15px; }
        input {
            width: 90%;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 6px;
            border: 1px solid #ff9f1c;
            background: #0d1b2a;
            color: #fff;
            text-align: center;
        }
        button {
            background-color: #ff9f1c;
            color: #0d1b2a;
            border: none;
            padding: 10px 20px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
        }
        p { color: #e0e1dd; font-size: 12px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>WORLD OF QS</h1>
        <input type="text" placeholder="Enter WhatsApp Number (e.g. 923...)">
        <br>
        <button onclick="alert('Pairing system ready!')">GET CODE</button>
        <p>POWERED BY WORLD OF QS</p>
    </div>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WORLD OF QS</title>
            <style>
                body {
                    background-color: #0d1b2a;
                    color: #ffffff;
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .card {
                    border: 2px solid #ff9f1c;
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    background-color: #1b263b;
                    box-shadow: 0 4px 15px rgba(255, 159, 28, 0.2);
                }
                h1 { color: #ff9f1c; font-size: 24px; margin-bottom: 10px; }
                p { color: #e0e1dd; font-size: 14px; letter-spacing: 1px; }
                a {
                    display: inline-block;
                    margin-top: 15px;
                    color: #ff9f1c;
                    text-decoration: none;
                    border: 1px solid #ff9f1c;
                    padding: 8px 15px;
                    border-radius: 5px;
                }
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
    res.send(pairCodeHTML);
});

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
