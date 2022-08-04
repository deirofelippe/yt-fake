import { Order, OrderAttributes, OrderItemAttributes } from '../entities/Order';

export interface OrderRepositoryInterface {
  createOrder(order: Omit<OrderAttributes, 'items'>): Promise<void>;
  createOrderItems(orderItems: OrderItemAttributes[]): Promise<void>;
  findAllOrders(id_channel: string): Promise<Order[] | []>;
}
