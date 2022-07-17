import { describe, expect, test } from '@jest/globals';
import { Channel, ChannelAttributes } from '../domain/entities/Channel';
import {
  PlaylistAttributes,
  PlaylistType,
  PlaylistVisibility
} from '../domain/entities/Playlist';
import { VideoAttributes, VideoVisibility } from '../domain/entities/Video';
import { VideoInPlaylist } from '../domain/entities/VideoInPlaylist';
import { PlaylistFactory } from '../domain/factories/PlaylistFactory';
import { VideoInPlaylistFactory } from '../domain/factories/VideoInPlaylistFactory';
import { PlaylistRepository } from '../domain/repositories/PlaylistRepository';
import { VideoRepository } from '../domain/repositories/VideoRepository';
import {
  AddVideoInPlaylistInput,
  AddVideoToPlaylist
} from '../domain/usecases/AddVideoToPlaylist';
import {
  CreatePlaylist,
  CreatePlaylistInput
} from '../domain/usecases/CreatePlaylist';
import { FieldsValidationError } from '../errors/FieldsValidationError';
import { NotFoundError } from '../errors/NotFoundError';
import { CryptoIDGenerator } from '../infra/libs/CryptoIDGenerator';
import { channelJoiSchema } from '../infra/libs/joi/ChannelJoiSchema';
import { JoiValidator } from '../infra/libs/joi/JoiValidator';
import { playlistJoiSchema } from '../infra/libs/joi/PlaylistJoiSchema';
import { videoInPlaylistJoiSchema } from '../infra/libs/joi/VideoInPlaylistJoiSchema';
import { ChannelRepositoryMemory } from '../infra/repositories/memory/ChannelRepositoryMemory';
import { PlaylistRepositoryMemory } from '../infra/repositories/memory/PlaylistRepositoryMemory';
import { VideoRepositoryMemory } from '../infra/repositories/memory/VideoRepositoryMemory';
import { MemoryDatabase } from './MemoryDatabase';

