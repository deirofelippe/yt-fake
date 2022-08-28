import { FieldsValidationError } from '../../errors/FieldsValidationError';
import { ImpossibleActionError } from '../../errors/ImpossibleActionError';
import { Playlist } from '../entities/Playlist';
import { Video } from '../entities/Video';
import { OrderFactory } from '../factories/entities/OrderFactory';
import { IDGenerator } from '../libs/IDGenerator';
import {
  CheckoutRedirectInput,
  CheckoutRedirectItem,
  PaymentCheckoutRedirectInterface
} from '../payment-gateway/PaymentCheckoutRedirectInterface';
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
export type CreateOrderUsecaseInput = {
  id_authenticated_channel: string;
  items: Item[];
};

export type CreateOrderUsecaseDependencies = {
  playlistRepository: PlaylistRepositoryInterface;
  videoRepository: VideoRepositoryInterface;
  orderRepository: OrderRepositoryInterface;
  orderFactory: OrderFactory;
  paymentCheckoutRedirect: PaymentCheckoutRedirectInterface;
  idGenerator: IDGenerator;
};

export class CreateOrderUsecase {
  constructor(private readonly dependencies: CreateOrderUsecaseDependencies) {}

  public async execute(input: CreateOrderUsecaseInput) {
    const {
      paymentCheckoutRedirect,
      orderRepository,
      orderFactory,
      idGenerator
    } = this.dependencies;

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
      }
    }

    const videosFound = await this.findVideosByIdThatWereNotPurchased(
      videos,
      id_buyer_channel
    );
    this.throwErrorIfAnyVideoCannotBePurchased(videosFound, id_buyer_channel);
    const videosCheckoutItems = this.videosToCheckoutRedirectInput(videosFound);

    const playlistsFound = await this.findPlaylistsByIdThatWereNotPurchased(
      playlists,
      id_buyer_channel
    );
    this.throwErrorIfAnyPlaylistCannotBePurchased(
      playlistsFound,
      id_buyer_channel
    );
    const playlistsCheckoutItems =
      this.playlistsToCheckoutRedirectInput(playlistsFound);

    const checkoutRedirectInput: CheckoutRedirectInput = {
      id_order: idGenerator.generate(),
      items: [...videosCheckoutItems, ...playlistsCheckoutItems]
    };
    const url = await paymentCheckoutRedirect.execute(checkoutRedirectInput);

    const order = orderFactory.create({
      items: input.items,
      id_channel: input.id_authenticated_channel
    });
    await orderRepository.createOrder(order.getOrder());
    await orderRepository.createOrderItems(order.getOrderItems());

    return url;
  }

  private async findPlaylistsByIdThatWereNotPurchased(
    playlists: Item[] | [],
    id_buyer_channel: string
  ) {
    if (playlists.length <= 0) {
      return [];
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

    return playlistsFound;
  }

  private async findVideosByIdThatWereNotPurchased(
    videos: Item[] | [],
    id_buyer_channel: string
  ) {
    if (videos.length <= 0) {
      return [];
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

    return videosFound;
  }

  private throwErrorIfAnyPlaylistCannotBePurchased(
    playlists: Playlist[] | [],
    id_buyer_channel: string
  ): Promise<never | void> {
    if (playlists.length <= 0) {
      return;
    }

    let buyerOwnsThePlaylist = false;
    for (const playlist of playlists) {
      buyerOwnsThePlaylist = playlist.channelIsTheSame(id_buyer_channel);
      if (buyerOwnsThePlaylist)
        throw new ImpossibleActionError(
          'O comprador é o dono da playlist que quer comprar.'
        );

      if (playlist.isFree())
        throw new ImpossibleActionError('A playlist é gratuita.');

      if (playlist.isPrivate())
        throw new ImpossibleActionError('A playlist é privada.');
    }
  }

  private throwErrorIfAnyVideoCannotBePurchased(
    videos: Video[] | [],
    id_buyer_channel: string
  ): Promise<never | void> {
    if (videos.length <= 0) {
      return;
    }

    let buyerOwnsTheVideo = false;
    for (const video of videos) {
      buyerOwnsTheVideo = video.channelIsTheSame(id_buyer_channel);
      if (buyerOwnsTheVideo)
        throw new ImpossibleActionError(
          'O comprador é o dono do video que quer comprar.'
        );

      if (video.isFree())
        throw new ImpossibleActionError('O video é gratuito.');

      if (video.isPrivate())
        throw new ImpossibleActionError('O video é privado.');
    }
  }

  private playlistsToCheckoutRedirectInput(
    playlists: Playlist[] | []
  ): CheckoutRedirectItem[] {
    if (playlists.length <= 0) {
      return [];
    }

    return playlists.map((playlist): CheckoutRedirectItem => {
      const { id, title, price } = playlist.getAttributes();
      return { id, price, title };
    });
  }

  private videosToCheckoutRedirectInput(
    videos: Video[] | []
  ): CheckoutRedirectItem[] {
    if (videos.length <= 0) {
      return [];
    }

    return videos.map((video): CheckoutRedirectItem => {
      const { id, title, price } = video.getAttributes();
      return { id, price, title };
    });
  }
}
