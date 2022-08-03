import { Order } from '../entities/Order';
import { PlaylistAttributes, Playlist } from '../entities/Playlist';
import { VideoAttributes, Video } from '../entities/Video';
import { FactoryInterface } from '../factories/FactoryInterface';
import { OrderRepositoryInterface } from '../repositories/OrderRepositoryInterface';
import { PlaylistRepositoryInterface } from '../repositories/PlaylistRepositoryInterface';
import { VideoRepositoryInterface } from '../repositories/VideoRepositoryInterface';

export type Item = {
  id: string;
  type: 'video' | 'playlist';
};
export type BuyItemInput = {
  id_authenticated_channel: string;
  items: Item[];
};

export type BuyItemDependencies = {
  playlistRepository: PlaylistRepositoryInterface;
  videoRepository: VideoRepositoryInterface;
  orderRepository: OrderRepositoryInterface;
  // buyItemValidator: BuyItemValidator;
  orderFactory: FactoryInterface<BuyItemInput, Order>;
};

export class BuyItemUsecase {
  constructor(private readonly dependencies: BuyItemDependencies) {}

  public async execute(input: BuyItemInput) {
    const {
      videoRepository,
      playlistRepository,
      orderRepository,
      orderFactory
    } = this.dependencies;

    const items = input.items;
    if (items.length <= 0) throw new Error('Não há itens para ser comprado.');

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
      videosFound = await videoRepository.findVideosByIds(videosIds);
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
      playlistsFound = await playlistRepository.findPlaylistsByIds(
        playlistsIds
      );
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

    const order = orderFactory.create(input);

    await orderRepository.createOrder(order.getOrder());
    await orderRepository.createOrderItems(order.getOrderItems());
  }
}
