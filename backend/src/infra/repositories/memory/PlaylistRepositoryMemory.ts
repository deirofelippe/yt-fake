import {
  Playlist,
  PlaylistAttributes
} from '../../../domain/entities/Playlist';
import { EntityFactoryInterface } from '../../../domain/factories/entities/EntityFactoryInterface';
import { PlaylistRepositoryInterface } from '../../../domain/repositories/PlaylistRepositoryInterface';
import { VideoInPlaylistAttributes } from '../../../domain/usecases/AddVideoToPlaylistUsecase';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class PlaylistRepositoryMemory implements PlaylistRepositoryInterface {
  constructor(
    private readonly memoryDatabase: MemoryDatabase,
    private readonly playlistFactory: EntityFactoryInterface<Playlist>
  ) {}

  async findPlaylistsByIds(ids: string): Promise<Playlist[] | []> {
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

    return playlistsFound.map((playlist) =>
      this.playlistFactory.recreate(playlist)
    );
  }

  async findAll(): Promise<Playlist[] | undefined> {
    return this.memoryDatabase.playlists.map((playlist) =>
      this.playlistFactory.recreate(playlist)
    );
  }
  async findById(id: string): Promise<Playlist | undefined> {
    const playlistFound = this.memoryDatabase.playlists.find(
      (playlist) => playlist.id === id
    );

    if (!playlistFound) return undefined;

    return this.playlistFactory.recreate(playlistFound);
  }
  async create(playlist: PlaylistAttributes): Promise<void> {
    this.memoryDatabase.playlists.push({
      ...playlist
    });
  }
  async addVideo(videoInPlaylist: VideoInPlaylistAttributes): Promise<void> {
    this.memoryDatabase.videoInPlaylist.push({
      ...videoInPlaylist
    });
  }
  async findPlaylistsByIdThatWereNotPurchased(
    playlistsIds: string,
    id_buyer_channel: string
  ): Promise<Playlist[] | []> {
    let playlistsFound: PlaylistAttributes[] = [];
    playlistsIds.split(',').forEach((id) => {
      const playlistFound = this.memoryDatabase.playlists.find(
        (playlist) => playlist.id === id
      );
      if (!playlistFound) return;

      playlistsFound.push(playlistFound);
    });

    let playlistsNotPurchased: any[] = [];
    playlistsFound.forEach((playlist) => {
      const playlistFound = this.memoryDatabase.purchasedItems.find(
        (purchased) =>
          purchased.id_channel === id_buyer_channel &&
          purchased.id_item === playlist.id
      );
      if (playlistFound) return;
      playlistsNotPurchased.push(playlist);
    });
    return playlistsNotPurchased.map((playlist) =>
      this.playlistFactory.recreate(playlist)
    );
  }
}
