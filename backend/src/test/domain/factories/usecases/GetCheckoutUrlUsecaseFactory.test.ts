import { GetCheckoutUrlUsecaseFactory } from '../../../../domain/factories/usecases/GetCheckoutUrlUsecaseFactory';
import { PaymentGatewayInterface } from '../../../../domain/libs/PaymentGatewayInterface';
import { PlaylistRepositoryInterface } from '../../../../domain/repositories/PlaylistRepositoryInterface';
import { VideoRepositoryInterface } from '../../../../domain/repositories/VideoRepositoryInterface';
import { FieldsValidationError } from '../../../../errors/FieldsValidationError';
import { getCheckoutUrlJoiSchema } from '../../../../infra/libs/joi/GetCheckoutUrlJoiSchema';
import { JoiValidator } from '../../../../infra/libs/joi/JoiValidator';

describe('GetCheckoutUrlUsecaseFactory', () => {
  const mockPlaylistRepository = {} as PlaylistRepositoryInterface;
  const mockVideoRepository = {} as VideoRepositoryInterface;
  const mockPaymentGateway = {} as PaymentGatewayInterface;

  const validator = new JoiValidator(getCheckoutUrlJoiSchema);
  const getCheckoutUrlUsecaseFactory = new GetCheckoutUrlUsecaseFactory({
    factory: { validator },
    usecase: {
      playlistRepository: mockPlaylistRepository,
      paymentGateway: mockPaymentGateway,
      videoRepository: mockVideoRepository
    }
  });

  describe('Validar input', () => {
    let input: any = {
      id_authenticated_channel: '63102cbb-ef58-459d-b583-4fe4a7ad3335',
      items: [{ id: '63102cbb-ef58-459d-b583-4fe4a7ad3335', type: 'video' }]
    };

    test('Deve passar nos testes', async () => {
      getCheckoutUrlUsecaseFactory.create(input);
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
        getCheckoutUrlUsecaseFactory.create(input);
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
        getCheckoutUrlUsecaseFactory.create(input);
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
        getCheckoutUrlUsecaseFactory.create(input);
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
        getCheckoutUrlUsecaseFactory.create(input);
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
        getCheckoutUrlUsecaseFactory.create(input);
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
        getCheckoutUrlUsecaseFactory.create(input);
      } catch (error) {
        if (error instanceof FieldsValidationError) {
          expect(error.fields).toEqual(expectedError);
        }
      }
    });
  });
});
