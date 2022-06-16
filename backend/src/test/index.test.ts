import { test, expect, describe } from '@jest/globals';
import { Channel, ChannelAttributes } from '../domain/entities/Channel';
import {
  PlaylistAttributes,
  PlaylistType,
  PlaylistVisibility
} from '../domain/entities/Playlist';
import { CreatePlaylist } from '../domain/usecases/CreatePlaylist';
import { ChannelNotFoundError } from '../errors/ChannelNotFoundError';
import { CryptoIDGenerator } from '../infra/libs/CryptoIDGenerator';
import { channelJoiSchema } from '../infra/libs/joi/ChannelJoiSchema';
import { JoiValidator } from '../infra/libs/joi/JoiValidator';
import { playlistJoiSchema } from '../infra/libs/joi/PlaylistJoiSchema';
import { ChannelRepositoryMemory } from '../infra/repositories/memory/ChannelRepositoryMemory';
import { PlaylistRepositoryMemory } from '../infra/repositories/memory/PlaylistRepositoryMemory';
import { MemoryDatabase } from './MemoryDatabase';

describe('Usecase Playlist', () => {
  describe('POST /playlist', () => {
    let channel: ChannelAttributes;
    let playlist: PlaylistAttributes;
    const memoryDatabase = new MemoryDatabase();
    const playlistRepository = new PlaylistRepositoryMemory(memoryDatabase);
    const channelRepository = new ChannelRepositoryMemory(memoryDatabase);
    const idGenerator = new CryptoIDGenerator();
    const playlistValidator = new JoiValidator(playlistJoiSchema);
    const channelValidator = new JoiValidator(channelJoiSchema);

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

    test('Deve ser criada a playlist', async () => {
      const channelEntity = new Channel(channel, {
        idGenerator,
        validator: channelValidator
      });

      await channelRepository.create(channelEntity);

      const oldPlaylists = await playlistRepository.findAll();

      expect(oldPlaylists).toHaveLength(0);

      const createPlaylist = new CreatePlaylist({
        playlistRepository,
        channelRepository,
        playlistValidator,
        idGenerator
      });
      await createPlaylist.execute(playlist);

      const playlists = await playlistRepository.findAll();

      expect(playlists[0]).toEqual(expect.objectContaining({ ...playlist }));
    });

    test('Deve retornar erro ao criada a Playlist com Channel inexistente', async () => {
      playlist.id_channel = '001';

      const createPlaylist = new CreatePlaylist({
        playlistRepository,
        channelRepository,
        playlistValidator,
        idGenerator
      });
      const execute = async () => await createPlaylist.execute(playlist);

      await expect(execute).rejects.toThrowError(ChannelNotFoundError);
    });

    test.skip('Deve ser adicionado modulos na playlist', async () => {});
    test.skip('Deve ser adicionado videos aos modulos da playlist', async () => {});
  });
});
