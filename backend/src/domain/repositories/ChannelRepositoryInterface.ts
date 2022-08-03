import { ChannelAttributes } from '../entities/Channel';

export interface ChannelRepositoryInterface {
  findAll(): Promise<ChannelAttributes[] | []>;
  findById(id: string): Promise<ChannelAttributes | undefined>;
  create(channel: ChannelAttributes): Promise<void>;
}
