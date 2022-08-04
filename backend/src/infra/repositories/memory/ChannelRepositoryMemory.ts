import { Channel, ChannelAttributes } from '../../../domain/entities/Channel';
import { FactoryInterface } from '../../../domain/factories/FactoryInterface';
import { ChannelRepositoryInterface } from '../../../domain/repositories/ChannelRepositoryInterface';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class ChannelRepositoryMemory implements ChannelRepositoryInterface {
  constructor(
    private readonly memoryDatabase: MemoryDatabase,
    private readonly channelFactory: FactoryInterface<Channel>
  ) {}

  async findAll(): Promise<Channel[] | []> {
    return this.memoryDatabase.channels.map((channel) =>
      this.channelFactory.recreate(channel)
    );
  }
  async findById(id: string): Promise<Channel | undefined> {
    const channelFound = this.memoryDatabase.channels.find(
      (channel) => channel.id === id
    );

    if (!channelFound) return undefined;

    return this.channelFactory.recreate(channelFound);
  }
  async create(channel: ChannelAttributes): Promise<void> {
    this.memoryDatabase.channels.push({
      ...channel
    });
  }
}
