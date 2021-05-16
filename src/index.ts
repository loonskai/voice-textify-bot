import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on('text', ctx => {
  ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`);
});

bot.launch();
