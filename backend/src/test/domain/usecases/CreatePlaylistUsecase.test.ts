import { ChannelAttributes, Channel } from '../../../domain/entities/Channel';
import {
  PlaylistAttributes,
  PlaylistVisibility
} from '../../../domain/entities/Playlist';
import { PlaylistFactory } from '../../../domain/factories/PlaylistFactory';
import {
  CreatePlaylistUsecase,
  CreatePlaylistInput
} from '../../../domain/usecases/CreatePlaylistUsecase';
import { NotFoundError } from '../../../errors/NotFoundError';
import { CryptoIDGenerator } from '../../../infra/libs/CryptoIDGenerator';
import { channelJoiSchema } from '../../../infra/libs/joi/ChannelJoiSchema';
import { JoiValidator } from '../../../infra/libs/joi/JoiValidator';
import { playlistJoiSchema } from '../../../infra/libs/joi/PlaylistJoiSchema';
import { ChannelRepositoryMemory } from '../../../infra/repositories/memory/ChannelRepositoryMemory';
import { PlaylistRepositoryMemory } from '../../../infra/repositories/memory/PlaylistRepositoryMemory';
import { MemoryDatabase } from '../../MemoryDatabase';

describe('CreatePlaylistUsecase', () => {
  const memoryDatabase = new MemoryDatabase();
  const playlistRepository = new PlaylistRepositoryMemory(memoryDatabase);
  const channelRepository = new ChannelRepositoryMemory(memoryDatabase);
  const channelValidator = new JoiValidator(channelJoiSchema);
  const idGenerator = new CryptoIDGenerator();
  const validator = new JoiValidator(playlistJoiSchema);
  const playlistFactory = new PlaylistFactory({ idGenerator, validator });

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
      const channelEntity = new Channel(channel, {
        idGenerator,
        validator: channelValidator
      });

      await channelRepository.create(channelEntity.getAttributes());

      const createPlaylist = createPlaylistUsecase();

      const input: CreatePlaylistInput = {
        ...playlist,
        id_authenticated_channel: playlist.id_channel
      };
      await createPlaylist.execute(input);

      const playlists = await playlistRepository.findAll();

      expect(playlists).toHaveLength(1);
      expect(playlists[0]).toEqual(expect.objectContaining({ ...playlist }));
    });

    test('Deve lançar erro ao criar playlist com channel inexistente.', async () => {
      const input: CreatePlaylistInput = {
        ...playlist,
        id_authenticated_channel: '63102cbb-ef58-459d-b583-4fe4a7ad3335'
      };

      const createPlaylist = createPlaylistUsecase();

      const execute = async () => await createPlaylist.execute(input);

      await expect(execute).rejects.toThrowError(NotFoundError);
    });
  });
});
