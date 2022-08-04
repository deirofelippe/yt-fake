import { Validator } from '../../libs/Validator';
import {
  AddVideoToPlaylistUsecaseDependencies,
  AddVideoToPlaylistUsecase,
  AddVideoToPlaylistUsecaseInput
} from '../../usecases/AddVideoToPlaylistUsecase';
import { UsecaseFactoryInterface } from './UsecaseFactoryInterface';

export type AddVideoToPlaylistUsecaseFactoryDependencies = {
  factory: {
    validator: Validator;
  };
  usecase: AddVideoToPlaylistUsecaseDependencies;
};

export class AddVideoToPlaylistUsecaseFactory
  implements
    UsecaseFactoryInterface<
      AddVideoToPlaylistUsecase,
      AddVideoToPlaylistUsecaseInput
    >
{
  constructor(
    private readonly dependencies: AddVideoToPlaylistUsecaseFactoryDependencies
  ) {}

  create(input: AddVideoToPlaylistUsecaseInput) {
    const {
      factory: { validator },
      usecase: { playlistRepository, idGenerator, videoRepository }
    } = this.dependencies;

    validator.execute(input);

    return new AddVideoToPlaylistUsecase({
      playlistRepository,
      idGenerator,
      videoRepository
    });
  }
}
