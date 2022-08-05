import { AddVideoToPlaylistUsecaseFactory } from '../../../../domain/factories/usecases/AddVideoToPlaylistUsecaseFactory';
import { IDGenerator } from '../../../../domain/libs/IDGenerator';
import { PlaylistRepositoryInterface } from '../../../../domain/repositories/PlaylistRepositoryInterface';
import { VideoRepositoryInterface } from '../../../../domain/repositories/VideoRepositoryInterface';
import { FieldsValidationError } from '../../../../errors/FieldsValidationError';
import { addVideoToPlaylistJoiSchema } from '../../../../infra/libs/joi/AddVideoToPlaylistJoiSchema';
import { JoiValidator } from '../../../../infra/libs/joi/JoiValidator';

describe('AddVideoToPlaylistUsecaseFactory', () => {
  const mockIdGenerator = {} as IDGenerator;
  const mockPlaylistRepository = {} as PlaylistRepositoryInterface;
  const mockVideoRepository = {} as VideoRepositoryInterface;
  const validator = new JoiValidator(addVideoToPlaylistJoiSchema);
  const addVideoToPlaylistUsecaseFactory = new AddVideoToPlaylistUsecaseFactory(
    {
      factory: { validator },
      usecase: {
        idGenerator: mockIdGenerator,
        videoRepository: mockVideoRepository,
        playlistRepository: mockPlaylistRepository
      }
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
        { field: 'id_authenticated_channel', message: 'É obrigatório.' },
        { field: 'id_referenced_video', message: 'Deve ser preenchido.' },
        { field: 'id_playlist', message: 'Deve ser preenchido.' }
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
