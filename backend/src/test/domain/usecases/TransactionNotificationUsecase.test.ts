import { randomUUID } from 'crypto';
import nock from 'nock';
import {
  OrderAttributes,
  OrderItemAttributes,
  PaymentGatewayTypes,
  TransactionAttributes
} from '../../../domain/entities/Order';
import { OrderFactory } from '../../../domain/factories/entities/OrderFactory';
import {
  TransactionNotificationUsecase,
  TransactionNotificationUsecaseInput
} from '../../../domain/usecases/TransactionNotificationUsecase';
import { CryptoIDGenerator } from '../../../infra/libs/CryptoIDGenerator';
import { PagseguroTransactionConsulting } from '../../../infra/payment-gateway/PagSeguro/PagseguroTransactionConsulting';
import { OrderRepositoryMemory } from '../../../infra/repositories/memory/OrderRepositoryMemory';
import { MemoryDatabase } from '../../MemoryDatabase';
import { xmlNotificationConsulting } from './__mocks__/mockPagseguroResponses';

//http://localhost:3000/payment/notification?gateway=pagseguro
describe('TransactionNotificationUsecase', () => {
  const memoryDatabase = new MemoryDatabase();
  const idGenerator = new CryptoIDGenerator();
  const orderFactory = new OrderFactory({ idGenerator });
  const orderRepository = new OrderRepositoryMemory(
    memoryDatabase,
    orderFactory
  );
  const paymentTransactionConsulting = new PagseguroTransactionConsulting();

  const createTransactionNotificationUsecase = () => {
    return new TransactionNotificationUsecase({
      orderRepository,
      paymentTransactionConsulting
    });
  };

  //enviar um email pro usuario que fez a order
  describe('Recebe notificação de mudança de estado na transação', () => {
    let order: Omit<OrderAttributes, 'items'>;
    let orderItems: OrderItemAttributes[] = [];
    beforeEach(() => {
      memoryDatabase.clear();
      order = {
        id: 'a18da0bb-8b6d-4e62-aba2-16cd8010963b',
        id_channel: '001',
        transaction: {
          status: 'No aguardo'
        }
      };
      orderItems = [
        {
          id: randomUUID(),
          id_purchased_item: 'd722f675-7ec3-429d-9cc4-957cc216fe26',
          type: 'playlist',
          amount: 353,
          id_order: order.id
        },
        {
          id: randomUUID(),
          id_purchased_item: '96b9e83f-369d-46ac-a3eb-bca525389beb',
          type: 'video',
          amount: 571,
          id_order: order.id
        }
      ];
    });

    test('Deve atualizar o status da transação da order', async () => {
      const notExpectedTransactionStatus = 'Status diferente';
      order = {
        ...order,
        paymentGateway: PaymentGatewayTypes.PAGSEGURO,
        transaction: {
          parcelas: 6,
          status: notExpectedTransactionStatus,
          date: '2022-08-25T23:02:22.000-03:00'
        },
        paymentMethod: {
          code: 'Cartão de crédito Visa',
          type: 'Cartão de crédito'
        }
      };

      await orderRepository.createOrder(order);
      await orderRepository.createOrderItems(orderItems);

      const notificationCode = '111';
      nock('https://ws.sandbox.pagseguro.uol.com.br')
        .get(
          `/v3/transactions/notifications/${notificationCode}?email=test%40email.com&token=12345`
        )
        .reply(200, xmlNotificationConsulting);

      const input: TransactionNotificationUsecaseInput = {
        notificationCode,
        notificationType: 'transaction',
        paymentGateway: PaymentGatewayTypes.PAGSEGURO
      };

      const transactionNotificationUsecase =
        createTransactionNotificationUsecase();
      await transactionNotificationUsecase.execute(input);

      const orders = await orderRepository.findAllOrders(order.id_channel);

      const transactionStatus = orders[0].getOrder().transaction.status;
      expect(transactionStatus).not.toEqual(notExpectedTransactionStatus);
    });

    test('Deve adicionar informações de transação na order', async () => {
      await orderRepository.createOrder(order);
      await orderRepository.createOrderItems(orderItems);

      const notificationCode = '111';
      nock('https://ws.sandbox.pagseguro.uol.com.br')
        .get(
          `/v3/transactions/notifications/${notificationCode}?email=test%40email.com&token=12345`
        )
        .reply(200, xmlNotificationConsulting);

      const input: TransactionNotificationUsecaseInput = {
        notificationCode,
        notificationType: 'transaction',
        paymentGateway: PaymentGatewayTypes.PAGSEGURO
      };

      const transactionNotificationUsecase =
        createTransactionNotificationUsecase();
      await transactionNotificationUsecase.execute(input);

      const orders = await orderRepository.findAllOrders(order.id_channel);

      const expectedTransactionInfos: TransactionAttributes = {
        paymentGateway: PaymentGatewayTypes.PAGSEGURO,
        transaction: {
          parcelas: 6,
          status: 'Paga',
          date: '2022-08-25T23:02:22.000-03:00'
        },
        paymentMethod: {
          code: 'Cartão de crédito Visa',
          type: 'Cartão de crédito'
        }
      };

      expect(orders[0].getOrderWithItems()).toEqual<OrderAttributes>({
        ...order,
        ...expectedTransactionInfos,
        items: orderItems
      });
    });
  });
});
