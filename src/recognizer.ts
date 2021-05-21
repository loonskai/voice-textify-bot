import { Transform, PassThrough, pipeline } from 'stream';
import { promisify } from 'util';
import { SpeechConfig, AudioConfig, AudioInputStream, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';

type RecognizerConfig = {
  key: string
  region: string
  language: string
}

type RecognizeArgs = {
  inputStream: NodeJS.ReadableStream
  transformStream?: NodeJS.ReadWriteStream
}

const promisePipeline = promisify(pipeline);

const getSpeechRecognize = (config: SpeechConfig) => async ({
  inputStream,
  transformStream = new PassThrough()
}: RecognizeArgs): Promise<string> => {
  const pushStream = AudioInputStream.createPushStream();
  const audioConfig = AudioConfig.fromStreamInput(pushStream);
  const recognizer = new SpeechRecognizer(config, audioConfig);
  const outputStream = new Transform({
    transform(arrayBuffer, _, callback) {
      pushStream.write(arrayBuffer.slice());
      callback();
    },
  });

  await promisePipeline(inputStream, transformStream, outputStream);
  pushStream.close();

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(result => {
      recognizer.close();
      resolve(result.text);
    }, err => {
      recognizer.close();
      reject(err);
    });
  });
};

export const configureRecognizer = ({ 
  key,
  region,
  language
}: RecognizerConfig): (args: RecognizeArgs) => Promise<string> => {
  const speechConfig = SpeechConfig.fromSubscription(key, region);
  speechConfig.speechRecognitionLanguage = language;
  return getSpeechRecognize(speechConfig);
};
