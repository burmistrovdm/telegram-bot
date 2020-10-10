import Telegraf = require('telegraf');
import dotenv = require('dotenv');
import process = require('process');
import fs = require('fs');
import { exec } from 'child_process';
import { checkExistsWithTimeout, urlRegExp } from './helpers';

dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('set your token at .env -> BOT_TOKEN');

const bot = new (Telegraf as any)(process.env.BOT_TOKEN);

process.stdout.write('telegram bot was launch\n');

// Naive authorization middleware
bot.use((ctx: any, next: () => void) => {
    const access = process.env.ALLOW_ACCESS?.split(', ').includes(String(ctx.from.id));
    if (!access) {
        process.stdout.write('user access error\n');
        return;
    }
    return next();
});

// stop vlc player
bot.command('stop', () => {
    try {
        exec(`killall vlc`);
        process.stdout.write('stopped vlc\n');
    } catch (e) {
        process.stdout.write('stop comand handling error\n');
        process.stdout.write(JSON.stringify(e));
    }
});

// get a photo
const photoPath = '/home/pi/Pictures/photo.jpg';
const shotDuration = 2000;
bot.command('photo', async (ctx: any) => {
    try {
        exec(`raspistill -t ${shotDuration} -o ${photoPath}`);
        await checkExistsWithTimeout(photoPath, shotDuration * 2);
        await ctx.replyWithPhoto({ source: fs.readFileSync(photoPath) });
        fs.unlinkSync(photoPath);
        process.stdout.write('get a photo\n');
    } catch (e) {
        process.stdout.write('photo command handling error\n');
        process.stdout.write(JSON.stringify(e));
    }
});

// get a video
const videoPath = '/home/pi/Videos/video.h264';
const videoDuration = 60000;
bot.command('video', async (ctx: any) => {
    try {
        exec(`raspivid -t ${videoDuration} -o ${videoPath}`);
        await new Promise((res) => setTimeout(res, videoDuration * 1.5));
        await checkExistsWithTimeout(videoPath, videoDuration / 2);
        await ctx.replyWithVideo({ source: fs.readFileSync(videoPath) });
        fs.unlinkSync(videoPath);
        process.stdout.write('get a video\n');
    } catch (e) {
        process.stdout.write('video command handling error\n');
        process.stdout.write(JSON.stringify(e));
    }
});

// run vlc player
bot.on('message', (ctx: any) => {
    const message: string | undefined = ctx.message.text;
    try {
        if (!message) return;
        const url = message.match(urlRegExp)?.[0];
        if (!url) return;
        exec(`vlc ${url} --fullscreen --preferred-resolution 720 --play-and-exit`);
        process.stdout.write('running vlc\n');
    } catch (e) {
        process.stdout.write('message handling error\n');
        process.stdout.write(JSON.stringify(e));
    }
});

bot.launch();
