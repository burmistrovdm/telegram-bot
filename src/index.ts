import TelegramBot = require('node-telegram-bot-api');
import dotenv = require('dotenv');
import process = require('process');
// import Agent from 'socks5-https-client/lib/Agent';
import { exec } from 'child_process';

dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('set your token at .env -> BOT_TOKEN');

const bot = new TelegramBot(BOT_TOKEN, {
    polling: true,
    request: {
        url: `https://api.telegram.org/bot${BOT_TOKEN}/getMe`,
    },
} as TelegramBot.ConstructorOptions);

process.stdout.write('telegram bot was launch\n');

const urlRegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
// run vlc player
bot.onText(urlRegExp, (msg) => {
    try {
        if (!msg.text) return;
        const url = msg.text.match(urlRegExp)?.[0];
        if (!url) return;
        exec(`vlc ${url} --fullscreen --preferred-resolution 720 --play-and-exit`);
        process.stdout.write('running vlc\n');
    } catch (e) {
        process.stdout.write(e);
    }
});

// stop vlc player
bot.onText(/^\/stop/, () => {
    try {
        exec(`killall vlc`);
        process.stdout.write('stopped vlc\n');
    } catch (e) {
        process.stdout.write(e);
    }
});
