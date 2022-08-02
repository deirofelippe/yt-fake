import {
  OrderAttributes,
  OrderItemAttributes
} from '../../../domain/entities/Order';
import { OrderRepositoryInterface } from '../../../domain/repositories/OrderRepositoryInterface';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class OrderRepositoryMemory implements OrderRepositoryInterface {
  constructor(private memoryDatabase: MemoryDatabase) {}

  async findAllOrders(
    id_channel: string
  ): Promise<[] | Omit<OrderAttributes, 'items'>[]> {
    return this.memoryDatabase.orders.filter(
      (order) => order.id_channel === id_channel
    );
  }

  async createOrder(order: Omit<OrderAttributes, 'items'>): Promise<void> {
    this.memoryDatabase.orders.push({ ...order });
  }

  async createOrderItems(orderItems: OrderItemAttributes[]): Promise<void> {
    orderItems.forEach((orderItem) =>
      this.memoryDatabase.orderItems.push(orderItem)
    );
  }
  async findAllOrderItems(
    id_order: string
  ): Promise<[] | OrderItemAttributes[]> {
    return this.memoryDatabase.orderItems.filter(
      (orderItem) => orderItem.id_order === id_order
    );
  }
}
