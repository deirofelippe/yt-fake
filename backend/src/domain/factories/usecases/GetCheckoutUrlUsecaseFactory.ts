import { Validator } from '../../libs/Validator';
import {
  GetCheckoutUrlUsecaseDependencies,
  GetCheckoutUrlUsecase,
  GetCheckoutUrlUsecaseInput
} from '../../usecases/GetCheckoutUrlUsecase';
import { UsecaseFactoryInterface } from './UsecaseFactoryInterface';

export type GetCheckoutUrlUsecaseFactoryDependencies = {
  factory: {
    validator: Validator;
  };
  usecase: GetCheckoutUrlUsecaseDependencies;
};

export class GetCheckoutUrlUsecaseFactory
  implements
    UsecaseFactoryInterface<GetCheckoutUrlUsecase, GetCheckoutUrlUsecaseInput>
{
  constructor(
    private readonly dependencies: GetCheckoutUrlUsecaseFactoryDependencies
  ) {}

  create(input: GetCheckoutUrlUsecaseInput) {
    const {
      factory: { validator },
      usecase: { playlistRepository, videoRepository, paymentGateway }
    } = this.dependencies;

    validator.execute(input);

    return new GetCheckoutUrlUsecase({
      playlistRepository,
      paymentGateway,
      videoRepository
    });
  }
}
