import { NotFoundError } from '../../errors/NotFoundError';
import { Playlist, PlaylistAttributes } from '../entities/Playlist';
import { EntityFactoryInterface } from '../factories/entities/EntityFactoryInterface';
import { ChannelRepositoryInterface } from '../repositories/ChannelRepositoryInterface';
import { PlaylistRepositoryInterface } from '../repositories/PlaylistRepositoryInterface';

export type CreatePlaylistUsecaseInput = Omit<
  PlaylistAttributes,
  'id_channel' | 'id'
> & {
  id_authenticated_channel: string;
};

export type CreatePlaylistUsecaseDependencies = {
  playlistRepository: PlaylistRepositoryInterface;
  channelRepository: ChannelRepositoryInterface;
  playlistFactory: EntityFactoryInterface<Playlist>;
};

export class CreatePlaylistUsecase {
  constructor(
    private readonly dependencies: CreatePlaylistUsecaseDependencies
  ) {}

  public async execute(input: CreatePlaylistUsecaseInput): Promise<void> {
    const { channelRepository, playlistFactory, playlistRepository } =
      this.dependencies;

    const channelExists = await channelRepository.findById(
      input.id_authenticated_channel
    );

    if (!channelExists) {
      throw new NotFoundError(input.id_authenticated_channel, 'Channel');
    }

    const playlist = playlistFactory.create(input);

    const library = {
      id_channel: input.id_authenticated_channel,
      id_playlist: playlist.id
    };

    await playlistRepository.create(playlist.getAttributes());
    await playlistRepository.addToLibrary(library);
  }
}
