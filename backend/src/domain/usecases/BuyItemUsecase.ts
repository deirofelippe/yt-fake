import { Order } from '../entities/Order';
import { PlaylistAttributes, Playlist } from '../entities/Playlist';
import { VideoAttributes, Video } from '../entities/Video';
import { IDGenerator } from '../libs/IDGenerator';
import { OrderRepositoryInterface } from '../repositories/OrderRepositoryInterface';
import { PlaylistRepository } from '../repositories/PlaylistRepository';
import { VideoRepository } from '../repositories/VideoRepository';

export type Item = {
  id: string;
  type: 'video' | 'playlist';
};
export type BuyItemInput = {
  id_authenticated_channel: string;
  items: Item[];
};

export type BuyItemDependencies = {
  playlistRepository: PlaylistRepository;
  videoRepository: VideoRepository;
  orderRepository: OrderRepositoryInterface;
  // buyItemValidator: BuyItemValidator;
  idGenerator: IDGenerator;
};

export class BuyItemUsecase {
  constructor(private dependencies: BuyItemDependencies) {}
  public async execute(input: BuyItemInput) {
    const {
      videoRepository,
      playlistRepository,
      orderRepository,
      idGenerator
    } = this.dependencies;

    const items = input.items;

    const videos: Item[] = [],
      playlists: Item[] = [];

    for (const item of items) {
      if (item.type == 'video') {
        videos.push(item);
        continue;
      }
      if (item.type == 'playlist') {
        playlists.push(item);
        continue;
      }
    }

    let videosIds: string = '',
      videosFound: VideoAttributes[] = [];
    if (videos.length > 0) {
      videosIds = videos.map((item) => item.id).join(',');
      videosFound = await videoRepository.findVideosById(videosIds);
      const canBuyVideos = videosFound.every((video) => {
        const videoEntity = Video.create(video);
        return videoEntity.isNotFree() && videoEntity.isPublic();
      });
      if (!canBuyVideos) throw new Error('Algum video nao pode ser comprado.');
    }

    let playlistsIds: string = '',
      playlistsFound: PlaylistAttributes[] = [];
    if (playlists.length > 0) {
      playlistsIds = playlists.map((item) => item.id).join(',');
      playlistsFound = await playlistRepository.findPlaylistsById(playlistsIds);
      const canBuyPlaylists = playlistsFound.every((playlist) => {
        const playlistEntity = Playlist.create(playlist);
        return playlistEntity.isNotFree() && playlistEntity.isPublic();
      });
      if (!canBuyPlaylists)
        throw new Error('Alguma playlist nao pode ser comprada.');
    }

    const totalLength = videosFound.length + playlistsFound.length;

    if (totalLength !== items.length)
      throw new Error('Algum item não foi encontrado.');

    const order = Order.create({ idGenerator }, input);

    await orderRepository.createOrder(order.getOrder());
    await orderRepository.createOrderItems(order.getOrderItems());
  }
}
