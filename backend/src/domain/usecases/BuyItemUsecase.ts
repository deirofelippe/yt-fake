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

    //verificar se encontrou todos os videos no if
    if (videos.length > 0) {
      videosIds = videos.map((item) => item.id).join(',');
      videosFound = await videoRepository.findVideosByIds(videosIds);
      if (videosFound.length !== videos.length)
        throw new Error('Algum video não foi encontrado.');
      cantBuyVideos = videosFound.some((video) => {
        buyerOwnsTheVideo = video.isFromTheSameChannel(id_buyer_channel);
        return video.isFree() || video.isPrivate() || buyerOwnsTheVideo;
      });
      if (cantBuyVideos) throw new Error('Algum video nao pode ser comprado.');
    }

    let playlistsIds: string = '',
      playlistsFound: Playlist[] = [],
      buyerOwnsThePlaylist: boolean = false,
      cantBuyPlaylists: boolean = false;

    if (playlists.length > 0) {
      playlistsIds = playlists.map((item) => item.id).join(',');
      playlistsFound = await playlistRepository.findPlaylistsByIds(
        playlistsIds
      );
      if (playlistsFound.length !== playlists.length)
        throw new Error('Alguma playlist não foi encontrado.');
      cantBuyPlaylists = playlistsFound.some((playlist) => {
        buyerOwnsThePlaylist = playlist.isFromTheSameChannel(id_buyer_channel);
        return (
          playlist.isFree() || playlist.isPrivate() || buyerOwnsThePlaylist
        );
      });
      if (cantBuyPlaylists)
        throw new Error('Alguma playlist nao pode ser comprada.');
    }

    const order = orderFactory.create(input);

    await orderRepository.createOrder(order.getOrder());
    await orderRepository.createOrderItems(order.getOrderItems());
  }
}