describe('Usecase Playlist', () => {
  const memoryDatabase = new MemoryDatabase();
  const playlistRepository = new PlaylistRepositoryMemory(memoryDatabase);
  const channelRepository = new ChannelRepositoryMemory(memoryDatabase);
  const videoRepository = new VideoRepositoryMemory(memoryDatabase);
  const idGenerator = new CryptoIDGenerator();
  const playlistValidator = new JoiValidator(playlistJoiSchema);
  const channelValidator = new JoiValidator(channelJoiSchema);
  const videoInPlaylistValidator = new JoiValidator(videoInPlaylistJoiSchema);
  const videoInPlaylistFactory = new VideoInPlaylistFactory();
  const playlistFactory = new PlaylistFactory();

  describe('POST /playlist', () => {
    let channel: ChannelAttributes;
    let playlist: PlaylistAttributes;

    beforeEach(() => {
      memoryDatabase.channels = [];
      memoryDatabase.playlists = [];

      channel = {
        id: '63102cbb-ef58-459d-b583-4fe4a7ad3335',
        email: 'teste@gmail.com',
        password: 'teste'
      };

      playlist = {
        id_channel: channel.id,
        title: 'Curso de Fullcycle Development',
        type: PlaylistType.BUYABLE,
        visibility: PlaylistVisibility.PUBLIC,
        description:
          'Curso que aborda arquitetura de software, backend, frontend e devops'
      };
    });

    test('Deve ser criada a playlist.', async () => {
      const channelEntity = new Channel(channel, {
        idGenerator,
        validator: channelValidator
      });

      await channelRepository.create(channelEntity.getAttributes());

      const createPlaylist = new CreatePlaylist({
        playlistFactory,
        playlistRepository,
        channelRepository,
        playlistValidator,
        idGenerator
      });

      const input: CreatePlaylistInput = {
        ...playlist,
        id_authenticated_channel: playlist.id_channel
      };
      await createPlaylist.execute(input);

      const playlists = await playlistRepository.findAll();

      expect(playlists).toHaveLength(1);
      expect(playlists[0]).toEqual(expect.objectContaining({ ...playlist }));
    });

    test('Deve lençar erro ao criar playlist com channel inexistente.', async () => {
      const input: CreatePlaylistInput = {
        ...playlist,
        id_authenticated_channel: '63102cbb-ef58-459d-b583-4fe4a7ad3335'
      };

      const createPlaylist = new CreatePlaylist({
        playlistFactory,
        playlistRepository,
        channelRepository,
        playlistValidator,
        idGenerator
      });
      const execute = async () => await createPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(NotFoundError);
    });
  });

  describe('POST /playlist/video', () => {
    describe('Validations', () => {
      test('Error campo "id_reference_video" e "id_playlist"', async () => {
        const input: AddVideoInPlaylistInput = {
          id_referenced_video: '$',
          id_authenticated_channel: '002',
          id_playlist: ''
        };

        const addVideoInPlaylist = new AddVideoToPlaylist({
          videoInPlaylistFactory,
          playlistRepository,
          videoRepository,
          idGenerator,
          videoInPlaylistValidator
        });

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
    let input: AddVideoInPlaylistInput;

    beforeEach(() => {
      memoryDatabase.playlists = [];
      memoryDatabase.videos = [];
      memoryDatabase.videoInPlaylist = [];

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
        type: PlaylistType.REGULAR,
        visibility: PlaylistVisibility.PUBLIC,
        description: 'Descrição da playlist.'
      };

      input = {
        id_referenced_video: video.id,
        id_authenticated_channel: '001',
        id_playlist: playlist.id
      };
    });

    test('Deve ser adicionado um vídeo de terceiro na playlist', async () => {
      video.id_channel = '002';
      input.id_authenticated_channel = '001';

      await playlistRepository.create(playlist);
      await videoRepository.create(video);

      const addVideoInPlaylist = new AddVideoToPlaylist({
        videoInPlaylistFactory,
        playlistRepository,
        videoRepository,
        idGenerator,
        videoInPlaylistValidator
      });
      await addVideoInPlaylist.execute(input);

      const playlistVideos = await playlistRepository.findAllVideos(
        playlist.id
      );

      const expectedArray = [
        { id: '001', title: 'Video Test 1', thumbnail: 'thumb.png' }
      ];

      expect(playlistVideos).toEqual(expectedArray);
    });

    test('Deve ser adicionado dois vídeos proprios na playlist', async () => {
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

      const input1: AddVideoInPlaylistInput = {
        id_referenced_video: video1.id,
        id_authenticated_channel: channel.id,
        id_playlist: playlist.id
      };
      const input2: AddVideoInPlaylistInput = {
        id_referenced_video: video2.id,
        id_authenticated_channel: channel.id,
        id_playlist: playlist.id
      };

      await playlistRepository.create(playlist);
      await videoRepository.create(video1);
      await videoRepository.create(video2);

      const addVideoInPlaylist = new AddVideoToPlaylist({
        videoInPlaylistFactory,
        playlistRepository,
        videoRepository,
        idGenerator,
        videoInPlaylistValidator
      });
      await addVideoInPlaylist.execute(input1);
      await addVideoInPlaylist.execute(input2);

      const playlistVideos = await playlistRepository.findAllVideos(
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
      const videoInPlaylistMock = VideoInPlaylist.create({
        id_playlist: input.id_playlist,
        id_referenced_video: input.id_referenced_video
      });
      const mockVideoInPlaylistFactory: VideoInPlaylistFactory = {
        create: (attributes, dependencies) => videoInPlaylistMock
      };

      const addVideoInPlaylist = new AddVideoToPlaylist({
        videoInPlaylistFactory: mockVideoInPlaylistFactory,
        playlistRepository,
        videoRepository,
        idGenerator,
        videoInPlaylistValidator
      });

      const execute = async () => await addVideoInPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(
        'Playlist not found, with id: 003'
      );
    });

    test('Deve lançar erro ao buscar video inexistente.', async () => {
      const videoInPlaylistMock = VideoInPlaylist.create({
        id_playlist: input.id_playlist,
        id_referenced_video: input.id_referenced_video
      });
      const mockVideoInPlaylistFactory: VideoInPlaylistFactory = {
        create: (attributes, dependencies) => videoInPlaylistMock
      };

      const mockReturnPlaylist: PlaylistAttributes = {
        id_channel: '0',
        title: 'a',
        id: '003'
      };

      const mockPlaylistRepository: PlaylistRepository = {
        findById: async (id) => mockReturnPlaylist,
        addVideo: async () => undefined,
        create: async () => undefined,
        findAll: async () => undefined,
        findAllVideos: async () => undefined
      };
      const mockVideoRepository: VideoRepository = {
        findById: async (id) => undefined,
        create: async () => undefined,
        findAll: async () => undefined
      };

      const addVideoInPlaylist = new AddVideoToPlaylist({
        videoInPlaylistFactory: mockVideoInPlaylistFactory,
        playlistRepository: mockPlaylistRepository,
        videoRepository: mockVideoRepository,
        idGenerator,
        videoInPlaylistValidator
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

      const addVideoInPlaylist = new AddVideoToPlaylist({
        videoInPlaylistFactory,
        playlistRepository,
        videoRepository,
        idGenerator,
        videoInPlaylistValidator
      });
      const execute = async () => await addVideoInPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(
        'Channel can only add video to own playlist.'
      );
    });

    test('Deve lançar erro ao adicionar video de terceiro na propria playlist com tipo "buyable".', async () => {
      playlist.type = PlaylistType.BUYABLE;
      video.id_channel = '002';
      input.id_authenticated_channel = '001';

      await playlistRepository.create(playlist);
      await videoRepository.create(video);

      const addVideoInPlaylist = new AddVideoToPlaylist({
        videoInPlaylistFactory,
        playlistRepository,
        videoRepository,
        idGenerator,
        videoInPlaylistValidator
      });
      const execute = async () => await addVideoInPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(
        "Can't add a third-party video to your own buyable playlist."
      );
    });

    test('Deve lançar erro ao adicionar video de terceiro com visibilidade "private" na propria playlist com tipo "regular".', async () => {
      video.visibility = VideoVisibility.PRIVATE;
      video.id_channel = '002';
      playlist.type = PlaylistType.REGULAR;
      playlist.id_channel = '001';
      input.id_authenticated_channel = '001';

      await playlistRepository.create(playlist);
      await videoRepository.create(video);

      const addVideoInPlaylist = new AddVideoToPlaylist({
        videoInPlaylistFactory,
        playlistRepository,
        videoRepository,
        idGenerator,
        videoInPlaylistValidator
      });
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
      playlist.type = PlaylistType.REGULAR;
      input.id_authenticated_channel = '001';

      await playlistRepository.create(playlist);
      await videoRepository.create(video);

      const addVideoInPlaylist = new AddVideoToPlaylist({
        videoInPlaylistFactory,
        playlistRepository,
        videoRepository,
        idGenerator,
        videoInPlaylistValidator
      });
      const execute = async () => await addVideoInPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(
        "Can't add a third-party buyable video to your own playlist."
      );
    });
  });
});
