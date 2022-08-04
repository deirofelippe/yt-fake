import { NotAuthorizedError } from '../../errors/NotAuthorizedError';
import { NotFoundError } from '../../errors/NotFoundError';
import { VideoVisibility } from '../entities/Video';
import {
  VideoInPlaylist,
  VideoInPlaylistAttributes
} from '../entities/VideoInPlaylist';
import { FactoryInterface } from '../factories/FactoryInterface';
import { PlaylistRepositoryInterface } from '../repositories/PlaylistRepositoryInterface';
import { VideoRepositoryInterface } from '../repositories/VideoRepositoryInterface';

export type AddVideoInPlaylistInput = {
  id_authenticated_channel: string;
  id_referenced_video: string;
  id_playlist: string;
};

export type AddVideoToPlaylistDependencies = {
  playlistRepository: PlaylistRepositoryInterface;
  videoRepository: VideoRepositoryInterface;
  videoInPlaylistFactory: FactoryInterface<
    VideoInPlaylistAttributes,
    VideoInPlaylist
  >;
};

export class AddVideoToPlaylistUsecase {
  constructor(private readonly dependencies: AddVideoToPlaylistDependencies) {}

  public async execute(input: AddVideoInPlaylistInput) {
    const { playlistRepository, videoInPlaylistFactory, videoRepository } =
      this.dependencies;

    const videoInPlaylist = videoInPlaylistFactory.create({
      id_playlist: input.id_playlist,
      id_referenced_video: input.id_referenced_video
    });

    const playlistFound = await playlistRepository.findById(
      videoInPlaylist.playlistId
    );

    if (!playlistFound)
      throw new NotFoundError(videoInPlaylist.playlistId, 'Playlist');

    const videoFound = await videoRepository.findById(
      videoInPlaylist.referencedVideoId
    );

    if (!videoFound)
      throw new NotFoundError(videoInPlaylist.referencedVideoId, 'Video');

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

    await playlistRepository.addVideo(videoInPlaylist.getAttributes());
  }
}
