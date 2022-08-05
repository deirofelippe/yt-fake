import { OrderFactory } from '../../../../domain/factories/entities/OrderFactory';
import { PlaylistFactory } from '../../../../domain/factories/entities/PlaylistFactory';
import { VideoFactory } from '../../../../domain/factories/entities/VideoFactory';
import { BuyItemUsecaseFactory } from '../../../../domain/factories/usecases/BuyItemUsecaseFactory';
import { FieldsValidationError } from '../../../../errors/FieldsValidationError';
import { CryptoIDGenerator } from '../../../../infra/libs/CryptoIDGenerator';
import { buyItemJoiSchema } from '../../../../infra/libs/joi/BuyItemJoiSchema';
import { JoiValidator } from '../../../../infra/libs/joi/JoiValidator';
import { OrderRepositoryMemory } from '../../../../infra/repositories/memory/OrderRepositoryMemory';
import { PlaylistRepositoryMemory } from '../../../../infra/repositories/memory/PlaylistRepositoryMemory';
import { VideoRepositoryMemory } from '../../../../infra/repositories/memory/VideoRepositoryMemory';
import { MemoryDatabase } from '../../../MemoryDatabase';

describe('BuyItemUsecaseFactory', () => {
  const memoryDatabase = new MemoryDatabase();
  const idGenerator = new CryptoIDGenerator();
  const playlistFactory = new PlaylistFactory({
    idGenerator
  });
  const playlistRepository = new PlaylistRepositoryMemory(
    memoryDatabase,
    playlistFactory
  );
  const videoFactory = new VideoFactory({
    idGenerator
  });
  const videoRepository = new VideoRepositoryMemory(
    memoryDatabase,
    videoFactory
  );
  const orderFactory = new OrderFactory({
    idGenerator
  });
  const orderRepository = new OrderRepositoryMemory(
    memoryDatabase,
    orderFactory
  );
  const validator = new JoiValidator(buyItemJoiSchema);
  const buyItemUsecaseFactory = new BuyItemUsecaseFactory({
    factory: { validator },
    usecase: {
      orderFactory,
      orderRepository,
      playlistRepository,
      videoRepository
    }
  });

  describe('Validar input', () => {
    let input: any = {
      id_authenticated_channel: '63102cbb-ef58-459d-b583-4fe4a7ad3335',
      items: [{ id: '63102cbb-ef58-459d-b583-4fe4a7ad3335', type: 'video' }]
    };

    test('Deve passar nos testes', async () => {
      buyItemUsecaseFactory.create(input);
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
        buyItemUsecaseFactory.create(input);
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
        buyItemUsecaseFactory.create(input);
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
        buyItemUsecaseFactory.create(input);
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
        buyItemUsecaseFactory.create(input);
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
        buyItemUsecaseFactory.create(input);
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
        buyItemUsecaseFactory.create(input);
      } catch (error) {
        if (error instanceof FieldsValidationError) {
          expect(error.fields).toEqual(expectedError);
        }
      }
    });
  });
});
