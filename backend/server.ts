import express, { Request } from 'express';
import cors from 'cors';
import axios from 'axios';
import xml2js from 'xml2js';
import { env } from './src/env';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: '*' }));

app.get('/', function (req, res) {
  console.log('teste');

  res.status(200).send('<h1>Hello!</h1>');
});
// app.get('/mp/feedback', function (req, res) {
//   console.log('get', req);
// });
// app.post('/mp/feedback', function (req: Request, res) {
//   console.log('post', req.body);
// });
app.post('/ps/feedback', async function (req, res) {
  console.log('post', req);
  console.log('query', req.query);
  console.log('params', req.params);
  console.log('body', req.body);
  console.log('body', req.body.notificationCode);

  const notificationCode = req.body.notificationCode;
  const notificationConsultingUrl =
    env.pagSeguro.sandbox.notificationConsultingUrl;
  const credentials = new URLSearchParams({
    email: env.pagSeguro.email,
    token: env.pagSeguro.sandbox.token
  }).toString();
  const url = `${notificationConsultingUrl}${notificationCode}?${credentials}`;
  console.log(url);

  try {
    const response = await axios.get(url);
    console.log(JSON.stringify(response.data));
    const data = await xml2js.parseStringPromise(response.data);
    const {
      transaction: { status, paymentMethod, items, date }
    } = data;
    const transactionStatus = {
      '1': 'Aguardando pagamento',
      '2': 'Em análise',
      '3': 'Paga',
      '4': 'Disponível',
      '5': 'Em disputa',
      '6': 'Devolvida	',
      '7': 'Cancelada',
      '8': 'Debitado',
      '9': 'Retenção temporária'
    };
    const paymentMethodCode = {
      '101': 'Cartão de crédito Visa',
      '102': 'Cartão de crédito MasterCard',
      '103': 'Cartão de crédito American Express',
      '104': 'Cartão de crédito Diners',
      '105': 'Cartão de crédito Hipercard',
      '106': 'Cartão de crédito Aura',
      '107': 'Cartão de crédito Elo',
      '108': 'Cartão de crédito PLENOCard',
      '109': 'Cartão de crédito PersonalCard',
      '110': 'Cartão de crédito JCB',
      '111': 'Cartão de crédito Discover',
      '112': 'Cartão de crédito BrasilCard',
      '113': 'Cartão de crédito FORTBRASIL',
      '114': 'Cartão de crédito CARDBAN',
      '115': 'Cartão de crédito VALECARD',
      '116': 'Cartão de crédito Cabal',
      '117': 'Cartão de crédito Mais!',
      '118': 'Cartão de crédito Avista',
      '119': 'Cartão de crédito GRANDCARD',
      '120': 'Cartão de crédito Sorocred',
      '122': 'Cartão de crédito Up Policard',
      '123': 'Cartão de crédito Banese Card',
      '201': 'Boleto Bradesco',
      '202': 'Boleto Santander',
      '301': 'Débito online Bradesco',
      '302': 'Débito online Itaú',
      '303': 'Débito online Unibanco',
      '304': 'Débito online Banco do Brasil',
      '305': 'Débito online Banco Real',
      '306': 'Débito online Banrisul',
      '307': 'Débito online HSBC',
      '401': 'Saldo PagSeguro',
      '402': 'PIX',
      '501': 'Oi Paggo',
      '701': 'Depósito em conta - Banco do Brasil'
    };
    const paymentMethodType = {
      '1': 'Cartão de crédito',
      '2': 'Boleto',
      '3': 'Débito online (TEF)',
      '4': 'Saldo PagSeguro',
      '5': 'Oi Paggo',
      '7': 'Depósito em conta',
      '8': 'Cartão Emergencial Caixa (Débito)',
      '11': 'PIX'
    };
    console.log(transactionStatus[status]);
    console.log(paymentMethod[0]);
    console.log(items[0]);
    console.log(date[0]);
    console.log(paymentMethodCode[paymentMethod[0].code[0]]);
    console.log(paymentMethodType[paymentMethod[0].type[0]]);
  } catch (error) {
    console.log(error);
  }

  res.status(200).end();
});

const server = app.listen(3000, async () => {
  console.log('The server is now running on Port 3000');
});

function gracefulShutdown(signal: string) {
  return (code: string) => {
    console.info(`${signal} signal received.`);
    server.close(() => {
      console.log('Http server closed.');
      process.exit(0);
    });
  };
}

process.on('uncaughtException', () =>
  console.log('uncaughtException received.')
);
process.on('unhandledRejection', () =>
  console.log('unhandledRejection received.')
);

process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));

process.on('exit', () => console.log('exit signal received.'));
