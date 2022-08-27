import axios from 'axios';

import {
  CheckoutRedirectInput,
  PaymentGatewayInterface
} from '../../../domain/libs/PaymentGatewayInterface';
import { env } from '../../../env';
import { Xml2jsParser } from '../Xml2jsParser';

export class PagSeguro implements PaymentGatewayInterface {
  public async getCheckoutRedirectUrl(
    input: CheckoutRedirectInput
  ): Promise<string> {
    const body = this.generateBodyForCheckoutRedirect(input);
    const url = this.generateUrlForCheckoutRedirect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  private generateBodyForCheckoutRedirect(input: CheckoutRedirectInput) {
    const itemsBody = input.items.reduce((body, item, index) => {
      index++;

      const { id, price, title } = item;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const itemToBeConverted: any = {};
      itemToBeConverted[`itemId${index}`] = id;
      itemToBeConverted[`itemAmount${index}`] = Number(price).toFixed(2);
      itemToBeConverted[`itemDescription${index}`] = title;
      itemToBeConverted[`itemQuantity${index}`] = 1;

      if (index === 1) return new URLSearchParams(itemToBeConverted).toString();

      return body + '&' + new URLSearchParams(itemToBeConverted).toString();
    }, '');

    const otherBodyInfos = new URLSearchParams({
      currency: 'BRL',
      reference: input.id_order,
      redirectURL: 'http://localhost:3000/',
      notificationURL:
        'http://localhost:3000/payment/notification?gateway=pagseguro'
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
