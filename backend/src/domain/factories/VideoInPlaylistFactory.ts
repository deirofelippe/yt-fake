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
    const id = dependencies.idGenerator.generate();
    attributes.id = id;
    dependencies.validator.execute(attributes);
    return VideoInPlaylist.create(attributes);
  }
}
