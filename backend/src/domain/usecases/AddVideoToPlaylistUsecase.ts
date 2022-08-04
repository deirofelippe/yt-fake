import { NotAuthorizedError } from '../../errors/NotAuthorizedError';
import { NotFoundError } from '../../errors/NotFoundError';
import { IDGenerator } from '../libs/IDGenerator';
import { PlaylistRepositoryInterface } from '../repositories/PlaylistRepositoryInterface';
import { VideoRepositoryInterface } from '../repositories/VideoRepositoryInterface';

export type AddVideoToPlaylistUsecaseInput = {
  id_authenticated_channel: string;
  id_referenced_video: string;
  id_playlist: string;
};

export type AddVideoToPlaylistUsecaseDependencies = {
  playlistRepository: PlaylistRepositoryInterface;
  videoRepository: VideoRepositoryInterface;
  idGenerator: IDGenerator;
};

export type VideoInPlaylistAttributes = {
  id?: string;
  id_referenced_video: string;
  id_playlist: string;
};

export class AddVideoToPlaylistUsecase {
  constructor(
    private readonly dependencies: AddVideoToPlaylistUsecaseDependencies
  ) {}

  public async execute(input: AddVideoToPlaylistUsecaseInput) {
    const { playlistRepository, videoRepository, idGenerator } =
      this.dependencies;

    const videoInPlaylist: VideoInPlaylistAttributes = {
      id_playlist: input.id_playlist,
      id_referenced_video: input.id_referenced_video,
      id: idGenerator.generate()
    };

    const playlistFound = await playlistRepository.findById(
      videoInPlaylist.id_playlist
    );

    if (!playlistFound)
      throw new NotFoundError(videoInPlaylist.id_playlist, 'Playlist');

    const videoFound = await videoRepository.findById(
      videoInPlaylist.id_playlist
    );

    if (!videoFound)
      throw new NotFoundError(videoInPlaylist.id_playlist, 'Video');

    const notOwnsThePlaylist = playlistFound.channelsIsNotTheSame(
      input.id_authenticated_channel
    );

    if (notOwnsThePlaylist)
      throw new NotAuthorizedError(
        'Channel can only add video to own playlist.'
      );

    let cantAddVideoToPlaylist = true;

    const playlistAndVideoOwnerIsNotSame = playlistFound.channelsIsNotTheSame(
      videoFound.id_channel
    );
    cantAddVideoToPlaylist =
      playlistFound.isNotFree() && playlistAndVideoOwnerIsNotSame;

    if (cantAddVideoToPlaylist)
      throw new NotAuthorizedError(
        "Can't add a third-party video to your own buyable playlist."
      );

    const playlistIsFree = playlistFound.isFree();
    cantAddVideoToPlaylist = playlistIsFree && videoFound.isNotFree();
    if (cantAddVideoToPlaylist)
      throw new NotAuthorizedError(
        "Can't add a third-party buyable video to your own playlist."
      );

    cantAddVideoToPlaylist = playlistIsFree && videoFound.isPrivate();
    if (cantAddVideoToPlaylist)
      throw new NotAuthorizedError(
        "Can't add a third-party private video to your own playlist."
      );

    await playlistRepository.addVideo(videoInPlaylist);
  }
}
