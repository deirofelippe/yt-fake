import { PlaylistDTO } from '../dto/PlaylistDTO';
import { Playlist } from '../entities/Playlist';

export interface PlaylistRepository {
  findAll(): Promise<PlaylistDTO[]>;
  findById(id: string): Promise<PlaylistDTO>;
  create(playlist: Playlist): Promise<void>;
}
