import faker from '@faker-js/faker';
import { randomUUID } from 'crypto';
import {
  PlaylistAttributes,
  PlaylistVisibility
} from '../../../domain/entities/Playlist';
import { PlaylistFactory } from '../../../domain/factories/entities/PlaylistFactory';
import { ShortPlaylist } from '../../../domain/repositories/PlaylistRepositoryInterface';
import { AddPlaylistToLibraryUsecase } from '../../../domain/usecases/AddPlaylistToLibraryUsecase';
import { ImpossibleActionError } from '../../../errors/ImpossibleActionError';
import { NotFoundError } from '../../../errors/NotFoundError';
import { CryptoIDGenerator } from '../../../infra/libs/CryptoIDGenerator';
import { PlaylistRepositoryMemory } from '../../../infra/repositories/memory/PlaylistRepositoryMemory';
import { MemoryDatabase } from '../../MemoryDatabase';

describe('AddPlaylistToLibraryUsecase', () => {
  const memoryDatabase = new MemoryDatabase();
  const idGenerator = new CryptoIDGenerator();
  const playlistFactory = new PlaylistFactory({
    idGenerator
  });
  const playlistRepository = new PlaylistRepositoryMemory(
    memoryDatabase,
    playlistFactory
  );

  const createAddPlaylistToLibraryUsecase = (): AddPlaylistToLibraryUsecase => {
    return new AddPlaylistToLibraryUsecase({
      playlistRepository
    });
  };

  const createFakePlaylist = (): PlaylistAttributes => {
    return {
      id: randomUUID(),
      id_channel: randomUUID(),
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: 0,
      visibility: PlaylistVisibility.PUBLIC
    };
  };

  describe('Adicionar playlist na library', () => {
    beforeEach(() => {
      memoryDatabase.clear();
    });

    test('Não deve ser buscado as playlists da library de outros channels.', async () => {
      //channel 1 tem as playlists 1 2
      //channel 2 tem as playlists 2 3
      //channel 3 tem as playlists 2
      const playlist1 = createFakePlaylist();
      await playlistRepository.create(playlist1);

      const playlist2 = createFakePlaylist();
      await playlistRepository.create(playlist2);

      const playlist3 = createFakePlaylist();
      await playlistRepository.create(playlist3);

      const channel1 = '001',
        channel2 = '002',
        channel3 = '003';

      const input1 = {
        id_authenticated_channel: channel1,
        id_playlist: playlist1.id
      };
      const input2 = {
        id_authenticated_channel: channel1,
        id_playlist: playlist2.id
      };
      const input3 = {
        id_authenticated_channel: channel2,
        id_playlist: playlist2.id
      };
      const input4 = {
        id_authenticated_channel: channel2,
        id_playlist: playlist3.id
      };
      const input5 = {
        id_authenticated_channel: channel3,
        id_playlist: playlist2.id
      };

      const addPlaylistToLibraryUsecase = createAddPlaylistToLibraryUsecase();
      await addPlaylistToLibraryUsecase.execute(input1);
      await addPlaylistToLibraryUsecase.execute(input2);
      await addPlaylistToLibraryUsecase.execute(input3);
      await addPlaylistToLibraryUsecase.execute(input4);
      await addPlaylistToLibraryUsecase.execute(input5);

      const library = await playlistRepository.findLibrary(channel3);
      expect(library).toEqual<ShortPlaylist[]>([
        {
          id: playlist2.id,
          title: playlist2.title,
          visibility: playlist2.visibility
        }
      ]);
    });

    test('Deve ser adicionada duas playlists na library.', async () => {
      const playlist1 = createFakePlaylist();
      playlist1.id_channel = '003';
      const playlist2 = createFakePlaylist();
      playlist2.id_channel = '003';

      await playlistRepository.create(playlist1);
      await playlistRepository.create(playlist2);

      const input1 = {
        id_authenticated_channel: '001',
        id_playlist: playlist1.id
      };
      const input2 = {
        id_authenticated_channel: '001',
        id_playlist: playlist2.id
      };

      const addPlaylistToLibraryUsecase = createAddPlaylistToLibraryUsecase();

      await addPlaylistToLibraryUsecase.execute(input1);
      await addPlaylistToLibraryUsecase.execute(input2);

      const library = await playlistRepository.findLibrary(
        input1.id_authenticated_channel
      );

      expect(library).toEqual<ShortPlaylist[]>([
        {
          title: playlist1.title,
          visibility: playlist1.visibility,
          id: playlist1.id
        },
        {
          title: playlist2.title,
          visibility: playlist2.visibility,
          id: playlist2.id
        }
      ]);
    });

    test('Deve lançar erro ao adicionar playlist inexistente na library.', async () => {
      const input = {
        id_authenticated_channel: '001',
        id_playlist: '001'
      };

      const addPlaylistToLibraryUsecase = createAddPlaylistToLibraryUsecase();

      const execute = async () =>
        await addPlaylistToLibraryUsecase.execute(input);

      await expect(execute).rejects.toThrow(new NotFoundError('Playlist'));
    });

    test('Deve lançar erro ao adicionar playlist que já está na library.', async () => {
      const playlist = createFakePlaylist();

      await playlistRepository.create(playlist);

      const input = {
        id_authenticated_channel: '001',
        id_playlist: playlist.id
      };

      const addPlaylistToLibraryUsecase = createAddPlaylistToLibraryUsecase();

      await addPlaylistToLibraryUsecase.execute(input);

      const execute = async () =>
        await addPlaylistToLibraryUsecase.execute(input);

      await expect(execute).rejects.toThrow(
        new ImpossibleActionError('A playlist já está na library.')
      );
    });

    test('Deve lançar erro ao adicionar a própria playlist na própria library.', async () => {
      const playlist = createFakePlaylist();

      await playlistRepository.create(playlist);

      const input = {
        id_authenticated_channel: playlist.id_channel,
        id_playlist: playlist.id
      };

      const addPlaylistToLibraryUsecase = createAddPlaylistToLibraryUsecase();

      const execute = async () =>
        await addPlaylistToLibraryUsecase.execute(input);

      await expect(execute).rejects.toThrow(
        new ImpossibleActionError(
          'Não pode adicionar a própria playlist na própria library, ela já foi adicionada.'
        )
      );
    });

    test('Deve lançar erro ao adicionar playlist paga na library.', async () => {
      const playlist = createFakePlaylist();
      playlist.price = 25;

      await playlistRepository.create(playlist);

      const input = {
        id_authenticated_channel: '001',
        id_playlist: playlist.id
      };

      const addPlaylistToLibraryUsecase = createAddPlaylistToLibraryUsecase();

      const execute = async () =>
        await addPlaylistToLibraryUsecase.execute(input);

      await expect(execute).rejects.toThrow(
        new ImpossibleActionError(
          'Não pode adicionar playlist paga de terceiro na própria library.'
        )
      );
    });

    test('Deve lançar erro ao adicionar playlist privada na library.', async () => {
      const playlist = createFakePlaylist();
      playlist.visibility = PlaylistVisibility.PRIVATE;

      await playlistRepository.create(playlist);

      const input = {
        id_authenticated_channel: '001',
        id_playlist: playlist.id
      };

      const addPlaylistToLibraryUsecase = createAddPlaylistToLibraryUsecase();

      const execute = async () =>
        await addPlaylistToLibraryUsecase.execute(input);

      await expect(execute).rejects.toThrow(
        new ImpossibleActionError(
          'Não pode adicionar playlist private de terceiro na própria library.'
        )
      );
    });
  });
});
