import {
  PlaylistAttributes,
  PlaylistDependencies,
  Playlist
} from '../entities/Playlist';
import { FactoryInterface } from './FactoryInterface';

export class PlaylistFactory
  implements
    FactoryInterface<PlaylistAttributes, PlaylistDependencies, Playlist>
{
  create(attributes: PlaylistAttributes, dependencies: PlaylistDependencies) {
    const id = dependencies.idGenerator.generate();
    attributes.id = id;
    dependencies.validator.execute(attributes);
    return Playlist.create(attributes);
  }
}
