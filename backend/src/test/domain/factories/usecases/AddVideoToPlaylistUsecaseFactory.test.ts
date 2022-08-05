import { PlaylistFactory } from '../../../../domain/factories/entities/PlaylistFactory';
import { VideoFactory } from '../../../../domain/factories/entities/VideoFactory';
import { AddVideoToPlaylistUsecaseFactory } from '../../../../domain/factories/usecases/AddVideoToPlaylistUsecaseFactory';
import { validationMessages as messages } from '../../../../domain/libs/ValidationMessages';
import { FieldsValidationError } from '../../../../errors/FieldsValidationError';
import { CryptoIDGenerator } from '../../../../infra/libs/CryptoIDGenerator';
import { addVideoToPlaylistJoiSchema } from '../../../../infra/libs/joi/AddVideoToPlaylistJoiSchema';
import { JoiValidator } from '../../../../infra/libs/joi/JoiValidator';
import { PlaylistRepositoryMemory } from '../../../../infra/repositories/memory/PlaylistRepositoryMemory';
import { VideoRepositoryMemory } from '../../../../infra/repositories/memory/VideoRepositoryMemory';
import { MemoryDatabase } from '../../../MemoryDatabase';

describe('AddVideoToPlaylistUsecaseFactory', () => {
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
  const validator = new JoiValidator(addVideoToPlaylistJoiSchema);
  const addVideoToPlaylistUsecaseFactory = new AddVideoToPlaylistUsecaseFactory(
    {
      factory: { validator },
      usecase: { idGenerator, videoRepository, playlistRepository }
    }
  );

  describe('Validar input', () => {
    let input: any = {
      id_authenticated_channel: '63102cbb-ef58-459d-b583-4fe4a7ad3335',
      id_playlist: '63102cbb-ef58-459d-b583-4fe4a7ad3335',
      id_referenced_video: '63102cbb-ef58-459d-b583-4fe4a7ad3335'
    };

    test('Deve passar nos testes', async () => {
      addVideoToPlaylistUsecaseFactory.create(input);
    });

    test('Não deve passar nos testes', async () => {
      input = {
        id_playlist: '',
        id_referenced_video: ''
      };

      const expectedError = [
        { field: 'id_authenticated_channel', message: messages.required },
        { field: 'id_referenced_video', message: messages.empty },
        { field: 'id_playlist', message: messages.empty }
      ];

      try {
        addVideoToPlaylistUsecaseFactory.create(input);
      } catch (error) {
        if (error instanceof FieldsValidationError) {
          expect(error.fields).toEqual(expectedError);
        }
      }
    });
  });
});
