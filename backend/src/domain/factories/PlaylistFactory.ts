import { CloneObject } from '../../utils/CloneObject';
import {
  PlaylistAttributes,
  PlaylistDependencies,
  Playlist
} from '../entities/Playlist';
import { CreatePlaylistUsecaseInput } from '../usecases/CreatePlaylistUsecase';
import { FactoryInterface } from './FactoryInterface';

export class PlaylistFactory implements FactoryInterface<Playlist> {
  constructor(private readonly dependencies: PlaylistDependencies) {}
  recreate(attributes: PlaylistAttributes): Playlist {
    return Playlist.create(attributes);
  }

  create(input: CreatePlaylistUsecaseInput) {
    const clonedInput = CloneObject.clone(input);

    const id = this.dependencies.idGenerator.generate();
    const { id_authenticated_channel: id_channel } = clonedInput;
    delete clonedInput.id_authenticated_channel;
    const playlistAttributes: PlaylistAttributes = {
      ...clonedInput,
      id,
      id_channel
    };

    return Playlist.create(playlistAttributes);
  }
}
