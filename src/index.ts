import TelegramBot = require('node-telegram-bot-api');
import dotenv = require('dotenv');
import Agent from 'socks5-https-client/lib/Agent';

dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('set your token at .env -> BOT_TOKEN');
const bot = new TelegramBot(BOT_TOKEN, {
    polling: true,
    request: {
        url: `https://api.telegram.org/bot${BOT_TOKEN}/getMe`,
        agentClass: Agent,
        agentOptions: {
            socksHost: process.env.PROXY_SOCKS5_HOST,
            socksPort: Number(process.env.PROXY_SOCKS5_PORT),
        },
    },
} as TelegramBot.ConstructorOptions);

// // bot.sendMessage
// bot.onText(/\/echo (.+)/, (msg, match) => {
//   const fromId = msg.from?.id; // Получаем ID отправителя
//   const resp = match ? match[1] : ""; // Получаем текст после /echo
//   bot.sendMessage(String(fromId), resp);
// });

// // Простая команда без параметров
// bot.on("message", (msg) => {
//   const chatId = msg.chat.id; // Берем ID чата (не отправителя)
//   bot.sendMessage(chatId, "111");
// });
bot.onText(/^\/start$/, (msg, match) => {
    const option: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [[{ text: 'Yes' }], [{ text: 'No' }]],
        },
    };
    bot.sendMessage(msg.chat.id, '*Some* message here.', option);
});
