export interface PaymentGatewayInterface {
  getCheckoutRedirectUrl(items: CheckoutRedirectInput): Promise<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactionConsulting(): any;
}

export type CheckoutRedirectItem = {
  id: string;
  title: string;
  price: number;
};
export type CheckoutRedirectInput = {
  id_order: string;
  items: CheckoutRedirectItem[];
};
