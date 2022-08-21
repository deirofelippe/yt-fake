import { CloneObject } from '../../utils/CloneObject';
import { IDGenerator } from '../libs/IDGenerator';

export enum PaymentGatewayTypes {
  PAGSEGURO = 'pagseguro'
}

export type OrderAttributes = {
  id: string;
  id_channel: string;
  items: OrderItemAttributes[];
  paymentGateway?: PaymentGatewayTypes;
  transaction?: {
    parcelas?: number;
    status: string;
    date?: string;
  };
  paymentMethod?: {
    code: string;
    type: string;
  };
};
export type OrderItemAttributes = {
  id: string;
  id_order: string;
  id_purchased_item: string;
  type: 'video' | 'playlist';
  amount?: number;
};
export type OrderDependencies = {
  idGenerator: IDGenerator;
};

export class Order {
  private constructor(private attributes: OrderAttributes) {
    this.attributes = {
      transaction: { status: 'Aguardando pagamento' },
      ...attributes
    };
  }

  public static create(attributes: OrderAttributes) {
    return new Order(attributes);
  }

  get id() {
    return this.attributes.id;
  }
  public getOrderWithItems(): OrderAttributes {
    return CloneObject.clone(this.attributes);
  }
  public getOrder(): Omit<OrderAttributes, 'items'> {
    const order = CloneObject.clone(this.attributes);
    delete order.items;
    return order;
  }
  public getOrderItems(): OrderItemAttributes[] {
    return this.attributes.items;
  }
}
