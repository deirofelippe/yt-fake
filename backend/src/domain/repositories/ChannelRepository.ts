import { ChannelDTO } from '../dto/ChannelDTO';
import { Channel } from '../entities/Channel';

export interface ChannelRepository {
  findAll(): Promise<ChannelDTO[] | undefined>;
  findById(id: string): Promise<ChannelDTO | undefined>;
  create(channel: Channel): Promise<void>;
}
