import { ChannelAttributes } from '../../../domain/entities/Channel';
import {
  PlaylistAttributes,
  PlaylistVisibility
} from '../../../domain/entities/Playlist';
import { ChannelFactory } from '../../../domain/factories/entities/ChannelFactory';
import { PlaylistFactory } from '../../../domain/factories/entities/PlaylistFactory';
import {
  CreatePlaylistUsecase,
  CreatePlaylistUsecaseInput
} from '../../../domain/usecases/CreatePlaylistUsecase';
import { NotFoundError } from '../../../errors/NotFoundError';
import { CryptoIDGenerator } from '../../../infra/libs/CryptoIDGenerator';
import { ChannelRepositoryMemory } from '../../../infra/repositories/memory/ChannelRepositoryMemory';
import { PlaylistRepositoryMemory } from '../../../infra/repositories/memory/PlaylistRepositoryMemory';
import { MemoryDatabase } from '../../MemoryDatabase';

describe('CreatePlaylistUsecase', () => {
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

  const createPlaylistUsecase = (): CreatePlaylistUsecase => {
    return new CreatePlaylistUsecase({
      playlistFactory,
      playlistRepository,
      channelRepository
    });
  };

  describe('Criar playlist', () => {
    let channel: ChannelAttributes;
    let playlist: PlaylistAttributes;

    beforeEach(() => {
      memoryDatabase.clear();

      channel = {
        id: '63102cbb-ef58-459d-b583-4fe4a7ad3335',
        email: 'teste@gmail.com',
        password: 'teste'
      };

      playlist = {
        id_channel: channel.id,
        title: 'Curso de Fullcycle Development',
        price: 12,
        visibility: PlaylistVisibility.PUBLIC,
        description:
          'Curso que aborda arquitetura de software, backend, frontend e devops'
      };
    });

    test('Deve ser criada a playlist.', async () => {
      await channelRepository.create(channel);

      const createPlaylist = createPlaylistUsecase();

      const input: CreatePlaylistUsecaseInput = {
        ...playlist,
        id_authenticated_channel: playlist.id_channel
      };
      await createPlaylist.execute(input);

      const playlists = await playlistRepository.findAll();

      expect(playlists).toHaveLength(1);
      expect(playlists[0].getAttributes()).toEqual(
        expect.objectContaining({ ...playlist })
      );
    });

    test('Deve lançar erro ao criar playlist com channel inexistente.', async () => {
      const input: CreatePlaylistUsecaseInput = {
        ...playlist,
        id_authenticated_channel: '63102cbb-ef58-459d-b583-4fe4a7ad3335'
      };

      const createPlaylist = createPlaylistUsecase();

      const execute = async () => await createPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(NotFoundError);
    });
  });
});
