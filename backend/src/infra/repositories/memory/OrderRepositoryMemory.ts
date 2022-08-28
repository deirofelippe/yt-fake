import {
  Order,
  OrderAttributes,
  OrderItemAttributes
} from '../../../domain/entities/Order';
import { EntityFactoryInterface } from '../../../domain/factories/entities/EntityFactoryInterface';
import { OrderRepositoryInterface } from '../../../domain/repositories/OrderRepositoryInterface';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class OrderRepositoryMemory implements OrderRepositoryInterface {
  constructor(
    private readonly memoryDatabase: MemoryDatabase,
    private readonly orderFactory: EntityFactoryInterface<Order>
  ) {}
  async updateTransactionStatus(orderToUpdate: Order): Promise<void> {
    const updatedOrder = this.memoryDatabase.orders.find(
      (order) => order.id === orderToUpdate.id
    );
    updatedOrder.transaction.status =
      orderToUpdate.getOrder().transaction.status;
    const orders = this.memoryDatabase.orders.filter(
      (order) => order.id !== orderToUpdate.id
    );
    orders.push(updatedOrder);
    this.memoryDatabase.orders = orders;
  }
  async addTransactionToExistingOrder(updatedOrder: Order): Promise<void> {
    const orders = this.memoryDatabase.orders.filter(
      (order) => order.id !== updatedOrder.id
    );
    const orderAttributes = updatedOrder.getOrderWithItems();
    delete orderAttributes.items;
    orders.push(orderAttributes);
    this.memoryDatabase.orders = orders;
  }
  async findOrder(id_order: string): Promise<Order> {
    const { orders, orderItems } = this.memoryDatabase;
    const order = orders.find((order) => order.id === id_order);

    if (!order) return undefined;

    const items = orderItems.filter((item) => item.id_order === id_order);
    const orderWithItems: OrderAttributes = {
      ...order,
      items
    };
    return this.orderFactory.recreate(orderWithItems);
  }

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
