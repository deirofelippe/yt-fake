import axios from 'axios';
import xml2js from 'xml2js';
import { env } from '../../env';

export class PagSeguro {
  constructor() {}
  public async execute(items: any[]) {
    const itemsBody = items.reduce((body, item, index) => {
      index++;
      const { id, price, title } = item;
      let v: any = {};
      v[`itemId${index}`] = id;
      v[`itemAmount${index}`] = Number(price).toFixed(2);
      v[`itemDescription${index}`] = title;
      v[`itemQuantity${index}`] = 1;
      if (index === 1)
        return new URLSearchParams({ ...v, currency: 'BRL' }).toString();
      return body + '&' + new URLSearchParams(v).toString();
    }, '');

    let urlSearchParams: URLSearchParams;
    urlSearchParams = new URLSearchParams({
      email: env.pagSeguroEmail,
      token: env.pagSeguroToken
    });
    const params = urlSearchParams.toString();

    const url = `${env.pagSeguroUrlAuthSandbox}?${params}`;
    console.log(url);
    console.log(itemsBody);

    try {
      const response = await axios.post(url, itemsBody, {
        headers: { 'content-type': 'application/x-www-form-urlencoded' }
      });
      const data = await xml2js.parseStringPromise(response.data);
      console.log(data.checkout.code[0]);
      const code = data.checkout.code[0];
      const urlRedirect = `${env.pagSeguroUrlRedirectSandbox}?code=${code}`;
      console.log(urlRedirect);
    } catch (error) {
      console.log(error);
    }
  }
}
