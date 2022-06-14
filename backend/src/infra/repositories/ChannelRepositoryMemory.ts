import { ChannelRepository } from '../../domain/repositories/ChannelRepository';
import { MemoryDatabase } from '../../test/MemoryDatabase';

export class ChannelRepositoryMemory implements ChannelRepository {
  constructor(private memoryDatabase: MemoryDatabase) {}

  async findAll() {
    return this.memoryDatabase.channels;
  }
  async findById(id: string) {
    return Promise.resolve(
      this.memoryDatabase.channels.find((channel) => channel.id === id)
    );
  }
  async create(channel: object) {
    Promise.resolve(this.memoryDatabase.channels.push(channel));
  }
}
