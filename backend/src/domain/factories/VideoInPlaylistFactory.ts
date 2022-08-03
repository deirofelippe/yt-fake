import {
  VideoInPlaylist,
  VideoInPlaylistAttributes,
  VideoInPlaylistDependencies
} from '../entities/VideoInPlaylist';
import { FactoryInterface } from './FactoryInterface';

export class VideoInPlaylistFactory
  implements FactoryInterface<VideoInPlaylistAttributes, VideoInPlaylist>
{
  constructor(private readonly dependencies: VideoInPlaylistDependencies) {}

  create(attributes: VideoInPlaylistAttributes) {
    const { idGenerator, validator } = this.dependencies;

    const id = idGenerator.generate();
    attributes.id = id;
    validator.execute(attributes);
    return VideoInPlaylist.create(attributes);
  }
}
