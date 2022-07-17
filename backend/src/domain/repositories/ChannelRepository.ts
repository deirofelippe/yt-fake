import { ChannelAttributes } from '../entities/Channel';

export interface ChannelRepository {
  findAll(): Promise<ChannelAttributes[] | undefined>;
  findById(id: string): Promise<ChannelAttributes | undefined>;
  create(channel: ChannelAttributes): Promise<void>;
}
