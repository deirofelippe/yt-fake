import ngrok from 'ngrok';
import { env } from './src/env';

ngrok.connect({ authtoken: env.ngrokToken, addr: 3000 }).then((url) => {
  console.log('The ngrok is now running on url: ' + url);
});

process.on('SIGTERM', async () => {
  await ngrok.disconnect();
  console.log('Ngrok server closed.');
  process.exit(0);
});
process.on('exit', async () => {
  await ngrok.disconnect();
  console.log('Ngrok server closed.');
  process.exit(0);
});

//https://7100-186-205-26-89.ngrok.io
