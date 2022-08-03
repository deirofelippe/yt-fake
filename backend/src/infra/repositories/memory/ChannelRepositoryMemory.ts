import { ChannelAttributes } from '../../../domain/entities/Channel';
import { ChannelRepositoryInterface } from '../../../domain/repositories/ChannelRepositoryInterface';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class ChannelRepositoryMemory implements ChannelRepositoryInterface {
  constructor(private memoryDatabase: MemoryDatabase) {}
  async findAll(): Promise<ChannelAttributes[] | []> {
    return Promise.resolve(this.memoryDatabase.channels);
  }
  async findById(id: string): Promise<ChannelAttributes | undefined> {
    const channelFound = this.memoryDatabase.channels.find(
      (channel) => channel.id === id
    );

    if (!channelFound) return Promise.resolve(undefined);

    return Promise.resolve(channelFound);
  }
  async create(channel: ChannelAttributes): Promise<void> {
    Promise.resolve(
      this.memoryDatabase.channels.push({
        ...channel
      })
    );
  }
}
