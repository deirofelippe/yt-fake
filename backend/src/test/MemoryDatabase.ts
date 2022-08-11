import { ChannelAttributes } from '../domain/entities/Channel';
import { OrderAttributes, OrderItemAttributes } from '../domain/entities/Order';
import { PlaylistAttributes } from '../domain/entities/Playlist';
import { VideoAttributes } from '../domain/entities/Video';
import { LibraryAttributes } from '../domain/repositories/PlaylistRepositoryInterface';
import { VideoInPlaylistAttributes } from '../domain/usecases/AddVideoToPlaylistUsecase';

export class MemoryDatabase {
  public orders: Omit<OrderAttributes, 'items'>[] = [];
  public orderItems: OrderItemAttributes[] = [];
  public channels: ChannelAttributes[] = [];
  public playlists: PlaylistAttributes[] = [];
  public videos: VideoAttributes[] = [];
  public videoInPlaylist: VideoInPlaylistAttributes[] = [];
  public library: LibraryAttributes[] = [];

  public clear() {
    this.channels = [];
    this.videos = [];
    this.playlists = [];
    this.videoInPlaylist = [];
    this.orders = [];
    this.orderItems = [];
    this.library = [];
  }
}
