export interface ChannelRepository {
  findAll(): Promise<any>;
  findById(id: string): Promise<any>;
  create(channel: object): Promise<any>;
}
