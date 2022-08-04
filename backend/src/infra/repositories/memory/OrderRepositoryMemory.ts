import {
  Order,
  OrderAttributes,
  OrderItemAttributes
} from '../../../domain/entities/Order';
import { FactoryInterface } from '../../../domain/factories/FactoryInterface';
import { OrderRepositoryInterface } from '../../../domain/repositories/OrderRepositoryInterface';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class OrderRepositoryMemory implements OrderRepositoryInterface {
  constructor(
    private readonly memoryDatabase: MemoryDatabase,
    private readonly orderFactory: FactoryInterface<Order>
  ) {}

  async findAllOrders(id_channel: string): Promise<[] | Order[]> {
    const { orders, orderItems } = this.memoryDatabase;

    const channelOrders = orders.filter(
      (order) => order.id_channel === id_channel
    );

    const ordersEntities: Order[] = [];
    let orderAttributes: OrderAttributes;

    for (const order of channelOrders) {
      const items = orderItems.filter(
        (orderItem) => orderItem.id_order === order.id
      );

      orderAttributes = {
        ...order,
        items
      };
      ordersEntities.push(this.orderFactory.recreate(orderAttributes));
    }
    return ordersEntities;
  }
  async createOrder(order: Omit<OrderAttributes, 'items'>): Promise<void> {
    this.memoryDatabase.orders.push({ ...order });
  }

  async createOrderItems(orderItems: OrderItemAttributes[]): Promise<void> {
    orderItems.forEach((orderItem) =>
      this.memoryDatabase.orderItems.push(orderItem)
    );
  }
}
