import { Validator } from '../../libs/Validator';
import {
  CreateOrderUsecaseDependencies,
  CreateOrderUsecase,
  CreateOrderUsecaseInput
} from '../../usecases/CreateOrderUsecase';
import { UsecaseFactoryInterface } from './UsecaseFactoryInterface';

export type CreateOrderUsecaseFactoryDependencies = {
  factory: {
    validator: Validator;
  };
  usecase: CreateOrderUsecaseDependencies;
};

export class CreateOrderUsecaseFactory
  implements
    UsecaseFactoryInterface<CreateOrderUsecase, CreateOrderUsecaseInput>
{
  constructor(
    private readonly dependencies: CreateOrderUsecaseFactoryDependencies
  ) {}

  create(input: CreateOrderUsecaseInput) {
    const {
      factory: { validator },
      usecase: {
        playlistRepository,
        videoRepository,
        paymentCheckoutRedirect,
        idGenerator,
        orderFactory,
        orderRepository
      }
    } = this.dependencies;

    validator.execute(input);

    return new CreateOrderUsecase({
      idGenerator,
      orderFactory,
      orderRepository,
      playlistRepository,
      paymentCheckoutRedirect,
      videoRepository
    });
  }
}
