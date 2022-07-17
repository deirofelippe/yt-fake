import { ChannelAttributes } from '../domain/entities/Channel';
import { PlaylistAttributes } from '../domain/entities/Playlist';
import { VideoAttributes } from '../domain/entities/Video';
import { VideoInPlaylistAttributes } from '../domain/entities/VideoInPlaylist';

export class MemoryDatabase {
  public channels: ChannelAttributes[] = [];
  public playlists: PlaylistAttributes[] = [];
  public videos: VideoAttributes[] = [];
  public videoInPlaylist: VideoInPlaylistAttributes[] = [];
}
