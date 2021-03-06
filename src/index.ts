import Telegraf = require('telegraf');
import dotenv = require('dotenv');
import process = require('process');
import fs = require('fs');
import path = require('path');
import { exec } from 'child_process';
import { checkExistsWithTimeout, urlRegExp } from './helpers';

dotenv.config();
const { BOT_TOKEN, SERVER_URL, ALLOW_ACCESS } = process.env;
if (!BOT_TOKEN) throw new Error('set your token at .env -> BOT_TOKEN');

const bot = new (Telegraf as any)(BOT_TOKEN);

process.stdout.write('telegram bot was launch\n');

// authorization middleware
bot.use((ctx: any, next: () => void) => {
    const access = ALLOW_ACCESS?.split(', ').includes(String(ctx.from.id));
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

// get a 30 sec video
const videoFileName = 'pivideo.mp4';
const videoPath = `/home/pi/Videos/${videoFileName}`;
bot.command('video', async (ctx: any) => {
    try {
        await new Promise((res) =>
            exec(
                `
                    raspivid -t 30000 -w 640 -h 480 -fps 25 -b 1200000 -p 0,0,640,480 -o pivideo.h264
                    MP4Box -add pivideo.h264 ${videoPath}
                    rm pivideo.h264
                `,
                res,
            ),
        );
        await ctx.replyWithVideo({ source: fs.readFileSync(videoPath) });
        fs.unlinkSync(videoPath);
        process.stdout.write('get a 30 sec video\n');
    } catch (e) {
        process.stdout.write('video command handling error\n');
        process.stdout.write(JSON.stringify(e));
    }
});

// get last 2min videofile
const dirPath = `/home/pi/Videos`;
bot.command('last_video', async (ctx: any) => {
    try {
        const files = await fs.promises.readdir(dirPath);
        const filePaths = files.map((fileName) => path.join(dirPath, fileName));
        filePaths.sort((a, b) => fs.statSync(a).ctimeMs - fs.statSync(b).ctimeMs);
        const penultFile = filePaths.slice(-2)?.[0];
        if (!penultFile) {
            ctx.reply(`no files at ${dirPath} path`);
            return;
        }
        await new Promise((res) => exec(`MP4Box -add ${penultFile} ${videoPath}`, res));
        await ctx.replyWithVideo({ source: fs.readFileSync(videoPath) });
        fs.unlinkSync(videoPath);
        process.stdout.write('get last video file\n');
    } catch (e) {
        process.stdout.write('last video command handling error\n');
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

const port = 5000;
bot.telegram.setWebhook(`${SERVER_URL}/secret-path`);
bot.startWebhook('/secret-path', null, port);
bot.launch();
