import faker from '@faker-js/faker';
import {
  PlaylistAttributes,
  PlaylistVisibility
} from '../../../domain/entities/Playlist';
import { PlaylistFactory } from '../../../domain/factories/entities/PlaylistFactory';
import { FindLibraryOutput } from '../../../domain/repositories/PlaylistRepositoryInterface';
import { AddPlaylistToLibraryUsecase } from '../../../domain/usecases/AddPlaylistToLibraryUsecase';
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
      id: Date.now().toString(),
      id_channel: Date.now().toString(),
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

    test('Deve ser adicionada duas playlists na library.', async () => {
      const playlist1 = createFakePlaylist();
      playlist1.id_channel = '003';
      const playlist2 = createFakePlaylist();
      playlist2.id_channel = '003';

      await playlistRepository.create(playlist1);
      await playlistRepository.create(playlist2);

      const input1 = {
        id_authenticated_channel: playlist1.id_channel,
        id_playlist: playlist1.id
      };
      const input2 = {
        id_authenticated_channel: playlist2.id_channel,
        id_playlist: playlist2.id
      };

      const addPlaylistToLibraryUsecase = createAddPlaylistToLibraryUsecase();

      await addPlaylistToLibraryUsecase.execute(input1);
      await addPlaylistToLibraryUsecase.execute(input2);

      const library = await playlistRepository.findLibrary(
        input1.id_authenticated_channel
      );
      console.log(library);

      expect(library).toEqual<FindLibraryOutput[]>([
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
  });
});
