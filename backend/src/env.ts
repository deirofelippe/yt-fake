import dotenv from 'dotenv';
dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const PAG_SEGURO_EMAIL =
  NODE_ENV === 'test' ? 'test@email.com' : process.env.PAG_SEGURO_EMAIL;
const PAG_SEGURO_TOKEN =
  NODE_ENV === 'test' ? '12345' : process.env.PAG_SEGURO_TOKEN;

export const env = {
  pagSeguro: {
    email: PAG_SEGURO_EMAIL,
    sandbox: {
      token: PAG_SEGURO_TOKEN,
      authUrl: process.env.PAG_SEGURO_URL_SANDBOX_AUTH,
      notificationConsultingUrl:
        process.env.PAG_SEGURO_URL_SANDBOX_NOTIFICATION,
      redirectUrl: process.env.PAG_SEGURO_URL_SANDBOX_CHECKOUT
    }
  },
  mercadoPagoIdApp: process.env.MERCADO_PAGO_ID_APP,
  mercadoPagoPublicKey: process.env.MERCADO_PAGO_PUBLIC_KEY,
  mercadoPagoAccessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  ngrokToken: process.env.NGROK_TOKEN
};
