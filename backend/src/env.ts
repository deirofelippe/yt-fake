import dotenv from 'dotenv';
dotenv.config();

export const env = {
  pagSeguro: {
    email: process.env.PAG_SEGURO_EMAIL,
    sandbox: {
      token: process.env.PAG_SEGURO_TOKEN,
      authUrl: process.env.PAG_SEGURO_URL_AUTH_SANDBOX,
      notificationConsultingUrl:
        process.env.PAG_SEGURO_URL_SANDBOX_NOTIFICATION,
      redirectUrl: process.env.PAG_SEGURO_URL_CHECKOUT_SANDBOX
    }
  },
  mercadoPagoIdApp: process.env.MERCADO_PAGO_ID_APP,
  mercadoPagoPublicKey: process.env.MERCADO_PAGO_PUBLIC_KEY,
  mercadoPagoAccessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  ngrokToken: process.env.NGROK_TOKEN
};
