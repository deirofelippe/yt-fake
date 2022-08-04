import { Validator } from '../../libs/Validator';
import {
  BuyItemUsecaseDependencies,
  BuyItemUsecase,
  BuyItemUsecaseInput
} from '../../usecases/BuyItemUsecase';
import { UsecaseFactoryInterface } from './UsecaseFactoryInterface';

export type BuyItemUsecaseFactoryDependencies = {
  factory: {
    validator: Validator;
  };
  usecase: BuyItemUsecaseDependencies;
};

export class BuyItemUsecaseFactory
  implements UsecaseFactoryInterface<BuyItemUsecase, BuyItemUsecaseInput>
{
  constructor(
    private readonly dependencies: BuyItemUsecaseFactoryDependencies
  ) {}

  create(input: BuyItemUsecaseInput) {
    const {
      factory: { validator },
      usecase: {
        orderFactory,
        orderRepository,
        playlistRepository,
        videoRepository
      }
    } = this.dependencies;

    validator.execute(input);

    return new BuyItemUsecase({
      orderFactory,
      orderRepository,
      playlistRepository,
      videoRepository
    });
  }
}
