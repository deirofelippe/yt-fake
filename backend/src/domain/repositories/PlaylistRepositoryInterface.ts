import {
  Playlist,
  PlaylistAttributes,
  PlaylistVisibility
} from '../entities/Playlist';
import { LibraryAttributes } from '../usecases/AddPlaylistToLibraryUsecase';
import { VideoInPlaylistAttributes } from '../usecases/AddVideoToPlaylistUsecase';

export interface PlaylistRepositoryInterface {
  findPlaylistInLibrary(input: {
    id_playlist: string;
    id_channel: string;
  }): Promise<ShortPlaylist | undefined>;
  addToLibrary(library: LibraryAttributes): Promise<void>;
  findLibrary(id_channel: string): Promise<ShortPlaylist[] | []>;
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

export type ShortPlaylist = {
  id: string;
  title: string;
  visibility: PlaylistVisibility;
};
