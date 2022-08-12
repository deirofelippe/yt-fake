import nock from 'nock';
import {
  OrderAttributes,
  OrderItemAttributes
} from '../../../domain/entities/Order';
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
import {
  BuyItemUsecase,
  BuyItemUsecaseInput,
  ItemType
} from '../../../domain/usecases/BuyItemUsecase';
import { env } from '../../../env';
import { FieldsValidationError } from '../../../errors/FieldsValidationError';
import { ImpossibleActionError } from '../../../errors/ImpossibleActionError';
import { CryptoIDGenerator } from '../../../infra/libs/CryptoIDGenerator';
import { PagSeguro } from '../../../infra/libs/paymentGateway/PagSeguro';
import { PlaylistRepositoryMemory } from '../../../infra/repositories/memory/PlaylistRepositoryMemory';
import { VideoRepositoryMemory } from '../../../infra/repositories/memory/VideoRepositoryMemory';
import { MemoryDatabase } from '../../MemoryDatabase';
import { xmlCheckoutRedirect } from './__mocks__/mockPagseguroResponses';

describe('BuyItemUsecase', () => {
  describe('Comprar items', () => {
    const memoryDatabase = new MemoryDatabase();
    const idGenerator = new CryptoIDGenerator();
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
    const paymentGateway = new PagSeguro();

    const createBuyItemUsecase = (): BuyItemUsecase => {
      return new BuyItemUsecase({
        paymentGateway,
        playlistRepository,
        videoRepository
      });
    };

    let video: VideoAttributes;
    let playlist: PlaylistAttributes;

    beforeEach(() => {
      memoryDatabase.clear();

      playlist = {
        id: '001',
        id_channel: '002',
        title: 'DevOps',
        price: 300,
        visibility: PlaylistVisibility.PUBLIC
      };

      video = {
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
        visibility: VideoVisibility.PUBLIC
      };
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

      const params = new URLSearchParams({
        email: env.pagSeguro.email,
        token: env.pagSeguro.sandbox.token
      }).toString();
      const uri = `/v2/checkout?${params}`;

      nock('https://ws.sandbox.pagseguro.uol.com.br')
        .post(uri)
        .reply(200, xmlCheckoutRedirect);

      const buyItem = createBuyItemUsecase();
      const url = await buyItem.execute(input);

      const expectedUrl = `${env.pagSeguro.sandbox.redirectUrl}?code=94915CFA4B4BEB1CC47D1F8629FB6AD3`;

      expect(url).toEqual(expectedUrl);
    });

    test('Deve ser comprado somente uma playlist', async () => {
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

    test('Deve lançar erro por não ter items no input para comprar', async () => {
      const buyItem = createBuyItemUsecase();

      const input1: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: []
      };

      const input2 = {
        id_authenticated_channel: '003'
      } as BuyItemUsecaseInput;

      const execute1 = async () => await buyItem.execute(input1);

      const execute2 = async () => await buyItem.execute(input2);

      await expect(execute1).rejects.toThrow(FieldsValidationError);

      await expect(execute2).rejects.toThrow(FieldsValidationError);
    });

    test('Deve lançar erro ao comprar um video que não existe', async () => {
      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: '001', type: ItemType.VIDEO }]
      };

      const buyItem = createBuyItemUsecase();

      const execute = async () => await buyItem.execute(input);
      await expect(execute).rejects.toThrow(
        new ImpossibleActionError(
          'Algum video não foi encontrado ou já foi comprado.'
        )
      );
    });

    test('Deve lançar erro ao comprar um video que é privado', async () => {
      video.visibility = VideoVisibility.PRIVATE;

      await videoRepository.create(video);

      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: video.id, type: ItemType.VIDEO }]
      };

      const buyItem = createBuyItemUsecase();

      const execute = async () => await buyItem.execute(input);
      await expect(execute).rejects.toThrow(
        new ImpossibleActionError('O video é privado.')
      );
    });

    test('Deve lançar erro ao comprar um video que é gratuito', async () => {
      video.price = 0;

      await videoRepository.create(video);

      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: video.id, type: ItemType.VIDEO }]
      };

      const buyItem = createBuyItemUsecase();

      const execute = async () => await buyItem.execute(input);
      await expect(execute).rejects.toThrow(
        new ImpossibleActionError('O video é gratuito.')
      );
    });

    test('Deve lançar erro ao comprador tentar comprar o proprio video', async () => {
      video.id_channel = '003';

      await videoRepository.create(video);

      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: video.id, type: ItemType.VIDEO }]
      };

      const buyItem = createBuyItemUsecase();

      const execute = async () => await buyItem.execute(input);
      await expect(execute).rejects.toThrow(
        new ImpossibleActionError(
          'O comprador é o dono do video que quer comprar.'
        )
      );
    });

    test('Deve lançar erro ao comprar um video que já foi comprado pelo comprador', async () => {
      const order: Omit<OrderAttributes, 'items'> = {
        id: '003',
        id_channel: '003'
      };
      const orderItem: OrderItemAttributes = {
        id: '004',
        id_order: order.id,
        id_purchased_item: video.id,
        type: 'video'
      };
      await orderRepository.createOrder(order);
      await orderRepository.createOrderItems([orderItem]);
      await videoRepository.create(video);

      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: '001', type: ItemType.VIDEO }]
      };

      const buyItem = createBuyItemUsecase();

      const execute = async () => await buyItem.execute(input);
      await expect(execute).rejects.toThrow(
        new ImpossibleActionError(
          'Algum video não foi encontrado ou já foi comprado.'
        )
      );
    });

    test('Deve lançar erro ao comprar uma playlist não existe', async () => {
      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: '001', type: ItemType.PLAYLIST }]
      };

      const buyItem = createBuyItemUsecase();

      const execute = async () => await buyItem.execute(input);
      await expect(execute).rejects.toThrow(
        new ImpossibleActionError(
          'Alguma playlist não foi encontrada ou já foi comprada.'
        )
      );
    });

    test('Deve lançar erro ao comprar uma playlist que é privada', async () => {
      playlist.visibility = PlaylistVisibility.PRIVATE;

      await playlistRepository.create(playlist);

      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: playlist.id, type: ItemType.PLAYLIST }]
      };

      const buyItem = createBuyItemUsecase();

      const execute = async () => await buyItem.execute(input);
      await expect(execute).rejects.toThrow(
        new ImpossibleActionError('A playlist é privada.')
      );
    });

    test('Deve lançar erro ao comprar uma playlist que é gratuita', async () => {
      playlist.price = 0;

      await playlistRepository.create(playlist);

      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: playlist.id, type: ItemType.PLAYLIST }]
      };

      const buyItem = createBuyItemUsecase();

      const execute = async () => await buyItem.execute(input);
      await expect(execute).rejects.toThrow(
        new ImpossibleActionError('A playlist é gratuita.')
      );
    });

    test('Deve lançar erro ao comprar uma playlist que é do próprio canal comprador', async () => {
      playlist.id_channel = '003';

      await playlistRepository.create(playlist);

      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: playlist.id, type: ItemType.PLAYLIST }]
      };

      const buyItem = createBuyItemUsecase();

      const execute = async () => await buyItem.execute(input);
      await expect(execute).rejects.toThrow(
        new ImpossibleActionError(
          'O comprador é o dono da playlist que quer comprar.'
        )
      );
    });

    test('Deve lançar erro ao comprar uma playlist que já foi comprada pelo comprador', async () => {
      const order: Omit<OrderAttributes, 'items'> = {
        id: '003',
        id_channel: '003'
      };
      const orderItem: OrderItemAttributes = {
        id: '004',
        id_order: order.id,
        id_purchased_item: playlist.id,
        type: 'playlist'
      };
      await orderRepository.createOrder(order);
      await orderRepository.createOrderItems([orderItem]);
      await playlistRepository.create(playlist);

      const input: BuyItemUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: playlist.id, type: ItemType.PLAYLIST }]
      };

      const buyItem = createBuyItemUsecase();

      const execute = async () => await buyItem.execute(input);
      await expect(execute).rejects.toThrow(
        new ImpossibleActionError(
          'Alguma playlist não foi encontrada ou já foi comprada.'
        )
      );
    });

    test('url', async () => {
      const videos: VideoAttributes[] = [
        { id: '001', id_channel: '', video: '', title: 'teste 1', price: 50.1 },
        { id: '002', title: 'teste 2', id_channel: '', video: '', price: 73.12 }
      ];
      const playlists: PlaylistAttributes[] = [
        { id: '003', title: 'teste 3', id_channel: '', price: 30.0 },
        { id: '004', title: 'teste 4', price: 130.0, id_channel: '' }
      ];

      const items: any[] = [...videos, ...playlists];

      // const pagseguro = new PagSeguro();
      // await pagseguro.execute(items);

      // const mercadopago = new MercadoPago();
      // await mercadopago.execute(items);
    });
  });
});
