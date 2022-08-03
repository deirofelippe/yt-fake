import {
  OrderDependencies,
  Order,
  OrderAttributes,
  OrderItemAttributes
} from '../entities/Order';
import { BuyItemInput } from '../usecases/BuyItemUsecase';
import { FactoryInterface } from './FactoryInterface';

export class OrderFactory implements FactoryInterface<BuyItemInput, Order> {
  constructor(private readonly dependencies: OrderDependencies) {}

  create(attributes: BuyItemInput) {
    const { idGenerator } = this.dependencies;

    const id_order = idGenerator.generate();

    const orderItem = attributes.items.map(
      (item): OrderItemAttributes => ({
        id: idGenerator.generate(),
        id_order,
        id_purchased_item: item.id,
        type: item.type
      })
    );
    const order: OrderAttributes = {
      id: id_order,
      id_channel: attributes.id_authenticated_channel,
      items: orderItem
    };

    return Order.create(order);
  }
}
