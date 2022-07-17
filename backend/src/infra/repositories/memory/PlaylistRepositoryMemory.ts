import { PlaylistAttributes } from '../../../domain/entities/Playlist';
import { VideoInPlaylistAttributes } from '../../../domain/entities/VideoInPlaylist';
import { PlaylistRepository } from '../../../domain/repositories/PlaylistRepository';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class PlaylistRepositoryMemory implements PlaylistRepository {
  constructor(private memoryDatabase: MemoryDatabase) {}

  async findAll(): Promise<PlaylistAttributes[] | undefined> {
    return Promise.resolve(this.memoryDatabase.playlists);
  }
  async findById(id: string): Promise<PlaylistAttributes | undefined> {
    const playlistFound = this.memoryDatabase.playlists.find(
      (playlist) => playlist.id === id
    );

    return Promise.resolve(playlistFound);
  }
  async create(playlist: PlaylistAttributes): Promise<void> {
    Promise.resolve(
      this.memoryDatabase.playlists.push({
        ...playlist
      })
    );
  }
}
