import {
  ChannelAttributes,
  ChannelDependencies,
  Channel
} from '../entities/Channel';
import { FactoryInterface } from './FactoryInterface';

export class ChannelFactory implements FactoryInterface<Channel> {
  constructor(private readonly dependencies?: ChannelDependencies) {}
  recreate(attributes: ChannelAttributes): Channel {
    if (!attributes.id)
      throw Error(
        'MountExisting da factory precisa de dados já cadastrados no banco.'
      );

    return Channel.create(attributes);
  }

  create(attributes: ChannelAttributes) {
    if (!this.dependencies)
      throw Error('Create da factory está sem dependencias.');

    attributes.id = this.dependencies.idGenerator.generate();
    return Channel.create(attributes);
  }
}
