import { PlaylistDTO } from '../dto/PlaylistDTO';
import { Playlist } from '../entities/Playlist';

export interface PlaylistRepository {
  findAll(): Promise<PlaylistDTO[] | undefined>;
  findById(id: string): Promise<PlaylistDTO | undefined>;
  create(playlist: Playlist): Promise<void>;
}
