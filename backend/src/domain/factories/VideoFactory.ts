import { VideoAttributes, VideoDependencies, Video } from '../entities/Video';
import { FactoryInterface } from './FactoryInterface';

export class VideoFactory implements FactoryInterface<Video> {
  constructor(private readonly dependencies?: VideoDependencies) {}
  recreate(attributes: VideoAttributes): Video {
    if (!attributes.id)
      throw Error(
        'MountExisting da factory precisa de dados já cadastrados no banco.'
      );

    return Video.create(attributes);
  }

  create(attributes: VideoAttributes) {
    if (!this.dependencies)
      throw Error('Create da factory está sem dependencias.');

    attributes.id = this.dependencies.idGenerator.generate();
    return Video.create(attributes);
  }
}
