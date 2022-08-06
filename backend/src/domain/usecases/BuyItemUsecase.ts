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
    const { orderRepository, orderFactory } = this.dependencies;

    const { id_authenticated_channel: id_buyer_channel } = input;
    const items = input.items ?? [];
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

    await this.throwErrorIfAnyVideoCannotBePurchased(videos, id_buyer_channel);
    await this.throwErrorIfAnyPlaylistCannotBePurchased(
      playlists,
      id_buyer_channel
    );

    const order = orderFactory.create(input);

    await orderRepository.createOrder(order.getOrder());
    await orderRepository.createOrderItems(order.getOrderItems());
  }

  private async throwErrorIfAnyVideoCannotBePurchased(
    videos: Item[],
    id_buyer_channel: string
  ): Promise<never | void> {
    if (videos.length <= 0) {
      return;
    }

    const { videoRepository } = this.dependencies;

    const videosIds = videos.map((item) => item.id).join(',');
    const videosFound = await videoRepository.findVideosByIds(videosIds);
    if (videosFound.length !== videos.length)
      throw new Error('Algum video não foi encontrado.');

    let buyerOwnsTheVideo = false;
    videosFound.forEach((video) => {
      buyerOwnsTheVideo = video.isFromTheSameChannel(id_buyer_channel);
      if (buyerOwnsTheVideo)
        throw new Error('O comprador é o dono do video que quer comprar.');

      if (video.isFree()) throw new Error('O video é gratuito.');

      if (video.isPrivate()) throw new Error('O video é privado.');
    });
  }

  private async throwErrorIfAnyPlaylistCannotBePurchased(
    playlists: Item[],
    id_buyer_channel: string
  ): Promise<never | void> {
    if (playlists.length <= 0) {
      return;
    }

    const { playlistRepository } = this.dependencies;

    const playlistsIds = playlists.map((item) => item.id).join(',');
    const playlistsFound = await playlistRepository.findPlaylistsByIds(
      playlistsIds
    );
    if (playlistsFound.length !== playlists.length)
      throw new Error('Alguma playlist não foi encontrado.');

    let buyerOwnsThePlaylist = false;
    const cantBuyPlaylists = playlistsFound.some((playlist) => {
      buyerOwnsThePlaylist = playlist.isFromTheSameChannel(id_buyer_channel);
      return playlist.isFree() || playlist.isPrivate() || buyerOwnsThePlaylist;
    });
    if (cantBuyPlaylists)
      throw new Error('Alguma playlist nao pode ser comprada.');
  }
}
