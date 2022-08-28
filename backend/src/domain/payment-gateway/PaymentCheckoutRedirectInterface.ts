export interface PaymentCheckoutRedirectInterface {
  execute(items: CheckoutRedirectInput): Promise<string>;
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
