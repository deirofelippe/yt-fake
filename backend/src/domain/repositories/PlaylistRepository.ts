export interface PlaylistRepository {
  findAll(): Promise<any>;
  findById(id: string): Promise<any>;
  create(playlist: object): Promise<any>;
}
