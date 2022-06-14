import { randomUUID } from 'crypto';
import { ChannelRepository } from '../repositories/ChannelRepository';
import { PlaylistRepository } from '../repositories/PlaylistRepository';

export class CreatePlaylist {
  constructor(
    private playlistRepository: PlaylistRepository,
    private channelRepository: ChannelRepository
  ) {}

  public async execute(body: any, params: any) {
    const id_channel = params.id;
    const channelExists = await this.channelRepository.findById(id_channel);

    if (!channelExists) {
      throw new Error('Channel not exists.');
    }

    const playlist = {
      id: randomUUID(),
      id_channel,
      title: body.title,
      description: body.description,
      type: body.type,
      visibility: body.visibility
    };

    await this.playlistRepository.create(playlist);
  }
}
