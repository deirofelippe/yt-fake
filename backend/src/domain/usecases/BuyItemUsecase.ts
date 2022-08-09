import { FieldsValidationError } from '../../errors/FieldsValidationError';
import { ImpossibleActionError } from '../../errors/ImpossibleActionError';
import { Order } from '../entities/Order';
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

    if (items.length <= 0)
      throw new FieldsValidationError([
        { field: 'items', message: 'Items não pode estar vazio.' }
      ]);

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
    const videosFound =
      await videoRepository.findVideosByIdThatWereNotPurchased(
        videosIds,
        id_buyer_channel
      );
    if (videosFound.length !== videos.length)
      throw new ImpossibleActionError(
        'Algum video não foi encontrado ou já foi comprado.'
      );

    let buyerOwnsTheVideo = false;
    videosFound.forEach((video) => {
      buyerOwnsTheVideo = video.isFromTheSameChannel(id_buyer_channel);
      if (buyerOwnsTheVideo)
        throw new ImpossibleActionError(
          'O comprador é o dono do video que quer comprar.'
        );

      if (video.isFree())
        throw new ImpossibleActionError('O video é gratuito.');

      if (video.isPrivate())
        throw new ImpossibleActionError('O video é privado.');
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

    const playlistsFound =
      await playlistRepository.findPlaylistsByIdThatWereNotPurchased(
        playlistsIds,
        id_buyer_channel
      );
    if (playlistsFound.length !== playlists.length)
      throw new ImpossibleActionError(
        'Alguma playlist não foi encontrada ou já foi comprada.'
      );

    let buyerOwnsThePlaylist = false;
    playlistsFound.forEach((playlist) => {
      buyerOwnsThePlaylist = playlist.isFromTheSameChannel(id_buyer_channel);
      if (buyerOwnsThePlaylist)
        throw new ImpossibleActionError(
          'O comprador é o dono da playlist que quer comprar.'
        );

      if (playlist.isFree())
        throw new ImpossibleActionError('A playlist é gratuita.');

      if (playlist.isPrivate())
        throw new ImpossibleActionError('A playlist é privada.');
    });
  }
}
