import { Telegraf } from 'telegraf';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { pipeline } from 'stream';
import * as fs from 'fs';
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on('text', ctx => {
  ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`);
});

bot.on('voice', async ctx => {
  console.log(ctx.message.voice);
  const { href: fileUrl } = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
  const res = await axios(fileUrl, { responseType: 'stream' });
  pipeline(
    res.data,
    fs.createWriteStream('test.ogg'),
    err => {
      console.error(err);
    }
  );
});

bot.launch();
