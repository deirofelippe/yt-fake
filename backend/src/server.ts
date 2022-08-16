import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', function (req, res) {
  console.log('teste');

  res.status(200).send('<h1>Hello!</h1>');
});
app.get('/mp/feedback', function (req, res) {
  console.log('get', req);
});
app.post('/mp/feedback', function (req, res) {
  console.log('post', req);
});
app.get('/ps/feedback', function (req, res) {
  console.log('get', req);
});
app.post('/ps/feedback', function (req, res) {
  console.log('post', req);
});

const server = app.listen(3000, async () => {
  console.log('The server is now running on Port 3000');
});

async function closeAll(signal: string) {
  console.info(`${signal} signal received.`);
  server.close(() => {
    console.log('Http server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', async () => {
  await closeAll('SIGTERM');
});
process.on('exit', async () => {
  await closeAll('exit');
});
