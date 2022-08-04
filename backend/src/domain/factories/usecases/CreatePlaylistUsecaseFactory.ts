import { Validator } from '../../libs/Validator';
import {
  CreatePlaylistUsecaseDependencies,
  CreatePlaylistUsecase,
  CreatePlaylistUsecaseInput
} from '../../usecases/CreatePlaylistUsecase';
import { UsecaseFactoryInterface } from './UsecaseFactoryInterface';

export type CreatePlaylistUsecaseFactoryDependencies = {
  factory: {
    validator: Validator;
  };
  usecase: CreatePlaylistUsecaseDependencies;
};

export class CreatePlaylistUsecaseFactory
  implements
    UsecaseFactoryInterface<CreatePlaylistUsecase, CreatePlaylistUsecaseInput>
{
  constructor(
    private readonly dependencies: CreatePlaylistUsecaseFactoryDependencies
  ) {}

  create(input: CreatePlaylistUsecaseInput) {
    const {
      factory: { validator },
      usecase: { channelRepository, playlistFactory, playlistRepository }
    } = this.dependencies;

    validator.execute(input);

    return new CreatePlaylistUsecase({
      channelRepository,
      playlistFactory,
      playlistRepository
    });
  }
}
