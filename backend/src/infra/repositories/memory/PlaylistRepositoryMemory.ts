import { PlaylistDTO } from '../../../domain/dto/PlaylistDTO';
import { Playlist } from '../../../domain/entities/Playlist';
import { PlaylistRepository } from '../../../domain/repositories/PlaylistRepository';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class PlaylistRepositoryMemory implements PlaylistRepository {
  constructor(private memoryDatabase: MemoryDatabase) {}

  async findAll(): Promise<PlaylistDTO[] | undefined> {
    const playlists = this.memoryDatabase.playlists.map((playlist) => {
      const playlistDTO: PlaylistDTO = {
        id: playlist.id,
        ...playlist
      };
      return playlistDTO;
    });
    return playlists;
  }
  async findById(id: string): Promise<PlaylistDTO | undefined> {
    const playlistFound = this.memoryDatabase.playlists.find(
      (playlist) => playlist.id === id
    );

    const playlistDTO: PlaylistDTO = {
      id: playlistFound.id,
      ...playlistFound
    };

    return Promise.resolve(playlistDTO);
  }
  async create(playlist: Playlist): Promise<void> {
    Promise.resolve(
      this.memoryDatabase.playlists.push({
        ...playlist.getAttributes()
      })
    );
  }
}
