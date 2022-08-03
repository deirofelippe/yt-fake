import {
  PlaylistAttributes,
  PlaylistDependencies,
  Playlist
} from '../entities/Playlist';
import { FactoryInterface } from './FactoryInterface';

export class PlaylistFactory
  implements FactoryInterface<PlaylistAttributes, Playlist>
{
  constructor(private readonly dependencies: PlaylistDependencies) {}

  create(attributes: PlaylistAttributes) {
    const { idGenerator, validator } = this.dependencies;

    const id = idGenerator.generate();
    attributes.id = id;
    validator.execute(attributes);
    return Playlist.create(attributes);
  }
}
