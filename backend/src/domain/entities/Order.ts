import { CloneObject } from '../../utils/CloneObject';
import { IDGenerator } from '../libs/IDGenerator';
import { BuyItemInput } from '../usecases/BuyItemUsecase';

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

  public static create(dependencies: OrderDependencies, input: BuyItemInput) {
    const { idGenerator } = dependencies;

    const id_order = idGenerator.generate();
    const orderItem = input.items.map(
      (item): OrderItemAttributes => ({
        id: idGenerator.generate(),
        id_order,
        id_purchased_item: item.id,
        type: item.type
      })
    );
    const order: OrderAttributes = {
      id: id_order,
      id_channel: input.id_authenticated_channel,
      items: orderItem
    };

    return new Order(order);
  }
  get id() {
    return this.attributes.id;
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
