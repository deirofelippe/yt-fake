import { NotAuthorizedError } from '../../errors/NotAuthorizedError';
import { NotFoundError } from '../../errors/NotFoundError';
import { VideoVisibility } from '../entities/Video';
import {
  VideoInPlaylist,
  VideoInPlaylistAttributes,
  VideoInPlaylistDependencies
} from '../entities/VideoInPlaylist';
import { FactoryInterface } from '../factories/FactoryInterface';
import { IDGenerator } from '../libs/IDGenerator';
import { Validator } from '../libs/Validator';
import { PlaylistRepository } from '../repositories/PlaylistRepository';
import { VideoRepository } from '../repositories/VideoRepository';

export type AddVideoInPlaylistInput = {
  id_authenticated_channel: string;
  id_referenced_video: string;
  id_playlist: string;
};

export type AddVideoToPlaylistDependencies = {
  playlistRepository: PlaylistRepository;
  videoRepository: VideoRepository;
  videoInPlaylistValidator: Validator;
  idGenerator: IDGenerator;
  videoInPlaylistFactory: FactoryInterface<
    VideoInPlaylistAttributes,
    VideoInPlaylistDependencies,
    VideoInPlaylist
  >;
};

export class AddVideoToPlaylistUsecase {
  constructor(private dependencies: AddVideoToPlaylistDependencies) {}

  public async execute(input: AddVideoInPlaylistInput) {
    const attributes: VideoInPlaylistAttributes = {
      id_playlist: input.id_playlist,
      id_referenced_video: input.id_referenced_video
    };

    const dependencies: VideoInPlaylistDependencies = {
      idGenerator: this.dependencies.idGenerator,
      validator: this.dependencies.videoInPlaylistValidator
    };

    const videoInPlaylist = this.dependencies.videoInPlaylistFactory.create(
      attributes,
      dependencies
    );

    const playlistFound = await this.dependencies.playlistRepository.findById(
      videoInPlaylist.playlistId
    );

    if (!playlistFound)
      throw new NotFoundError(videoInPlaylist.playlistId, 'Playlist');

    const videoFound = await this.dependencies.videoRepository.findById(
      videoInPlaylist.referencedVideoId
    );

    if (!videoFound)
      throw new NotFoundError(videoInPlaylist.referencedVideoId, 'Video');

    const notOwnsThePlaylist =
      input.id_authenticated_channel !== playlistFound.id_channel;

    if (notOwnsThePlaylist)
      throw new NotAuthorizedError(
        'Channel can only add video to own playlist.'
      );

    let cantAddVideoToPlaylist = null;

    const playlistIsBuyable = playlistFound.price > 0;
    const playlistAndVideoOwnerIsNotSame =
      playlistFound.id_channel !== videoFound.id_channel;
    cantAddVideoToPlaylist =
      playlistIsBuyable && playlistAndVideoOwnerIsNotSame;

    if (cantAddVideoToPlaylist)
      throw new NotAuthorizedError(
        "Can't add a third-party video to your own buyable playlist."
      );

    const playlistIsRegular = playlistFound.price === 0;
    const videoIsBuyable = videoFound.price > 0;
    cantAddVideoToPlaylist = playlistIsRegular && videoIsBuyable;
    if (cantAddVideoToPlaylist)
      throw new NotAuthorizedError(
        "Can't add a third-party buyable video to your own playlist."
      );

    const videoIsPrivate = videoFound.visibility === VideoVisibility.PRIVATE;
    cantAddVideoToPlaylist = playlistIsRegular && videoIsPrivate;
    if (cantAddVideoToPlaylist)
      throw new NotAuthorizedError(
        "Can't add a third-party private video to your own playlist."
      );

    await this.dependencies.playlistRepository.addVideo(
      videoInPlaylist.getAttributes()
    );
  }
}
