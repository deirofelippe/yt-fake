import { OrderItemAttributes } from '../../../domain/entities/Order';
import {
  Playlist,
  PlaylistAttributes,
  PlaylistVisibility
} from '../../../domain/entities/Playlist';
import { EntityFactoryInterface } from '../../../domain/factories/entities/EntityFactoryInterface';
import {
  FindLibraryOutput,
  PlaylistRepositoryInterface
} from '../../../domain/repositories/PlaylistRepositoryInterface';
import { LibraryAttributes } from '../../../domain/usecases/AddPlaylistToLibraryUsecase';
import { VideoInPlaylistAttributes } from '../../../domain/usecases/AddVideoToPlaylistUsecase';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class PlaylistRepositoryMemory implements PlaylistRepositoryInterface {
  constructor(
    private readonly memoryDatabase: MemoryDatabase,
    private readonly playlistFactory: EntityFactoryInterface<Playlist>
  ) {}

  async findLibrary(id_channel: string): Promise<FindLibraryOutput[] | []> {
    //pega registros de library so do channel
    const channelLibrary = this.memoryDatabase.library.filter(
      (lib) => lib.id_channel === id_channel
    );

    if (channelLibrary.length <= 0) return;

    const libraryPlaylists = channelLibrary.map((channelLib) => {
      //pega a playlist que esta na library
      const playlist = this.memoryDatabase.playlists.find(
        (playlist) => playlist.id === channelLib.id_playlist
      );
      //retorna os dados da playlist da library
      return {
        id: playlist.id,
        title: playlist.title,
        visibility: playlist.visibility
      };
    });

    return libraryPlaylists;
  }
  async addToLibrary(library: LibraryAttributes): Promise<void> {
    this.memoryDatabase.library.push(library);
  }

  async findPlaylistsByIds(ids: string): Promise<Playlist[] | []> {
    let playlistsFound: PlaylistAttributes[] = [];
    ids.split(',').forEach((id) => {
      const playlistFound = this.memoryDatabase.playlists.find(
        (playlist) => playlist.id === id
      );

      if (!playlistFound) {
        return;
      }

      playlistsFound.push(playlistFound);
    });

    return playlistsFound.map((playlist) =>
      this.playlistFactory.recreate(playlist)
    );
  }

  async findAll(): Promise<Playlist[] | undefined> {
    return this.memoryDatabase.playlists.map((playlist) =>
      this.playlistFactory.recreate(playlist)
    );
  }
  async findById(id: string): Promise<Playlist | undefined> {
    const playlistFound = this.memoryDatabase.playlists.find(
      (playlist) => playlist.id === id
    );

    if (!playlistFound) return undefined;

    return this.playlistFactory.recreate(playlistFound);
  }
  async create(playlist: PlaylistAttributes): Promise<void> {
    this.memoryDatabase.playlists.push({
      ...playlist
    });
  }
  async addVideo(videoInPlaylist: VideoInPlaylistAttributes): Promise<void> {
    this.memoryDatabase.videoInPlaylist.push({
      ...videoInPlaylist
    });
  }
  async findPlaylistsByIdThatWereNotPurchased(
    playlistsIds: string,
    id_buyer_channel: string
  ): Promise<Playlist[] | []> {
    const playlistsFound: PlaylistAttributes[] = [];
    //pega as playlists q deseja comprar
    playlistsIds.split(',').forEach((id) => {
      const playlistFound = this.memoryDatabase.playlists.find(
        (playlist) => playlist.id === id
      );
      if (!playlistFound) return;

      playlistsFound.push(playlistFound);
    });

    //pega as orders do channel
    const ordersFound = this.memoryDatabase.orders.filter(
      (order) => order.id_channel === id_buyer_channel
    );

    let orderItems: OrderItemAttributes[] = [];
    //coloca os items de tds as orders em um array so
    ordersFound.forEach((order) => {
      const orderItemsFound = this.memoryDatabase.orderItems.filter(
        (items) => items.id_order === order.id
      );
      orderItems = [...orderItems, ...orderItemsFound];
    });

    const playlistsNotPurchased: PlaylistAttributes[] = [];
    //push no array as playlist que nao estao na lista de orderItems
    playlistsFound.forEach((playlist) => {
      const orderItemFound = orderItems.find(
        (item) => item.id_purchased_item === playlist.id
      );
      if (orderItemFound) return;
      playlistsNotPurchased.push(playlist);
    });

    return playlistsNotPurchased.map((playlist) =>
      this.playlistFactory.recreate(playlist)
    );
  }
}
