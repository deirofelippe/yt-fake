import { PaymentGatewayTypes } from '../entities/Order';
import { PaymentTransactionConsultingInterface } from '../payment-gateway/PaymentTransactionConsultingInterface';
import { OrderRepositoryInterface } from '../repositories/OrderRepositoryInterface';

export type TransactionNotificationUsecaseInput = {
  notificationCode: string;
  notificationType: string;
  paymentGateway: PaymentGatewayTypes;
};
export type TransactionNotificationUsecaseDependencies = {
  orderRepository: OrderRepositoryInterface;
  paymentTransactionConsulting: PaymentTransactionConsultingInterface;
};

export class TransactionNotificationUsecase {
  constructor(
    private dependencies: TransactionNotificationUsecaseDependencies
  ) {}
  async execute(input: TransactionNotificationUsecaseInput) {
    const { orderRepository, paymentTransactionConsulting } = this.dependencies;
    const notificationCode = input.notificationCode;

    const transactionInformation = await paymentTransactionConsulting.execute(
      notificationCode
    );
    const id_order = transactionInformation.id_order;

    const order = await orderRepository.findOrder(id_order);

    delete transactionInformation.id_order;
    if (order.thereIsNoTransactionInformation()) {
      order.addTransactionInformation({
        ...transactionInformation
      });
      await orderRepository.addTransactionToExistingOrder(order);
      return;
    }

    order.updateTransactionStatus(transactionInformation.transaction.status);
    await orderRepository.updateTransactionStatus(order);
  }
}
