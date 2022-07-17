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
  async addVideo(videoInPlaylist: VideoInPlaylistAttributes): Promise<void> {
    Promise.resolve(
      this.memoryDatabase.videoInPlaylist.push({
        ...videoInPlaylist
      })
    );
  }
  async findAllVideos(id_playlist: string): Promise<FindAllVideosOutput> {
    const videosReferences = this.memoryDatabase.videoInPlaylist.filter(
      (video) => video.id_playlist === id_playlist
    );

    const videosInPlaylist = [];
    for (const videoReference of videosReferences) {
      const videoFound = this.memoryDatabase.videos.find(
        (video) => videoReference.id_referenced_video === video.id
      );

      if (!videoFound) continue;

      videosInPlaylist.push({
        id: videoFound.id,
        title: videoFound.title,
        thumbnail: videoFound.thumbnail
      });
    }

    return Promise.resolve(videosInPlaylist);
  }
}

export type FindAllVideosOutput =
  | {
      id: string;
      title: string;
      thumbnail: string;
    }[]
  | undefined;
