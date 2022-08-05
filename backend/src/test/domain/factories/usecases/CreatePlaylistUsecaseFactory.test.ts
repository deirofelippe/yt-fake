import { PlaylistVisibility } from '../../../../domain/entities/Playlist';
import { ChannelFactory } from '../../../../domain/factories/entities/ChannelFactory';
import { PlaylistFactory } from '../../../../domain/factories/entities/PlaylistFactory';
import { CreatePlaylistUsecaseFactory } from '../../../../domain/factories/usecases/CreatePlaylistUsecaseFactory';
import { validationMessages as messages } from '../../../../domain/libs/ValidationMessages';
import { FieldsValidationError } from '../../../../errors/FieldsValidationError';
import { CryptoIDGenerator } from '../../../../infra/libs/CryptoIDGenerator';
import { createPlaylistJoiSchema } from '../../../../infra/libs/joi/CreatePlaylistJoiSchema';
import { JoiValidator } from '../../../../infra/libs/joi/JoiValidator';
import { ChannelRepositoryMemory } from '../../../../infra/repositories/memory/ChannelRepositoryMemory';
import { PlaylistRepositoryMemory } from '../../../../infra/repositories/memory/PlaylistRepositoryMemory';
import { MemoryDatabase } from '../../../MemoryDatabase';

describe('CreatePlaylistUsecaseFactory', () => {
  const memoryDatabase = new MemoryDatabase();
  const idGenerator = new CryptoIDGenerator();
  const playlistFactory = new PlaylistFactory({
    idGenerator
  });
  const playlistRepository = new PlaylistRepositoryMemory(
    memoryDatabase,
    playlistFactory
  );
  const channelFactory = new ChannelFactory({
    idGenerator
  });
  const channelRepository = new ChannelRepositoryMemory(
    memoryDatabase,
    channelFactory
  );
  const validator = new JoiValidator(createPlaylistJoiSchema);
  const createPlaylistUsecaseFactory = new CreatePlaylistUsecaseFactory({
    factory: { validator },
    usecase: { channelRepository, playlistFactory, playlistRepository }
  });

  describe('Validar input', () => {
    let input: any = {
      title: 'Curso de Fullcycle Development',
      visibility: PlaylistVisibility.PUBLIC,
      price: 12,
      description:
        'Curso que aborda arquitetura de software, backend, frontend e devops',
      id_authenticated_channel: '63102cbb-ef58-459d-b583-4fe4a7ad3335'
    };

    test('Deve passar nos testes', async () => {
      createPlaylistUsecaseFactory.create(input);
    });

    test('Não deve passar nos testes', async () => {
      input = {
        title: 1,
        visibility: 'a',
        description: 1,
        id_authenticated_channel: 1,
        price: -1
      };

      const expectedError = [
        {
          field: 'id_authenticated_channel',
          message: 'Deve conter letras.'
        },
        { field: 'title', message: 'Deve conter letras.' },
        {
          field: 'price',
          message: 'Deve ser maior que 0 ou 0.'
        },
        {
          field: 'visibility',
          message: 'Deve ser "publico" ou "privado".'
        },
        { field: 'description', message: 'Deve conter letras.' }
      ];

      try {
        createPlaylistUsecaseFactory.create(input);
      } catch (error) {
        if (error instanceof FieldsValidationError) {
          expect(error.fields).toEqual(expectedError);
        }
      }
    });
  });
});
