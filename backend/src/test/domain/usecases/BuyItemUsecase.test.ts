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
  BuyItemUsecaseInput,
  ItemType
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

    test('Deve ser comprado somente um video e uma playlist', async () => {
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
          { id: video.id, type: ItemType.VIDEO },
          { id: playlist.id, type: ItemType.PLAYLIST }
        ]
      };

      const mock_id = '001';
      const mockOrderFactory = new OrderFactory({
        idGenerator: { generate: () => mock_id }
      });
      const buyItem = new BuyItemUsecase({
        orderRepository,
        playlistRepository,
        videoRepository,
        orderFactory: mockOrderFactory
      });
      await buyItem.execute(input);

      const order = await orderRepository.findAllOrders(
        input.id_authenticated_channel
      );

      const expectedOrders: OrderAttributes = {
        id: mock_id,
        id_channel: input.id_authenticated_channel,
        items: [
          {
            id_purchased_item: input.items[0].id,
            type: input.items[0].type,
            id_order: mock_id,
            id: mock_id
          },
          {
            id_purchased_item: input.items[1].id,
            type: input.items[1].type,
            id_order: mock_id,
            id: mock_id
          }
        ]
      };

      expect(order[0].getOrderWithItems()).toEqual(expectedOrders);
    });

    test('Deve ser comprado somente uma playlist', async () => {
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

    test('Deve ser comprado somente um video', async () => {
      const video: VideoAttributes = {
        video: 's3//amazon',
        thumbnail: 'devops.png',
        description: 'Aulão sobre as principais ferramentas.',
        dislikes: 5,
        likes: 1000,
        views: 2000,
        id: '001',
        id_channel: '002',
        title: 'DevOps',
        price: 300,
        visibility: PlaylistVisibility.PUBLIC
      };
      await videoRepository.create(video);

      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: video.id, type: ItemType.VIDEO }]
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

    test('Deve lançar erro ao verificar que nao tem items para comprar no input', async () => {
      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: []
      };

      const mockOrderFactory = new OrderFactory({
        idGenerator
      });
      const buyItem = new BuyItemUsecase({
        orderRepository,
        orderFactory: mockOrderFactory,
        playlistRepository,
        videoRepository
      });

      const execute = async () => await buyItem.execute(input);
      await expect(execute).rejects.toThrow(
        new Error('Não há itens para ser comprado.')
      );
    });

    test.todo('Deve lançar erro ao verificar que um video é privado');
    test.todo('Deve lançar erro ao verificar que um video é gratuito');
    test.todo(
      'Deve lançar erro ao verificar que um video é do próprio canal comprador'
    );
    test.todo(
      'Deve lançar erro ao verificar que um video já foi comprado pelo comprador'
    );
    test.todo('Deve lançar erro ao verificar que um video não existe');

    test.todo('Deve lançar erro ao verificar que uma playlist é privada');
    test.todo('Deve lançar erro ao verificar que uma playlist é gratuita');
    test.todo(
      'Deve lançar erro ao verificar que uma playlist é do próprio canal comprador'
    );
    test.todo(
      'Deve lançar erro ao verificar que uma playlist já foi comprada pelo comprador'
    );
    test.todo('Deve lançar erro ao verificar que uma playlist não existe');
  });
});
