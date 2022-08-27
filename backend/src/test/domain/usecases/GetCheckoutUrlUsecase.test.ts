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
  GetCheckoutUrlUsecase,
  GetCheckoutUrlUsecaseInput,
  ItemType
} from '../../../domain/usecases/GetCheckoutUrlUsecase';
import { throws } from 'smid';
import { env } from '../../../env';
import { FieldsValidationError } from '../../../errors/FieldsValidationError';
import { ImpossibleActionError } from '../../../errors/ImpossibleActionError';
import { CryptoIDGenerator } from '../../../infra/libs/CryptoIDGenerator';
import { PagSeguro } from '../../../infra/libs/paymentGateway/PagSeguro';
import { OrderRepositoryMemory } from '../../../infra/repositories/memory/OrderRepositoryMemory';
import { PlaylistRepositoryMemory } from '../../../infra/repositories/memory/PlaylistRepositoryMemory';
import { VideoRepositoryMemory } from '../../../infra/repositories/memory/VideoRepositoryMemory';
import { MemoryDatabase } from '../../MemoryDatabase';
import { xmlCheckoutRedirect } from './__mocks__/mockPagseguroResponses';
import faker from '@faker-js/faker';
import { randomUUID } from 'crypto';

describe('GetCheckoutUrlUsecase', () => {
  describe('Comprar items', () => {
    const memoryDatabase = new MemoryDatabase();
    const idGenerator = new CryptoIDGenerator();
    const videoFactory = new VideoFactory({
      idGenerator
    });
    const playlistFactory = new PlaylistFactory({
      idGenerator
    });
    const orderFactory = new OrderFactory({
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
    const paymentGateway = new PagSeguro();

    const createGetCheckoutUrlUsecase = (): GetCheckoutUrlUsecase => {
      return new GetCheckoutUrlUsecase({
        paymentGateway,
        playlistRepository,
        videoRepository,
        orderFactory,
        orderRepository
      });
    };

    let video: VideoAttributes;
    let playlist: PlaylistAttributes;

    const staticVideoValues: VideoAttributes = {
      video: 'https://acidic-unibody.com',
      thumbnail: 'http://loremflickr.com/640/480',
      description:
        'New ABC 13 9370, 13.3, 5th Gen CoreA5-8250U, 8GB RAM, 256GB SSD, power UHD Graphics, OS 10 Home, OS Office A & J 2016',
      dislikes: 12070,
      likes: 25107,
      views: 20290,
      id: 'd722f675-7ec3-429d-9cc4-957cc216fe26',
      id_channel: '002',
      title: 'Recycled Fresh Mouse',
      price: 353,
      visibility: VideoVisibility.PUBLIC
    };
    const staticPlaylistValues: PlaylistAttributes = {
      description:
        'The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality',
      id: '96b9e83f-369d-46ac-a3eb-bca525389beb',
      id_channel: '002',
      title: 'Licensed Metal Tuna',
      price: 571,
      visibility: PlaylistVisibility.PUBLIC
    };

    const createFakeVideo = (): VideoAttributes => {
      return {
        video: faker.internet.url(),
        thumbnail: faker.image.imageUrl(),
        description: faker.commerce.productDescription(),
        dislikes: faker.datatype.number({ min: 0 }),
        likes: faker.datatype.number({ min: 0 }),
        views: faker.datatype.number({ min: 0 }),
        id: randomUUID(),
        id_channel: '002',
        title: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price(5, 1000, 2)),
        visibility: VideoVisibility.PUBLIC
      };
    };
    const createFakePlaylist = (): PlaylistAttributes => {
      return {
        description: faker.commerce.productDescription(),
        id: randomUUID(),
        id_channel: '002',
        title: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price(5, 1000, 2)),
        visibility: PlaylistVisibility.PUBLIC
      };
    };

    beforeEach(() => {
      memoryDatabase.clear();

      playlist = createFakePlaylist();
      video = createFakeVideo();
    });

    test('Deve ser retornado uma url ao comprar um video e uma playlist', async () => {
      await videoRepository.create(staticVideoValues);
      await playlistRepository.create(staticPlaylistValues);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [
          { id: staticVideoValues.id, type: ItemType.VIDEO },
          { id: staticPlaylistValues.id, type: ItemType.PLAYLIST }
        ]
      };

      const params = new URLSearchParams({
        email: env.pagSeguro.email,
        token: env.pagSeguro.sandbox.token
      }).toString();
      const uri = `/v2/checkout?${params}`;

      nock('https://ws.sandbox.pagseguro.uol.com.br')
        .post(
          uri,
          'itemId1=001&itemAmount1=30.00&itemDescription1=Docker&itemQuantity1=1&itemId2=001&itemAmount2=300.00&itemDescription2=DevOps&itemQuantity2=1&currency=BRL&redirectURL=https%3A%2F%2Fc517-2804-14d-5c33-566b-77cb-ac6c-afe-36c4.ngrok.io%2Fps%2Ffeedback&notificationURL=https%3A%2F%2Fc517-2804-14d-5c33-566b-77cb-ac6c-afe-36c4.ngrok.io%2Fps%2Ffeedback'
        )
        .reply(200, xmlCheckoutRedirect);

      const createOrderUsecase = createGetCheckoutUrlUsecase();
      const url = await createOrderUsecase.execute(input);

      const expectedUrl = `${env.pagSeguro.sandbox.redirectUrl}?code=94915CFA4B4BEB1CC47D1F8629FB6AD3`;

      expect(uri).toEqual('/v2/checkout?email=test%40email.com&token=12345');
      expect(url).toEqual(expectedUrl);
    });

    test('Deve ser cadastrado uma order ao comprar um video e uma playlist', async () => {
      await videoRepository.create(staticVideoValues);
      await playlistRepository.create(staticPlaylistValues);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [
          { id: staticVideoValues.id, type: ItemType.VIDEO },
          { id: staticPlaylistValues.id, type: ItemType.PLAYLIST }
        ]
      };

      const createOrderUsecase = new GetCheckoutUrlUsecase({
        paymentGateway: {
          getCheckoutRedirectUrl: async () => 'teste',
          transactionConsulting: () => ''
        },
        playlistRepository,
        videoRepository,
        orderFactory,
        orderRepository
      });

      const url = await createOrderUsecase.execute(input);

      const orders = await orderRepository.findAllOrders(
        input.id_authenticated_channel
      );
      const expectedOrders = orders.map((order) => ({
        ...order.getOrderWithItems()
      }));

      expect(expectedOrders).toEqual([
        expect.objectContaining<OrderAttributes>({
          id: expect.any(String),
          id_channel: input.id_authenticated_channel,
          transaction: { status: 'Aguardando pagamento' },
          items: [
            {
              id: expect.any(String),
              id_order: expect.any(String),
              id_purchased_item: input.items[0].id,
              type: input.items[0].type
            },
            {
              id: expect.any(String),
              id_order: expect.any(String),
              id_purchased_item: input.items[1].id,
              type: input.items[1].type
            }
          ]
        })
      ]);
      expect(url).toEqual('teste');
    });

    test('Deve ser retornado uma url ao comprar somente uma playlist', async () => {
      await playlistRepository.create(staticPlaylistValues);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: staticPlaylistValues.id, type: ItemType.PLAYLIST }]
      };

      const params = new URLSearchParams({
        email: env.pagSeguro.email,
        token: env.pagSeguro.sandbox.token
      }).toString();
      const uri = `/v2/checkout?${params}`;

      nock('https://ws.sandbox.pagseguro.uol.com.br')
        .post(
          uri,
          'itemId1=001&itemAmount1=300.00&itemDescription1=DevOps&itemQuantity1=1&currency=BRL&redirectURL=https%3A%2F%2Fc517-2804-14d-5c33-566b-77cb-ac6c-afe-36c4.ngrok.io%2Fps%2Ffeedback&notificationURL=https%3A%2F%2Fc517-2804-14d-5c33-566b-77cb-ac6c-afe-36c4.ngrok.io%2Fps%2Ffeedback'
        )
        .reply(200, xmlCheckoutRedirect);

      const createOrderUsecase = createGetCheckoutUrlUsecase();
      const url = await createOrderUsecase.execute(input);

      const expectedUrl = `${env.pagSeguro.sandbox.redirectUrl}?code=94915CFA4B4BEB1CC47D1F8629FB6AD3`;

      expect(url).toEqual(expectedUrl);
    });

    test('Deve ser cadastrado uma order ao comprar somente uma playlist', async () => {
      await playlistRepository.create(staticPlaylistValues);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: staticPlaylistValues.id, type: ItemType.PLAYLIST }]
      };

      const createOrderUsecase = new GetCheckoutUrlUsecase({
        paymentGateway: {
          getCheckoutRedirectUrl: async () => 'teste',
          transactionConsulting: () => ''
        },
        playlistRepository,
        videoRepository,
        orderFactory,
        orderRepository
      });

      const url = await createOrderUsecase.execute(input);

      const orders = await orderRepository.findAllOrders(
        input.id_authenticated_channel
      );
      const expectedOrders = orders.map((order) => ({
        ...order.getOrderWithItems()
      }));

      expect(expectedOrders).toEqual([
        expect.objectContaining<OrderAttributes>({
          id: expect.any(String),
          id_channel: input.id_authenticated_channel,
          transaction: { status: 'Aguardando pagamento' },
          items: [
            {
              id: expect.any(String),
              id_order: expect.any(String),
              id_purchased_item: input.items[0].id,
              type: input.items[0].type
            }
          ]
        })
      ]);
      expect(url).toEqual('teste');
    });

    test('Deve ser retornado uma url ao comprar somente um video', async () => {
      await videoRepository.create(staticVideoValues);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: staticVideoValues.id, type: ItemType.VIDEO }]
      };

      const params = new URLSearchParams({
        email: env.pagSeguro.email,
        token: env.pagSeguro.sandbox.token
      }).toString();
      const uri = `/v2/checkout?${params}`;

      nock('https://ws.sandbox.pagseguro.uol.com.br')
        .post(
          uri,
          'itemId1=001&itemAmount1=30.00&itemDescription1=Docker&itemQuantity1=1&currency=BRL&redirectURL=https%3A%2F%2Fc517-2804-14d-5c33-566b-77cb-ac6c-afe-36c4.ngrok.io%2Fps%2Ffeedback&notificationURL=https%3A%2F%2Fc517-2804-14d-5c33-566b-77cb-ac6c-afe-36c4.ngrok.io%2Fps%2Ffeedback'
        )
        .reply(200, xmlCheckoutRedirect);

      const createOrderUsecase = createGetCheckoutUrlUsecase();
      const url = await createOrderUsecase.execute(input);

      const expectedUrl = `${env.pagSeguro.sandbox.redirectUrl}?code=94915CFA4B4BEB1CC47D1F8629FB6AD3`;

      expect(url).toEqual(expectedUrl);
    });

    test('Deve ser cadastrado uma order ao comprar somente um video', async () => {
      await videoRepository.create(staticVideoValues);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: staticVideoValues.id, type: ItemType.VIDEO }]
      };

      const createOrderUsecase = new GetCheckoutUrlUsecase({
        paymentGateway: {
          getCheckoutRedirectUrl: async () => 'teste',
          transactionConsulting: () => ''
        },
        playlistRepository,
        videoRepository,
        orderFactory,
        orderRepository
      });

      const url = await createOrderUsecase.execute(input);

      const orders = await orderRepository.findAllOrders(
        input.id_authenticated_channel
      );
      const expectedOrders = orders.map((order) => ({
        ...order.getOrderWithItems()
      }));

      expect(expectedOrders).toEqual([
        expect.objectContaining<OrderAttributes>({
          id: expect.any(String),
          id_channel: input.id_authenticated_channel,
          transaction: { status: 'Aguardando pagamento' },
          items: [
            {
              id: expect.any(String),
              id_order: expect.any(String),
              id_purchased_item: input.items[0].id,
              type: input.items[0].type
            }
          ]
        })
      ]);
      expect(url).toEqual('teste');
    });

    test('Deve lançar erro por não ter items no input para comprar', async () => {
      const createOrderUsecase = createGetCheckoutUrlUsecase();

      const input1: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: []
      };
      const input2 = {
        id_authenticated_channel: '003'
      } as GetCheckoutUrlUsecaseInput;

      const error1: FieldsValidationError = await throws(
        async () => await createOrderUsecase.execute(input1)
      );
      const error2: FieldsValidationError = await throws(
        async () => await createOrderUsecase.execute(input2)
      );

      expect(error1).toBeInstanceOf(FieldsValidationError);
      expect(error1.message).toEqual('Campo(s) inválido(s).');

      expect(error2).toBeInstanceOf(FieldsValidationError);
      expect(error2.message).toEqual('Campo(s) inválido(s).');
    });

    test('Deve lançar erro ao comprar um video que não existe', async () => {
      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: '001', type: ItemType.VIDEO }]
      };

      const createOrderUsecase = createGetCheckoutUrlUsecase();

      const error: ImpossibleActionError = await throws(
        async () => await createOrderUsecase.execute(input)
      );

      expect(error).toBeInstanceOf(ImpossibleActionError);
      expect(error.message).toEqual(
        'Algum video não foi encontrado ou já foi comprado.'
      );
    });

    test('Deve lançar erro ao comprar um video que é privado', async () => {
      video.visibility = VideoVisibility.PRIVATE;

      await videoRepository.create(video);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: video.id, type: ItemType.VIDEO }]
      };

      const createOrderUsecase = createGetCheckoutUrlUsecase();

      const error: ImpossibleActionError = await throws(
        async () => await createOrderUsecase.execute(input)
      );

      expect(error).toBeInstanceOf(ImpossibleActionError);
      expect(error.message).toEqual('O video é privado.');
    });

    test('Deve lançar erro ao comprar um video que é gratuito', async () => {
      video.price = 0;

      await videoRepository.create(video);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: video.id, type: ItemType.VIDEO }]
      };

      const createOrderUsecase = createGetCheckoutUrlUsecase();

      const error: ImpossibleActionError = await throws(
        async () => await createOrderUsecase.execute(input)
      );

      expect(error).toBeInstanceOf(ImpossibleActionError);
      expect(error.message).toEqual('O video é gratuito.');
    });

    test('Deve lançar erro ao comprador tentar comprar o proprio video', async () => {
      video.id_channel = '003';

      await videoRepository.create(video);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: video.id, type: ItemType.VIDEO }]
      };

      const createOrderUsecase = createGetCheckoutUrlUsecase();

      const error: ImpossibleActionError = await throws(
        async () => await createOrderUsecase.execute(input)
      );

      expect(error).toBeInstanceOf(ImpossibleActionError);
      expect(error.message).toEqual(
        'O comprador é o dono do video que quer comprar.'
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

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: '001', type: ItemType.VIDEO }]
      };

      const createOrderUsecase = createGetCheckoutUrlUsecase();

      const error: ImpossibleActionError = await throws(
        async () => await createOrderUsecase.execute(input)
      );

      expect(error).toBeInstanceOf(ImpossibleActionError);
      expect(error.message).toEqual(
        'Algum video não foi encontrado ou já foi comprado.'
      );
    });

    test('Deve lançar erro ao comprar uma playlist não existe', async () => {
      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: '001', type: ItemType.PLAYLIST }]
      };

      const createOrderUsecase = createGetCheckoutUrlUsecase();

      const execute = async () => await createOrderUsecase.execute(input);
      await expect(execute).rejects.toThrow(
        new ImpossibleActionError(
          'Alguma playlist não foi encontrada ou já foi comprada.'
        )
      );
    });

    test('Deve lançar erro ao comprar uma playlist que é privada', async () => {
      playlist.visibility = PlaylistVisibility.PRIVATE;

      await playlistRepository.create(playlist);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: playlist.id, type: ItemType.PLAYLIST }]
      };

      const createOrderUsecase = createGetCheckoutUrlUsecase();

      const error: ImpossibleActionError = await throws(
        async () => await createOrderUsecase.execute(input)
      );

      expect(error).toBeInstanceOf(ImpossibleActionError);
      expect(error.message).toEqual('A playlist é privada.');
    });

    test('Deve lançar erro ao comprar uma playlist que é gratuita', async () => {
      playlist.price = 0;

      await playlistRepository.create(playlist);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: playlist.id, type: ItemType.PLAYLIST }]
      };

      const createOrderUsecase = createGetCheckoutUrlUsecase();

      const error: ImpossibleActionError = await throws(
        async () => await createOrderUsecase.execute(input)
      );

      expect(error).toBeInstanceOf(ImpossibleActionError);
      expect(error.message).toEqual('A playlist é gratuita.');
    });

    test('Deve lançar erro ao comprar uma playlist que é do próprio canal comprador', async () => {
      playlist.id_channel = '003';

      await playlistRepository.create(playlist);

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: playlist.id, type: ItemType.PLAYLIST }]
      };

      const createOrderUsecase = createGetCheckoutUrlUsecase();

      const error: ImpossibleActionError = await throws(
        async () => await createOrderUsecase.execute(input)
      );

      expect(error).toBeInstanceOf(ImpossibleActionError);
      expect(error.message).toEqual(
        'O comprador é o dono da playlist que quer comprar.'
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

      const input: GetCheckoutUrlUsecaseInput = {
        id_authenticated_channel: '003',
        items: [{ id: playlist.id, type: ItemType.PLAYLIST }]
      };

      const createOrderUsecase = createGetCheckoutUrlUsecase();

      const error: ImpossibleActionError = await throws(
        async () => await createOrderUsecase.execute(input)
      );

      expect(error).toBeInstanceOf(ImpossibleActionError);
      expect(error.message).toEqual(
        'Alguma playlist não foi encontrada ou já foi comprada.'
      );
    });
  });
});
