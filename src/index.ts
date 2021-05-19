import { spawn } from 'child_process';
import { Transform, pipeline } from 'stream';
import { promisify } from 'util';
import { Telegraf } from 'telegraf';
import { SpeechConfig, AudioConfig, AudioInputStream, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const promisePipeline = promisify(pipeline);
const bot = new Telegraf(process.env.BOT_TOKEN);

const pushStream = AudioInputStream.createPushStream();
const speechConfig = SpeechConfig.fromSubscription(process.env.SUBSCRIPTION_KEY, 'eastus');
speechConfig.speechRecognitionLanguage = 'en-US';

bot.on('text', ctx => {
  ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`);
});

bot.on('voice', async ctx => {
  try {
    const { href: fileUrl } = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const res = await axios(fileUrl, { responseType: 'stream' });
    const output = new Transform({
      transform(arrayBuffer, encoding, callback) {
        pushStream.write(arrayBuffer.slice());
        callback();
      },
    });

    const opusdec = spawn('opusdec', ['--force-wav', '--rate', '16000', '-', '-']);

    await promisePipeline(
      res.data,
      opusdec.stdin,
    );

    await promisePipeline(
      opusdec.stdout,
      output,
    );

    pushStream.close();
    const audioConfig = AudioConfig.fromStreamInput(pushStream);
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    recognizer.recognizeOnceAsync((result) => {
      ctx.telegram.sendMessage(ctx.message.chat.id, result.text);
      recognizer.close();
    }, err => {
      console.trace('Error', err);
      recognizer.close();
    });
  } catch (error) {
    console.log(error);
    ctx.telegram.sendMessage(ctx.message.chat.id, 'Something went wrong');
  }
});

bot.launch();
