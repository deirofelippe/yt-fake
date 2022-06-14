import { PlaylistRepository } from '../../domain/repositories/PlaylistRepository';
import { MemoryDatabase } from '../../test/MemoryDatabase';

export class PlaylistRepositoryMemory implements PlaylistRepository {
  constructor(private memoryDatabase: MemoryDatabase) {}

  async findAll() {
    return this.memoryDatabase.playlists;
  }
  async findById(id: string) {
    return Promise.resolve(
      this.memoryDatabase.playlists.find((playlist) => playlist.id === id)
    );
  }
  async create(playlist: object) {
    Promise.resolve(this.memoryDatabase.playlists.push(playlist));
  }
}
