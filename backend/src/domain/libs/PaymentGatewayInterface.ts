export interface PaymentGatewayInterface {
  getCheckoutRedirectUrl(items: CheckoutRedirectInput[]): Promise<string>;
  transactionConsulting(): any;
}
export type CheckoutRedirectInput = {
  id: string;
  title: string;
  price: number;
};
