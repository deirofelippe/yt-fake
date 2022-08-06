import { Order } from '../entities/Order';
import { Playlist } from '../entities/Playlist';
import { Video } from '../entities/Video';
import { EntityFactoryInterface } from '../factories/entities/EntityFactoryInterface';
import { OrderRepositoryInterface } from '../repositories/OrderRepositoryInterface';
import { PlaylistRepositoryInterface } from '../repositories/PlaylistRepositoryInterface';
import { VideoRepositoryInterface } from '../repositories/VideoRepositoryInterface';

export enum ItemType {
  VIDEO = 'video',
  PLAYLIST = 'playlist'
}
export type Item = {
  id: string;
  type: ItemType;
};
export type BuyItemUsecaseInput = {
  id_authenticated_channel: string;
  items: Item[];
};

export type BuyItemUsecaseDependencies = {
  playlistRepository: PlaylistRepositoryInterface;
  videoRepository: VideoRepositoryInterface;
  orderRepository: OrderRepositoryInterface;
  orderFactory: EntityFactoryInterface<Order>;
};

export class BuyItemUsecase {
  constructor(private readonly dependencies: BuyItemUsecaseDependencies) {}

  public async execute(input: BuyItemUsecaseInput) {
    const {
      videoRepository,
      playlistRepository,
      orderRepository,
      orderFactory
    } = this.dependencies;

    const { id_authenticated_channel: id_buyer_channel } = input;
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
      videosFound: Video[] = [],
      buyerOwnsTheVideo: boolean = false,
      cantBuyVideos: boolean = false;

    if (videos.length > 0) {
      videosIds = videos.map((item) => item.id).join(',');
      videosFound = await videoRepository.findVideosByIds(videosIds);
      cantBuyVideos = videosFound.some((video) => {
        buyerOwnsTheVideo = video.isFromTheSameChannel(id_buyer_channel);
        return video.isFree() || video.isPrivate() || buyerOwnsTheVideo;
      });
      if (cantBuyVideos) throw new Error('Algum video nao pode ser comprado.');
    }

    let playlistsIds: string = '',
      playlistsFound: Playlist[] = [];
    if (playlists.length > 0) {
      playlistsIds = playlists.map((item) => item.id).join(',');
      playlistsFound = await playlistRepository.findPlaylistsByIds(
        playlistsIds
      );
      const canBuyPlaylists = playlistsFound.every(
        (playlist) => playlist.isNotFree() && playlist.isPublic()
      );
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
