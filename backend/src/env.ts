import dotenv from 'dotenv';
dotenv.config();

export const env = {
  pagSeguroToken: process.env.PAG_SEGURO_TOKEN,
  pagSeguroEmail: process.env.PAG_SEGURO_EMAIL,
  pagSeguroUrlAuthSandbox: process.env.PAG_SEGURO_URL_AUTH_SANDBOX,
  pagSeguroUrlRedirectSandbox: process.env.PAG_SEGURO_URL_CHECKOUT_SANDBOX,
  mercadoPagoIdApp: process.env.MERCADO_PAGO_ID_APP,
  mercadoPagoPublicKey: process.env.MERCADO_PAGO_PUBLIC_KEY,
  mercadoPagoAccessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  ngrokToken: process.env.NGROK_TOKEN
};

//verifica se pode comprar,pega os valores, retorna a url
//create playlist ja adiciona na library do channel
//adicionar playlist de terceiro na propria library
