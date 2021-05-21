import { Telegraf } from 'telegraf';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { opusStream } from './opusStream';
import { configureRecognizer } from './recognizer';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const recognize = configureRecognizer({
  key: process.env.SUBSCRIPTION_KEY,
  region: 'eastus',
  language: 'en-US'
});

bot.on('voice', async ctx => {
  try {
    ctx.telegram.sendMessage(ctx.message.chat.id, 'Processing voice message ...');
    const { href: fileUrl } = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const { data: voiceMessageStream } = await axios(fileUrl, { responseType: 'stream' });
    const text = await recognize({
      inputStream: voiceMessageStream,
      transformStream: opusStream({ forceWav: true, rate: 16000 }) 
    });

    ctx.reply(text || 'Don\'t be shy, tell me something', { reply_to_message_id: ctx.message.message_id });
  } catch (error) {
    console.log(error);
    ctx.telegram.sendMessage(ctx.message.chat.id, 'Something went wrong');
  }
});

bot.launch();
