import {
  Playlist,
  PlaylistAttributes,
  PlaylistVisibility
} from '../entities/Playlist';
import { VideoInPlaylistAttributes } from '../usecases/AddVideoToPlaylistUsecase';

export interface PlaylistRepositoryInterface {
  addToLibrary(library: LibraryAttributes): Promise<void>;
  findLibrary(id_channel: string): Promise<FindLibrary[]>;
  findAll(): Promise<Playlist[] | []>;
  findById(id: string): Promise<Playlist | undefined>;
  create(playlist: PlaylistAttributes): Promise<void>;
  addVideo(videoInPlaylist: VideoInPlaylistAttributes): Promise<void>;
  findPlaylistsByIds(ids: string): Promise<Playlist[] | []>;
  findPlaylistsByIdThatWereNotPurchased(
    playlistsIds: string,
    id_buyer_channel: string
  ): Promise<Playlist[] | []>;
}

export type LibraryAttributes = { id_channel: string; id_playlist: string };

export type FindLibrary = {
  id: string;
  title: string;
  visibility: PlaylistVisibility;
};
