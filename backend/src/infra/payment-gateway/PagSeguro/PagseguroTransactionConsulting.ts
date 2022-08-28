import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';
import {
  PaymentGatewayTypes,
  TransactionAttributes
} from '../../../domain/entities/Order';
import {
  PaymentTransactionConsultingInterface,
  TransactionConsultingOutput
} from '../../../domain/payment-gateway/PaymentTransactionConsultingInterface';
import { env } from '../../../env';
import {
  transactionStatus,
  paymentMethodCode,
  paymentMethodType
} from './PagseguroTypes';

export class PagseguroTransactionConsulting
  implements PaymentTransactionConsultingInterface
{
  public async execute(
    notificationCode: string
  ): Promise<TransactionConsultingOutput> {
    const response: AxiosResponse = await this.makeRequest(notificationCode);

    const transactionInformation = await this.transformDataToTransaction(
      response.data
    );

    return transactionInformation;
  }

  private async makeRequest(notificationCode: string) {
    const notificationConsultingUrl =
      env.pagSeguro.sandbox.notificationConsultingUrl;

    const credentials = new URLSearchParams({
      email: env.pagSeguro.email,
      token: env.pagSeguro.sandbox.token
    }).toString();

    const url = `${notificationConsultingUrl}${notificationCode}?${credentials}`;

    let response: AxiosResponse;
    try {
      response = await axios.get(url);
    } catch (error) {
      console.error(error);
      throw new Error('Algo deu errado na requisição');
    }

    return response;
  }

  private async transformDataToTransaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ) {
    const jsonData = await xml2js.parseStringPromise(data);
    const { transaction } = jsonData;
    const paymentMethod = transaction.paymentMethod[0];
    const id_order = transaction.reference[0];

    const responseTransactionStatus =
      transaction.status as keyof typeof transactionStatus;
    const responsePaymentMethodCode = paymentMethod
      .code[0] as keyof typeof paymentMethodCode;
    const responsePaymentMethodType = paymentMethod
      .type[0] as keyof typeof paymentMethodType;

    const transactionAttributes: TransactionAttributes = {
      paymentGateway: PaymentGatewayTypes.PAGSEGURO,
      transaction: {
        parcelas: Number(transaction.installmentCount[0]),
        status: transactionStatus[responseTransactionStatus],
        date: transaction.date[0]
      },
      paymentMethod: {
        code: paymentMethodCode[responsePaymentMethodCode],
        type: paymentMethodType[responsePaymentMethodType]
      }
    };

    return { ...transactionAttributes, id_order };
  }
}
