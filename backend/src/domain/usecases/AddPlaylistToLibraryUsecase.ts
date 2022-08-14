import { ImpossibleActionError } from '../../errors/ImpossibleActionError';
import { NotFoundError } from '../../errors/NotFoundError';
import { PlaylistRepositoryInterface } from '../repositories/PlaylistRepositoryInterface';

export type AddPlaylistToLibraryUsecaseDependencies = {
  playlistRepository: PlaylistRepositoryInterface;
};
export type AddPlaylistToLibraryUsecaseInput = {
  id_authenticated_channel: string;
  id_playlist: string;
};
export type LibraryAttributes = { id_channel: string; id_playlist: string };

export class AddPlaylistToLibraryUsecase {
  constructor(private dependencies: AddPlaylistToLibraryUsecaseDependencies) {}
  public async execute(input: AddPlaylistToLibraryUsecaseInput): Promise<void> {
    const { playlistRepository } = this.dependencies;

    const playlist = await playlistRepository.findById(input.id_playlist);
    if (!playlist) throw new NotFoundError(input.id_playlist, 'Playlist');

    const playlistIsInLibrary = await playlistRepository.findPlaylistInLibrary({
      id_playlist: input.id_playlist,
      id_channel: input.id_authenticated_channel
    });
    if (playlistIsInLibrary)
      throw new ImpossibleActionError('A playlist já está na library.');

    if (playlist.channelIsTheSame(input.id_authenticated_channel))
      throw new ImpossibleActionError(
        'Não pode adicionar a própria playlist na própria library, ela já foi adicionada.'
      );

    if (playlist.isNotFree())
      throw new ImpossibleActionError(
        'Não pode adicionar playlist paga de terceiro na própria library.'
      );

    if (playlist.isPrivate())
      throw new ImpossibleActionError(
        'Não pode adicionar playlist private de terceiro na própria library.'
      );

    await playlistRepository.addToLibrary({
      id_channel: input.id_authenticated_channel,
      id_playlist: input.id_playlist
    });
  }
}
