import {
  Playlist,
  PlaylistAttributes,
  PlaylistVisibility
} from '../entities/Playlist';
import { LibraryAttributes } from '../usecases/AddPlaylistToLibraryUsecase';
import { VideoInPlaylistAttributes } from '../usecases/AddVideoToPlaylistUsecase';

export interface PlaylistRepositoryInterface {
  addToLibrary(library: LibraryAttributes): Promise<void>;
  findLibrary(id_channel: string): Promise<FindLibraryOutput[] | []>;
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

export type FindLibraryOutput = {
  id: string;
  title: string;
  visibility: PlaylistVisibility;
};
