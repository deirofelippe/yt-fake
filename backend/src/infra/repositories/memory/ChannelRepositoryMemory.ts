import { ChannelDTO } from '../../../domain/dto/ChannelDTO';
import { Channel, ChannelAttributes } from '../../../domain/entities/Channel';
import { ChannelRepository } from '../../../domain/repositories/ChannelRepository';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class ChannelRepositoryMemory implements ChannelRepository {
  constructor(private memoryDatabase: MemoryDatabase) {}
  async findAll(): Promise<ChannelDTO[] | undefined> {
    const channels = this.memoryDatabase.channels.map((channel) => {
      const channelDTO: ChannelDTO = {
        id: channel.id,
        ...channel
      };
      return channelDTO;
    });

    return Promise.resolve(channels);
  }
  async findById(id: string): Promise<ChannelDTO | undefined> {
    const channelFound = this.memoryDatabase.channels.find(
      (channel) => channel.id === id
    );

    if (!channelFound) return Promise.resolve(undefined);

    const channelDTO: ChannelDTO = {
      id: channelFound.id,
      ...channelFound
    };

    return Promise.resolve(channelDTO);
  }
  async create(channel: Channel): Promise<void> {
    Promise.resolve(
      this.memoryDatabase.channels.push({
        ...channel.getAttributes()
      })
    );
  }
}
