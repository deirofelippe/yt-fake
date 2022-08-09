import { Order, OrderAttributes, OrderItemAttributes } from '../entities/Order';

export interface OrderRepositoryInterface {
  createOrder(order: Omit<OrderAttributes, 'items'>): Promise<void>;
  createOrderItems(orderItems: OrderItemAttributes[]): Promise<void>;
  findAllOrders(id_channel: string): Promise<Order[] | []>;
}

export type PurchasedItem = {
  id_channel: string;
  id_item: string;
  id_order: string;
  type: 'video' | 'playlist';
};
