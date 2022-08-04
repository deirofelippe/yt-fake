import { Channel, ChannelAttributes } from '../entities/Channel';

export interface ChannelRepositoryInterface {
  findAll(): Promise<Channel[] | []>;
  findById(id: string): Promise<Channel | undefined>;
  create(channel: ChannelAttributes): Promise<void>;
}
