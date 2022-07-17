import { FindAllVideosOutput } from '../../infra/repositories/memory/PlaylistRepositoryMemory';
import { PlaylistAttributes } from '../entities/Playlist';
import { VideoInPlaylistAttributes } from '../entities/VideoInPlaylist';

export interface PlaylistRepository {
  findAll(): Promise<PlaylistAttributes[] | undefined>;
  findById(id: string): Promise<PlaylistAttributes | undefined>;
  create(playlist: PlaylistAttributes): Promise<void>;
  addVideo(videoInPlaylist: VideoInPlaylistAttributes): Promise<void>;
  findAllVideos(id_playlist: string): Promise<FindAllVideosOutput>;
}
