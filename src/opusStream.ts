import { spawn } from 'child_process';
import { Duplex } from 'stream';
import duplexify from 'duplexify';

type Args = {
  forceWav?: boolean
  rate?: number
}

export const opusStream = ({ forceWav = false, rate }: Args): Duplex => {
  let args: string[] = [];

  if (forceWav) args = args.concat(['--force-wav']);
  if (rate) args = args.concat(['--rate', rate.toString()]);
  args = args.concat(['-', '-']);

  const opusdec = spawn('opusdec', args);
  return duplexify(opusdec.stdin, opusdec.stdout);
}; 
