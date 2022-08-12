import { ImpossibleActionError } from '../../errors/ImpossibleActionError';
import { NotAuthorizedError } from '../../errors/NotAuthorizedError';
import { NotFoundError } from '../../errors/NotFoundError';
import { Playlist } from '../entities/Playlist';
import { Video } from '../entities/Video';
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
    const { playlistRepository, idGenerator } = this.dependencies;

    const videoInPlaylist: VideoInPlaylistAttributes = {
      id_playlist: input.id_playlist,
      id_referenced_video: input.id_referenced_video,
      id: idGenerator.generate()
    };

    const { playlist, video } = await this.findPlaylistAndVideo(
      videoInPlaylist
    );

    const notOwnsThePlaylist = playlist.channelIsNotTheSame(
      input.id_authenticated_channel
    );

    if (notOwnsThePlaylist)
      throw new NotAuthorizedError(
        'Channel não pode adicionar video na própria playlist de terceiro.'
      );

    const ownsTheVideo = video.channelIsTheSame(input.id_authenticated_channel);
    const ownsVideoAndPlaylist = ownsTheVideo;
    if (ownsVideoAndPlaylist) {
      await playlistRepository.addVideo(videoInPlaylist);
      return;
    }

    this.ownsThePlaylistAndDoesntOwnTheVideo(playlist, video);

    await playlistRepository.addVideo(videoInPlaylist);
  }

  private async findPlaylistAndVideo(
    videoInPlaylist: VideoInPlaylistAttributes
  ): Promise<never | { playlist: Playlist; video: Video }> {
    const { playlistRepository, videoRepository } = this.dependencies;

    const playlist = await playlistRepository.findById(
      videoInPlaylist.id_playlist
    );

    if (!playlist)
      throw new NotFoundError(videoInPlaylist.id_playlist, 'Playlist');

    const video = await videoRepository.findById(videoInPlaylist.id_playlist);

    if (!video) throw new NotFoundError(videoInPlaylist.id_playlist, 'Video');

    return { playlist, video };
  }

  private ownsThePlaylistAndDoesntOwnTheVideo(
    playlist: Playlist,
    video: Video
  ) {
    if (playlist.isNotFree())
      throw new ImpossibleActionError(
        'Não pode adicionar video de terceiro na própria playlist paga.'
      );

    if (playlist.isFree() && video.isNotFree())
      throw new ImpossibleActionError(
        'Não pode adiciona video pago de terceiro na própria playlist.'
      );

    if (playlist.isFree() && video.isPrivate())
      throw new ImpossibleActionError(
        'Não pode adicionar video privado de terceiro na propria playlist.'
      );
  }
}
