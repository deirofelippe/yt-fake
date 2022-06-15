import { ChannelAttributes } from '../domain/entities/Channel';
import { PlaylistAttributes } from '../domain/entities/Playlist';

export class MemoryDatabase {
  public channels: ChannelAttributes[] = [];
  public playlists: PlaylistAttributes[] = [];
}
