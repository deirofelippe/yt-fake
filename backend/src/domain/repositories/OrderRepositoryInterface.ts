import { Order, OrderAttributes, OrderItemAttributes } from '../entities/Order';

export interface OrderRepositoryInterface {
  updateTransactionStatus(order: Order): Promise<void>;
  addTransactionToExistingOrder(updatedOrder: Order): Promise<void>;
  createOrder(order: Omit<OrderAttributes, 'items'>): Promise<void>;
  createOrderItems(orderItems: OrderItemAttributes[]): Promise<void>;
  findAllOrders(id_channel: string): Promise<Order[] | []>;
  findOrder(id_order: string): Promise<Order | undefined>;
}

export type PurchasedItem = {
  id_channel: string;
  id_item: string;
  id_order: string;
  type: 'video' | 'playlist';
};
