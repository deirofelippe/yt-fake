import { PlaylistAttributes } from '../../../domain/entities/Playlist';
import { VideoInPlaylistAttributes } from '../../../domain/entities/VideoInPlaylist';
import { PlaylistRepositoryInterface } from '../../../domain/repositories/PlaylistRepositoryInterface';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class PlaylistRepositoryMemory implements PlaylistRepositoryInterface {
  constructor(private memoryDatabase: MemoryDatabase) {}

  async findPlaylistsByIds(ids: string): Promise<PlaylistAttributes[] | []> {
    let playlistsFound: PlaylistAttributes[] = [];
    ids.split(',').forEach((id) => {
      const playlistFound = this.memoryDatabase.playlists.find(
        (playlist) => playlist.id === id
      );
      if (!playlistFound) {
        return;
      }
      playlistsFound.push(playlistFound);
    });
    return playlistsFound;
  }

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
  async addVideo(videoInPlaylist: VideoInPlaylistAttributes): Promise<void> {
    Promise.resolve(
      this.memoryDatabase.videoInPlaylist.push({
        ...videoInPlaylist
      })
    );
  }
}
