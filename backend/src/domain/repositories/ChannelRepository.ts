import { ChannelDTO } from '../dto/ChannelDTO';
import { Channel } from '../entities/Channel';

export interface ChannelRepository {
  findAll(): Promise<ChannelDTO[]>;
  findById(id: string): Promise<ChannelDTO>;
  create(channel: Channel): Promise<void>;
}
