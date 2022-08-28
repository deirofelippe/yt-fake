import { OrderFactory } from '../../../../domain/factories/entities/OrderFactory';
import { CreateOrderUsecaseFactory } from '../../../../domain/factories/usecases/CreateOrderUsecaseFactory';
import { IDGenerator } from '../../../../domain/libs/IDGenerator';
import { PaymentCheckoutRedirectInterface } from '../../../../domain/payment-gateway/PaymentCheckoutRedirectInterface';
import { OrderRepositoryInterface } from '../../../../domain/repositories/OrderRepositoryInterface';
import { PlaylistRepositoryInterface } from '../../../../domain/repositories/PlaylistRepositoryInterface';
import { VideoRepositoryInterface } from '../../../../domain/repositories/VideoRepositoryInterface';
import { FieldsValidationError } from '../../../../errors/FieldsValidationError';
import { createOrderJoiSchema } from '../../../../infra/libs/joi/CreateOrderJoiSchema';
import { JoiValidator } from '../../../../infra/libs/joi/JoiValidator';

describe('CreateOrderUsecaseFactory', () => {
  const mockPlaylistRepository = {} as PlaylistRepositoryInterface;
  const mockVideoRepository = {} as VideoRepositoryInterface;
  const mockIdGenerator = {} as IDGenerator;
  const mockOrderFactory = {} as OrderFactory;
  const mockOrderRepository = {} as OrderRepositoryInterface;
  const mockPaymentCheckoutRedirect = {} as PaymentCheckoutRedirectInterface;

  const validator = new JoiValidator(createOrderJoiSchema);
  const createOrderUsecaseFactory = new CreateOrderUsecaseFactory({
    factory: { validator },
    usecase: {
      idGenerator: mockIdGenerator,
      orderFactory: mockOrderFactory,
      orderRepository: mockOrderRepository,
      playlistRepository: mockPlaylistRepository,
      paymentCheckoutRedirect: mockPaymentCheckoutRedirect,
      videoRepository: mockVideoRepository
    }
  });

  describe('Validar input', () => {
    let input: any = {
      id_authenticated_channel: '63102cbb-ef58-459d-b583-4fe4a7ad3335',
      items: [{ id: '63102cbb-ef58-459d-b583-4fe4a7ad3335', type: 'video' }]
    };

    test('Deve passar nos testes', async () => {
      createOrderUsecaseFactory.create(input);
    });

    test('Não deve passar no teste 0', async () => {
      input = {
        items: [
          {
            id: '63102cbb-ef58-459d-b583-4fe4a7ad333563102cbb-ef58-459d-b583-4fe4a7ad3335',
            type: ''
          }
        ]
      };

      const expectedError = [
        { field: 'id_authenticated_channel', message: 'É obrigatório.' },
        {
          field: 'items[0].id',
          message: 'Deve ter no máximo 50 caracteres.'
        },
        {
          field: 'items[0].type',
          message: 'Deve ser "video" ou "playlist".'
        },
        { field: 'items[0].type', message: 'Deve ser preenchido.' }
      ];

      try {
        createOrderUsecaseFactory.create(input);
      } catch (error) {
        if (error instanceof FieldsValidationError) {
          expect(error.fields).toEqual(expectedError);
        }
      }
    });
    test('Não deve passar no teste 1', async () => {
      input = {
        items: [{ id: '', type: 'public' }]
      };

      const expectedError = [
        { field: 'id_authenticated_channel', message: 'É obrigatório.' },
        { field: 'items[0].id', message: 'Deve ser preenchido.' },
        {
          field: 'items[0].type',
          message: 'Deve ser "video" ou "playlist".'
        }
      ];

      try {
        createOrderUsecaseFactory.create(input);
      } catch (error) {
        if (error instanceof FieldsValidationError) {
          expect(error.fields).toEqual(expectedError);
        }
      }
    });
    test('Não deve passar no teste 2', async () => {
      input = {
        id_authenticated_channel: ''
      };

      const expectedError = [
        { field: 'id_authenticated_channel', message: 'Deve ser preenchido.' },
        { field: 'items', message: 'É obrigatório.' }
      ];

      try {
        createOrderUsecaseFactory.create(input);
      } catch (error) {
        if (error instanceof FieldsValidationError) {
          expect(error.fields).toEqual(expectedError);
        }
      }
    });
    test('Não deve passar no teste 3', async () => {
      input = {
        id_authenticated_channel: 1,
        items: []
      };

      const expectedError = [
        { field: 'id_authenticated_channel', message: 'Deve conter letras.' },
        { field: 'items', message: 'Deve ter no mínimo 1 item no cart.' }
      ];

      try {
        createOrderUsecaseFactory.create(input);
      } catch (error) {
        if (error instanceof FieldsValidationError) {
          expect(error.fields).toEqual(expectedError);
        }
      }
    });
    test('Não deve passar no teste 4', async () => {
      input = {
        id_authenticated_channel: '63102cbb-ef58-459d-b583-4fe4a7ad3335',
        items: [{}]
      };

      const expectedError = [
        { field: 'items[0].id', message: 'É obrigatório.' },
        { field: 'items[0].type', message: 'É obrigatório.' }
      ];

      try {
        createOrderUsecaseFactory.create(input);
      } catch (error) {
        if (error instanceof FieldsValidationError) {
          expect(error.fields).toEqual(expectedError);
        }
      }
    });
    test('Não deve passar no teste 5', async () => {
      input = {};

      const expectedError = [
        { field: 'id_authenticated_channel', message: 'É obrigatório.' },
        { field: 'items', message: 'É obrigatório.' }
      ];

      try {
        createOrderUsecaseFactory.create(input);
      } catch (error) {
        if (error instanceof FieldsValidationError) {
          expect(error.fields).toEqual(expectedError);
        }
      }
    });
  });
});
