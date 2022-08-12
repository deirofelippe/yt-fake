import axios from 'axios';

import {
  CheckoutRedirectInput,
  PaymentGatewayInterface
} from '../../../domain/libs/PaymentGatewayInterface';
import { env } from '../../../env';
import { Xml2jsParser } from '../Xml2jsParser';

export class PagSeguro implements PaymentGatewayInterface {
  constructor() {}

  public async getCheckoutRedirectUrl(
    items: CheckoutRedirectInput[]
  ): Promise<string> {
    const body = this.generateBodyForCheckoutRedirect(items);
    const url = this.generateUrlForCheckoutRedirect();

    let transaction: any;
    try {
      const response = await axios.post(url, body, {
        headers: { 'content-type': 'application/x-www-form-urlencoded' }
      });

      transaction = await new Xml2jsParser().parseJS(response.data);
    } catch (error) {
      console.error(error);
      throw error;
    }
    const code = transaction.checkout.code[0];
    return `${env.pagSeguro.sandbox.redirectUrl}?code=${code}`;
  }

  private generateBodyForCheckoutRedirect(items: CheckoutRedirectInput[]) {
    const itemsBody = items.reduce((body, item, index) => {
      index++;

      const { id, price, title } = item;

      let itemToBeConverted: any = {};
      itemToBeConverted[`itemId${index}`] = id;
      itemToBeConverted[`itemAmount${index}`] = Number(price).toFixed(2);
      itemToBeConverted[`itemDescription${index}`] = title;
      itemToBeConverted[`itemQuantity${index}`] = 1;

      if (index === 1) return new URLSearchParams(itemToBeConverted).toString();

      return body + '&' + new URLSearchParams(itemToBeConverted).toString();
    }, '');

    const otherBodyInfos = new URLSearchParams({
      currency: 'BRL',
      redirectURL:
        'https://c517-2804-14d-5c33-566b-77cb-ac6c-afe-36c4.ngrok.io/ps/feedback',
      notificationURL:
        'https://c517-2804-14d-5c33-566b-77cb-ac6c-afe-36c4.ngrok.io/ps/feedback'
    }).toString();

    return itemsBody + '&' + otherBodyInfos;
  }

  private generateUrlForCheckoutRedirect() {
    const params = new URLSearchParams({
      email: env.pagSeguro.email,
      token: env.pagSeguro.sandbox.token
    }).toString();

    return `${env.pagSeguro.sandbox.authUrl}?${params}`;
  }

  transactionConsulting() {
    throw new Error('Method not implemented.');
  }
}
