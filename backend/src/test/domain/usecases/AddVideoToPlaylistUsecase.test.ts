import {
  PlaylistAttributes,
  PlaylistVisibility
} from '../../../domain/entities/Playlist';
import {
  VideoAttributes,
  VideoVisibility
} from '../../../domain/entities/Video';
import { PlaylistFactory } from '../../../domain/factories/PlaylistFactory';
import { VideoFactory } from '../../../domain/factories/VideoFactory';
import {
  AddVideoToPlaylistUsecase,
  AddVideoToPlaylistUsecaseInput
} from '../../../domain/usecases/AddVideoToPlaylistUsecase';
import { FieldsValidationError } from '../../../errors/FieldsValidationError';
import { CryptoIDGenerator } from '../../../infra/libs/CryptoIDGenerator';
import { PlaylistRepositoryMemory } from '../../../infra/repositories/memory/PlaylistRepositoryMemory';
import { VideoRepositoryMemory } from '../../../infra/repositories/memory/VideoRepositoryMemory';
import { MemoryDatabase } from '../../MemoryDatabase';

describe('AddVideoToPlaylistUsecase', () => {
  const memoryDatabase = new MemoryDatabase();
  const idGenerator = new CryptoIDGenerator();
  const videoFactory = new VideoFactory({
    idGenerator
  });
  const playlistFactory = new PlaylistFactory({
    idGenerator
  });
  const videoRepository = new VideoRepositoryMemory(
    memoryDatabase,
    videoFactory
  );
  const playlistRepository = new PlaylistRepositoryMemory(
    memoryDatabase,
    playlistFactory
  );

  const createAddVideoToPlaylistUsecase = (): AddVideoToPlaylistUsecase => {
    return new AddVideoToPlaylistUsecase({
      idGenerator,
      playlistRepository,
      videoRepository
    });
  };

  describe('Adicionar video na playlist', () => {
    describe('Validations', () => {
      test('Error campo "id_reference_video" e "id_playlist"', async () => {
        const input: AddVideoToPlaylistUsecaseInput = {
          id_referenced_video: '$',
          id_authenticated_channel: '002',
          id_playlist: ''
        };

        const addVideoInPlaylist = createAddVideoToPlaylistUsecase();

        const expectedError = [
          {
            field: 'id_referenced_video',
            message:
              'Não deve ter caracteres especiais, somente letras e números'
          },
          { field: 'id_referenced_video', message: 'Deve ter 3 caracteres' },
          { field: 'id_playlist', message: 'Campo deve ser preenchido' }
        ];

        try {
          await addVideoInPlaylist.execute(input);
        } catch (error) {
          if (error instanceof FieldsValidationError) {
            expect(error.fields).toEqual(expectedError);
          }
        }
      });
    });

    let video: VideoAttributes;
    let playlist: PlaylistAttributes;
    let input: AddVideoToPlaylistUsecaseInput;

    beforeEach(() => {
      memoryDatabase.clear();

      video = {
        id: '001',
        id_channel: '002',
        title: 'Video Test 1',
        video: 'video-test-1.mp4',
        visibility: VideoVisibility.PUBLIC,
        description: 'Descrição longa do vídeo.',
        price: 0,
        thumbnail: 'thumb.png',
        dislikes: 0,
        likes: 0,
        views: 0
      };

      playlist = {
        id: '001',
        id_channel: '001',
        title: 'Curso de Fullcycle Development',
        price: 0,
        visibility: PlaylistVisibility.PUBLIC,
        description: 'Descrição da playlist.'
      };

      input = {
        id_referenced_video: video.id,
        id_authenticated_channel: '001',
        id_playlist: playlist.id
      };
    });

    test('Deve ser adicionado um video de terceiro na playlist', async () => {
      video.id_channel = '002';
      input.id_authenticated_channel = '001';

      await playlistRepository.create(playlist);
      await videoRepository.create(video);

      const addVideoInPlaylist = createAddVideoToPlaylistUsecase();
      await addVideoInPlaylist.execute(input);

      const playlistVideos = await videoRepository.findAllVideosByPlaylist(
        playlist.id
      );

      const expectedArray = [
        { id: '001', title: 'Video Test 1', thumbnail: 'thumb.png' }
      ];

      expect(playlistVideos).toEqual(expectedArray);
    });

    test('Deve ser adicionado dois videos proprios na playlist', async () => {
      const channel = {
        id: '000'
      };

      const video1: VideoAttributes = {
        id: '001',
        id_channel: channel.id,
        title: 'Video Test 1',
        video: 'video-test-1.mp4'
      };
      const video2: VideoAttributes = {
        id: '002',
        id_channel: channel.id,
        title: 'Video Test 2',
        video: 'video-test-2.mp4',
        thumbnail: 'video.png'
      };

      const playlist: PlaylistAttributes = {
        id: '002',
        id_channel: channel.id,
        title: 'Curso de Fullcycle Development'
      };

      const input1: AddVideoToPlaylistUsecaseInput = {
        id_referenced_video: video1.id,
        id_authenticated_channel: channel.id,
        id_playlist: playlist.id
      };
      const input2: AddVideoToPlaylistUsecaseInput = {
        id_referenced_video: video2.id,
        id_authenticated_channel: channel.id,
        id_playlist: playlist.id
      };

      await playlistRepository.create(playlist);
      await videoRepository.create(video1);
      await videoRepository.create(video2);

      const addVideoInPlaylist = createAddVideoToPlaylistUsecase();

      await addVideoInPlaylist.execute(input1);
      await addVideoInPlaylist.execute(input2);

      const playlistVideos = await videoRepository.findAllVideosByPlaylist(
        playlist.id
      );

      const expectedArray = [
        { id: '001', title: 'Video Test 1', thumbnail: undefined },
        { id: '002', title: 'Video Test 2', thumbnail: 'video.png' }
      ];

      expect(playlistVideos).toHaveLength(2);
      expect(playlistVideos).toEqual(expectedArray);
    });

    test('Deve lançar erro ao buscar playlist inexistente.', async () => {
      input.id_playlist = '003';

      const addVideoInPlaylist = new AddVideoToPlaylistUsecase({
        idGenerator,
        playlistRepository,
        videoRepository
      });

      const execute = async () => await addVideoInPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(
        'Playlist not found, with id: 003'
      );
    });

    test('Deve lançar erro ao buscar video inexistente.', async () => {
      const mockReturnPlaylist: PlaylistAttributes = {
        id_channel: '0',
        title: 'a',
        id: '003'
      };

      const mockPlaylistRepository = new PlaylistRepositoryMemory(
        memoryDatabase,
        playlistFactory
      );
      mockPlaylistRepository.findById = async (id) =>
        playlistFactory.recreate(mockReturnPlaylist);

      const mockVideoRepository = new VideoRepositoryMemory(
        memoryDatabase,
        videoFactory
      );
      mockVideoRepository.findById = async (id) => undefined;

      const addVideoInPlaylist = new AddVideoToPlaylistUsecase({
        playlistRepository: mockPlaylistRepository,
        idGenerator,
        videoRepository: mockVideoRepository
      });

      const execute = async () => await addVideoInPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(
        'Video not found, with id: 001'
      );
    });

    test('Deve lançar erro ao adicionar video em playlist de outro channel.', async () => {
      playlist.id_channel = '002';
      input.id_authenticated_channel = '001';

      await playlistRepository.create(playlist);
      await videoRepository.create(video);

      const addVideoInPlaylist = createAddVideoToPlaylistUsecase();
      const execute = async () => await addVideoInPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(
        'Channel can only add video to own playlist.'
      );
    });

    test('Deve lançar erro ao adicionar video de terceiro na propria playlist com tipo "buyable".', async () => {
      playlist.price = 12;
      video.id_channel = '002';
      input.id_authenticated_channel = '001';

      await playlistRepository.create(playlist);
      await videoRepository.create(video);

      const addVideoInPlaylist = createAddVideoToPlaylistUsecase();
      const execute = async () => await addVideoInPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(
        "Can't add a third-party video to your own buyable playlist."
      );
    });

    test('Deve lançar erro ao adicionar video de terceiro com visibilidade "private" na propria playlist com tipo "regular".', async () => {
      video.visibility = VideoVisibility.PRIVATE;
      video.id_channel = '002';
      playlist.price = 0;
      playlist.id_channel = '001';
      input.id_authenticated_channel = '001';

      await playlistRepository.create(playlist);
      await videoRepository.create(video);

      const addVideoInPlaylist = createAddVideoToPlaylistUsecase();
      const execute = async () => await addVideoInPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(
        "Can't add a third-party private video to your own playlist."
      );
    });

    test('Deve lançar erro ao adicionar video compravel de terceiro na propria playlist com tipo "regular".', async () => {
      video.price = 1;
      video.visibility = VideoVisibility.PUBLIC;
      video.id_channel = '002';
      playlist.id_channel = '001';
      playlist.price = 0;
      input.id_authenticated_channel = '001';

      await playlistRepository.create(playlist);
      await videoRepository.create(video);

      const addVideoInPlaylist = createAddVideoToPlaylistUsecase();
      const execute = async () => await addVideoInPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(
        "Can't add a third-party buyable video to your own playlist."
      );
    });
  });
});
