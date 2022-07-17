import {
  VideoInPlaylist,
  VideoInPlaylistAttributes,
  VideoInPlaylistDependencies
} from '../entities/VideoInPlaylist';
import { FactoryInterface } from './FactoryInterface';

export class VideoInPlaylistFactory
  implements
    FactoryInterface<
      VideoInPlaylistAttributes,
      VideoInPlaylistDependencies,
      VideoInPlaylist
    >
{
  create(
    attributes: VideoInPlaylistAttributes,
    dependencies: VideoInPlaylistDependencies
  ) {
    delete attributes.id;
    dependencies.validator.execute(attributes);
    const id = dependencies.idGenerator.generate();
    attributes.id = id;
    return VideoInPlaylist.create(attributes);
  }
}
