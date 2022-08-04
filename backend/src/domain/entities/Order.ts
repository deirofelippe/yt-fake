import { CloneObject } from '../../utils/CloneObject';
import { IDGenerator } from '../libs/IDGenerator';

export type OrderAttributes = {
  id: string;
  id_channel: string;
  items: OrderItemAttributes[];
};
export type OrderItemAttributes = {
  id: string;
  id_order: string;
  id_purchased_item: string;
  type: 'video' | 'playlist';
};
export type OrderDependencies = {
  idGenerator: IDGenerator;
};

export class Order {
  private constructor(private attributes: OrderAttributes) {}

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
