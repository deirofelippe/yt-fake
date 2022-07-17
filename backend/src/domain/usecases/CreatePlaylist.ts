import { NotFoundError } from '../../errors/NotFoundError';
import { Playlist, PlaylistAttributes } from '../entities/Playlist';
import { IDGenerator } from '../libs/IDGenerator';
import { Validator } from '../libs/Validator';
import { ChannelRepository } from '../repositories/ChannelRepository';
import { PlaylistRepository } from '../repositories/PlaylistRepository';

type CreatePlaylistDependencies = {
  playlistRepository: PlaylistRepository;
  channelRepository: ChannelRepository;
  playlistValidator: Validator;
  idGenerator: IDGenerator;
};

export class CreatePlaylist {
  constructor(private dependencies: CreatePlaylistDependencies) {}

  public async execute(input: PlaylistAttributes): Promise<void> {
    const channelExists = await this.dependencies.channelRepository.findById(
      input.id_channel
    );

    if (!channelExists) {
      throw new NotFoundError(input.id_channel, 'Channel');
    }

    const playlist = new Playlist(input, {
      idGenerator: this.dependencies.idGenerator,
      validator: this.dependencies.playlistValidator
    });

    await this.dependencies.playlistRepository.create(playlist.getAttributes());
  }
}
