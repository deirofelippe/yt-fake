import { NotFoundError } from '../../errors/NotFoundError';
import {
  Playlist,
  PlaylistAttributes,
  PlaylistDependencies
} from '../entities/Playlist';
import { FactoryInterface } from '../factories/FactoryInterface';
import { IDGenerator } from '../libs/IDGenerator';
import { Validator } from '../libs/Validator';
import { ChannelRepository } from '../repositories/ChannelRepository';
import { PlaylistRepository } from '../repositories/PlaylistRepository';

export type CreatePlaylistInput = Omit<PlaylistAttributes, 'id_channel'> & {
  id_authenticated_channel: string;
};

export type CreatePlaylistDependencies = {
  playlistRepository: PlaylistRepository;
  channelRepository: ChannelRepository;
  playlistValidator: Validator;
  idGenerator: IDGenerator;
  playlistFactory: FactoryInterface<
    PlaylistAttributes,
    PlaylistDependencies,
    Playlist
  >;
};

export class CreatePlaylist {
  constructor(private dependencies: CreatePlaylistDependencies) {}

  public async execute(input: CreatePlaylistInput): Promise<void> {
    const channelExists = await this.dependencies.channelRepository.findById(
      input.id_authenticated_channel
    );

    if (!channelExists) {
      throw new NotFoundError(input.id_authenticated_channel, 'Channel');
    }

    const playlistAttributes = {
      ...input,
      id_channel: input.id_authenticated_channel
    };
    delete playlistAttributes.id_authenticated_channel;

    const playlistDependencies = {
      idGenerator: this.dependencies.idGenerator,
      validator: this.dependencies.playlistValidator
    };
    const playlist = this.dependencies.playlistFactory.create(
      playlistAttributes,
      playlistDependencies
    );

    await this.dependencies.playlistRepository.create(playlist.getAttributes());
  }
}
