import { ChannelNotFoundError } from '../../errors/ChannelNotFoundError';
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

  public async execute(playlist: PlaylistAttributes) {
    const channelExists = await this.dependencies.channelRepository.findById(
      playlist.id_channel
    );

    if (!channelExists) {
      throw new ChannelNotFoundError(playlist.id_channel);
    }

    const newPlaylist = new Playlist(playlist, {
      idGenerator: this.dependencies.idGenerator,
      validator: this.dependencies.playlistValidator
    });

    await this.dependencies.playlistRepository.create(newPlaylist);
  }
}
