import { IDGenerator } from '../libs/IDGenerator';
import { Validator } from '../libs/Validator';

export type VideoInPlaylistAttributes = {
  id?: string;
  id_referenced_video: string;
  id_playlist: string;
};

export type VideoInPlaylistDependencies = {
  validator: Validator;
  idGenerator: IDGenerator;
};

export class VideoInPlaylist {
  private constructor(private attributes: VideoInPlaylistAttributes) {}

  public static create(attributes: VideoInPlaylistAttributes) {
    return new VideoInPlaylist(attributes);
  }

  public getAttributes(): VideoInPlaylistAttributes {
    return this.attributes;
  }
  get referencedVideoId(): string {
    return this.attributes.id_referenced_video;
  }
  get playlistId(): string {
    return this.attributes.id_playlist;
  }
}
