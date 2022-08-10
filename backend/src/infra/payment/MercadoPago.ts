import mercadopago from 'mercadopago';
import { PreferenceItem } from 'mercadopago/models/preferences/create-payload.model';
import { env } from '../../env';
export class MercadoPago {
  constructor() {}
  public async execute(products: any[]) {
    const items = products.map(
      (product): PreferenceItem => ({
        id: product.id,
        title: product.title,
        quantity: 1,
        unit_price: Number(product.price)
      })
    );

    mercadopago.configure({
      access_token: env.mercadoPagoAccessToken,
      sandbox: true
    });

    try {
      const response = await mercadopago.preferences.create({
        items: items,
        back_urls: {
          failure: 'https://7100-186-205-26-89.ngrok.io/mp/feedback',
          pending: 'https://7100-186-205-26-89.ngrok.io/mp/feedback',
          success: 'https://7100-186-205-26-89.ngrok.io/mp/feedback'
        }
      });
      console.log(response.body);
      console.log(response.body.sandbox_init_point);
    } catch (error) {
      console.error(error);
    }
  }
}
