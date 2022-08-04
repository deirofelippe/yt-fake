import {
  Order,
  OrderDependencies,
  OrderAttributes,
  OrderItemAttributes
} from '../../entities/Order';
import { BuyItemUsecaseInput } from '../../usecases/BuyItemUsecase';
import { EntityFactoryInterface } from './EntityFactoryInterface';

export class OrderFactory implements EntityFactoryInterface<Order> {
  constructor(private readonly dependencies: OrderDependencies) {}
  recreate(attributes: OrderAttributes): Order {
    if (!attributes.id)
      throw Error(
        'MountExisting da factory precisa de dados já cadastrados no banco.'
      );

    return Order.create(attributes);
  }
  create(attributes: BuyItemUsecaseInput) {
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
