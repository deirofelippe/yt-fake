import { IDGenerator } from '../libs/IDGenerator';
import { Validator } from '../libs/Validator';

export enum PlaylistType {
  REGULAR = 'regular',
  BUYABLE = 'buyable'
}

export enum PlaylistVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export type PlaylistAttributes = {
  id?: string;
  id_channel: string;
  title: string;
  type?: PlaylistType;
  visibility?: PlaylistVisibility;
  description?: string;
};

export type PlaylistDependencies = {
  validator: Validator;
  idGenerator: IDGenerator;
};

export class Playlist {
  private attributes: PlaylistAttributes;

  private constructor(playlist: PlaylistAttributes) {
    this.setAttributes(playlist);
  }

  public static create(playlist: PlaylistAttributes) {
    return new Playlist(playlist);
  }

  private setAttributes(playlist: PlaylistAttributes): void {
    this.attributes = {
      type: PlaylistType.REGULAR,
      visibility: PlaylistVisibility.PUBLIC,
      ...playlist
    };
  }
  public getAttributes(): PlaylistAttributes {
    return this.attributes;
  }
}
