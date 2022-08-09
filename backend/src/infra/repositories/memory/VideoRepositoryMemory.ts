import { OrderItemAttributes } from '../../../domain/entities/Order';
import { Video, VideoAttributes } from '../../../domain/entities/Video';
import { EntityFactoryInterface } from '../../../domain/factories/entities/EntityFactoryInterface';
import {
  FindAllVideosOutput,
  VideoRepositoryInterface
} from '../../../domain/repositories/VideoRepositoryInterface';
import { NotFoundError } from '../../../errors/NotFoundError';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class VideoRepositoryMemory implements VideoRepositoryInterface {
  constructor(
    private readonly memoryDatabase: MemoryDatabase,
    private readonly videoFactory: EntityFactoryInterface<Video>
  ) {}

  async findVideosByIds(ids: string): Promise<Video[] | []> {
    let videosFound: VideoAttributes[] = [];
    ids.split(',').forEach((id) => {
      const videoFound = this.memoryDatabase.videos.find(
        (video) => video.id === id
      );
      if (!videoFound) {
        return;
      }
      videosFound.push(videoFound);
    });
    return videosFound.map((video) => this.videoFactory.recreate(video));
  }

  async findVideosByIdThatWereNotPurchased(
    videosIds: string,
    id_buyer_channel: string
  ) {
    const videosFound: VideoAttributes[] = [];
    videosIds.split(',').forEach((id) => {
      const videoFound = this.memoryDatabase.videos.find(
        (video) => video.id === id
      );
      if (!videoFound) return;

      videosFound.push(videoFound);
    });

    //pega as orders do channel
    const ordersFound = this.memoryDatabase.orders.filter(
      (order) => order.id_channel === id_buyer_channel
    );

    let orderItems: OrderItemAttributes[] = [];
    //coloca os items de tds as orders em um array so
    ordersFound.forEach((order) => {
      const orderItemsFound = this.memoryDatabase.orderItems.filter(
        (items) => items.id_order === order.id
      );
      orderItems = [...orderItems, ...orderItemsFound];
    });

    const videosNotPurchased: VideoAttributes[] = [];
    //push no array os videos que nao estao na lista de orderItems

    videosFound.forEach((video) => {
      const orderItemFound = orderItems.find(
        (item) => item.id_purchased_item === video.id
      );

      if (orderItemFound) {
        return;
      }

      videosNotPurchased.push(video);
    });
    return videosNotPurchased.map((video) => this.videoFactory.recreate(video));
  }

  async findAll(): Promise<Video[] | []> {
    return this.memoryDatabase.videos.map((video) =>
      this.videoFactory.recreate(video)
    );
  }

  async findById(id: string): Promise<Video | undefined> {
    const videoFound = this.memoryDatabase.videos.find(
      (video) => video.id === id
    );

    if (!videoFound) return undefined;

    return this.videoFactory.recreate(videoFound);
  }
  async create(video: VideoAttributes): Promise<void> {
    this.memoryDatabase.videos.push({
      ...video
    });
  }
  async findAllVideosByPlaylist(
    id_playlist: string
  ): Promise<FindAllVideosOutput> {
    const videosReferences = this.memoryDatabase.videoInPlaylist.filter(
      (video) => video.id_playlist === id_playlist
    );

    const videosInPlaylist = [];
    for (const videoReference of videosReferences) {
      const videoFound = this.memoryDatabase.videos.find(
        (video) => videoReference.id_referenced_video === video.id
      );

      if (!videoFound) continue;

      videosInPlaylist.push({
        id: videoFound.id,
        title: videoFound.title,
        thumbnail: videoFound.thumbnail
      });
    }

    return videosInPlaylist;
  }
}
