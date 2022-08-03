import { describe, expect, test } from '@jest/globals';
import {
  PlaylistAttributes,
  PlaylistVisibility
} from '../../../domain/entities/Playlist';
import {
  VideoAttributes,
  VideoVisibility
} from '../../../domain/entities/Video';
import { OrderFactory } from '../../../domain/factories/OrderFactory';
import { IDGenerator } from '../../../domain/libs/IDGenerator';
import { OrderRepositoryInterface } from '../../../domain/repositories/OrderRepositoryInterface';
import { PlaylistRepositoryInterface } from '../../../domain/repositories/PlaylistRepositoryInterface';
import { VideoRepositoryInterface } from '../../../domain/repositories/VideoRepositoryInterface';
import {
  BuyItemInput,
  BuyItemUsecase
} from '../../../domain/usecases/BuyItemUsecase';
import { CryptoIDGenerator } from '../../../infra/libs/CryptoIDGenerator';
import { OrderRepositoryMemory } from '../../../infra/repositories/memory/OrderRepositoryMemory';
import { PlaylistRepositoryMemory } from '../../../infra/repositories/memory/PlaylistRepositoryMemory';
import { VideoRepositoryMemory } from '../../../infra/repositories/memory/VideoRepositoryMemory';
import { MemoryDatabase } from '../../MemoryDatabase';

describe('BuyItemUsecase', () => {
  describe('Comprar items', () => {
    const memoryDatabase = new MemoryDatabase();
    const videoRepository = new VideoRepositoryMemory(memoryDatabase);
    const playlistRepository = new PlaylistRepositoryMemory(memoryDatabase);
    const orderRepository = new OrderRepositoryMemory(memoryDatabase);
    const idGenerator = new CryptoIDGenerator();
    const orderFactory = new OrderFactory({ idGenerator });

    const createBuyItemUsecase = (): BuyItemUsecase => {
      return new BuyItemUsecase({
        orderRepository,
        playlistRepository,
        videoRepository,
        orderFactory
      });
    };

    beforeEach(() => {
      memoryDatabase.clear();
    });

    //video e playlist inexistente, video e playlist privados ou gratuitos, validacao, ja comprado, playlist e video n pode ser da propria pessoa
    test('Deve ser adicionado no banco order e orderItem de um video e uma playlist', async () => {
      const video: VideoAttributes = {
        id: '000',
        id_channel: '001',
        title: 'Filme Tekkonkinkreet',
        video: 'filme.mp4',
        price: 25,
        visibility: VideoVisibility.PUBLIC
      };
      await videoRepository.create(video);

      const playlist: PlaylistAttributes = {
        id: '001',
        id_channel: '002',
        title: 'DevOps',
        price: 300,
        visibility: PlaylistVisibility.PUBLIC
      };
      await playlistRepository.create(playlist);

      const input: BuyItemInput = {
        id_authenticated_channel: '003',
        items: [
          { id: video.id, type: 'video' },
          { id: playlist.id, type: 'playlist' }
        ]
      };

      const id_mock = '001';
      const id_order_mock = id_mock;
      const idGeneratorMock: IDGenerator = {
        generate: () => id_mock
      };
      const orderFactoryMock = new OrderFactory({
        idGenerator: idGeneratorMock
      });
      const buyItem = new BuyItemUsecase({
        orderRepository,
        playlistRepository,
        videoRepository,
        orderFactory: orderFactoryMock
      });
      await buyItem.execute(input);

      const order = await orderRepository.findAllOrders(
        input.id_authenticated_channel
      );
      const orderItems = await orderRepository.findAllOrderItems(id_order_mock);

      const expectedOrders = [
        {
          id: '001',
          id_channel: input.id_authenticated_channel
        }
      ];

      const expectedOrderItems = [
        {
          id_purchased_item: input.items[0].id,
          type: input.items[0].type,
          id_order: id_order_mock,
          id: '001'
        },
        {
          id_purchased_item: input.items[1].id,
          type: input.items[1].type,
          id_order: id_order_mock,
          id: '001'
        }
      ];

      expect(order).toEqual(expectedOrders);
      expect(orderItems).toEqual(expectedOrderItems);
    });
  });
});
