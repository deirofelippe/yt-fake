import { NotFoundError } from '../../errors/NotFoundError';
import { Playlist, PlaylistAttributes } from '../entities/Playlist';
import { FactoryInterface } from '../factories/FactoryInterface';
import { ChannelRepositoryInterface } from '../repositories/ChannelRepositoryInterface';
import { PlaylistRepositoryInterface } from '../repositories/PlaylistRepositoryInterface';

export type CreatePlaylistInput = Omit<PlaylistAttributes, 'id_channel'> & {
  id_authenticated_channel: string;
};

export type CreatePlaylistDependencies = {
  playlistRepository: PlaylistRepositoryInterface;
  channelRepository: ChannelRepositoryInterface;
  playlistFactory: FactoryInterface<PlaylistAttributes, Playlist>;
};

export class CreatePlaylistUsecase {
  constructor(private readonly dependencies: CreatePlaylistDependencies) {}

  public async execute(input: CreatePlaylistInput): Promise<void> {
    const { channelRepository, playlistFactory, playlistRepository } =
      this.dependencies;

    const channelExists = await channelRepository.findById(
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

    const playlist = playlistFactory.create(playlistAttributes);

    await playlistRepository.create(playlist.getAttributes());
  }
}
