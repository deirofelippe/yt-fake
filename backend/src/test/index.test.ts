import { test, expect, describe } from '@jest/globals';
import { randomUUID } from 'crypto';
import { CreatePlaylist } from '../domain/usecases/CreatePlaylist';
import { ChannelRepositoryMemory } from '../infra/repositories/ChannelRepositoryMemory';
import { PlaylistRepositoryMemory } from '../infra/repositories/PlaylistRepositoryMemory';
import { MemoryDatabase } from './MemoryDatabase';

describe('POST /channel/:id/playlist', () => {
  test('Deve ser criada a playlist', async () => {
    const channel = {
      id: '63102cbb-ef58-459d-b583-4fe4a7ad3335'
    };

    const playlist = {
      title: 'Curso de Fullcycle Development',
      type: 'BUYABLE',
      visibility: 'PUBLIC',
      description:
        'Curso que aborda arquitetura de software, backend, frontend e devops'
    };

    const memoryDatabase = new MemoryDatabase();
    const playlistRepository = new PlaylistRepositoryMemory(memoryDatabase);
    const channelRepository = new ChannelRepositoryMemory(memoryDatabase);

    await channelRepository.create(channel);

    const oldPlaylists = await playlistRepository.findAll();

    expect(oldPlaylists).toHaveLength(0);

    const createPlaylist = new CreatePlaylist(
      playlistRepository,
      channelRepository
    );
    await createPlaylist.execute(playlist, channel);

    const playlists = await playlistRepository.findAll();
    expect(playlists).toHaveLength(1);
  });

  test.skip('Deve ser criada a playlist do tipo pago', async () => {});
  test.skip('Deve ser adicionado modulos na playlist', async () => {});
  test.skip('Deve ser adicionado videos aos modulos da playlist', async () => {});
});
