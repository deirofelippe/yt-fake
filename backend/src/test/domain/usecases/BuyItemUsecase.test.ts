import { OrderAttributes } from '../../../domain/entities/Order';
import {
  PlaylistAttributes,
  PlaylistVisibility
} from '../../../domain/entities/Playlist';
import {
  VideoAttributes,
  VideoVisibility
} from '../../../domain/entities/Video';
import { OrderFactory } from '../../../domain/factories/entities/OrderFactory';
import { PlaylistFactory } from '../../../domain/factories/entities/PlaylistFactory';
import { VideoFactory } from '../../../domain/factories/entities/VideoFactory';
import { IDGenerator } from '../../../domain/libs/IDGenerator';
import {
  BuyItemUsecase,
  BuyItemUsecaseInput
} from '../../../domain/usecases/BuyItemUsecase';
import { CryptoIDGenerator } from '../../../infra/libs/CryptoIDGenerator';
import { OrderRepositoryMemory } from '../../../infra/repositories/memory/OrderRepositoryMemory';
import { PlaylistRepositoryMemory } from '../../../infra/repositories/memory/PlaylistRepositoryMemory';
import { VideoRepositoryMemory } from '../../../infra/repositories/memory/VideoRepositoryMemory';
import { MemoryDatabase } from '../../MemoryDatabase';

describe('BuyItemUsecase', () => {
  describe('Comprar items', () => {
    const memoryDatabase = new MemoryDatabase();
    const idGenerator = new CryptoIDGenerator();
    const orderFactory = new OrderFactory({ idGenerator });
    const videoFactory = new VideoFactory({
      idGenerator
    });
    const playlistFactory = new PlaylistFactory({
      idGenerator
    });
    const videoRepository = new VideoRepositoryMemory(
      memoryDatabase,
      videoFactory
    );
    const playlistRepository = new PlaylistRepositoryMemory(
      memoryDatabase,
      playlistFactory
    );
    const orderRepository = new OrderRepositoryMemory(
      memoryDatabase,
      orderFactory
    );

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

    //video e playlist inexistente, video e playlist privados ou gratuitos, ja comprado, playlist e video n pode ser da propria pessoa
    //gera url do pagseguro
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

      const input: BuyItemUsecaseInput = {
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

      const expectedOrders: OrderAttributes = {
        id: '001',
        id_channel: input.id_authenticated_channel,
        items: [
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
        ]
      };

      expect(order[0].getOrderWithItems()).toEqual(expectedOrders);
    });

    test('Deve ser adicionado no banco order e orderItem de um playlist', async () => {
      const playlist: PlaylistAttributes = {
        id: '001',
        id_channel: '002',
        title: 'DevOps',
        price: 300,
        visibility: PlaylistVisibility.PUBLIC
      };
      await playlistRepository.create(playlist);

      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: playlist.id, type: ItemType.PLAYLIST }]
      };

      const mock_id = '001';
      const mockOrderFactory = new OrderFactory({
        idGenerator: { generate: () => mock_id }
      });
      const buyItem = new BuyItemUsecase({
        orderRepository,
        orderFactory: mockOrderFactory,
        playlistRepository,
        videoRepository
      });
      await buyItem.execute(input);

      const orders = await orderRepository.findAllOrders(
        input.id_authenticated_channel
      );

      const expectedOrder = {
        id: mock_id,
        id_channel: input.id_authenticated_channel,
        items: [
          {
            id_purchased_item: input.items[0].id,
            type: input.items[0].type,
            id_order: mock_id,
            id: mock_id
          }
        ]
      };

      expect(orders[0].getOrderWithItems()).toEqual(expectedOrder);
    });
  });
});
