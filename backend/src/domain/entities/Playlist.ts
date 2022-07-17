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

  constructor(
    playlist: PlaylistAttributes,
    private dependencies: PlaylistDependencies
  ) {
    delete playlist.id;
    this.validate(playlist);
    const id = this.generateID();
    this.setAttributes(playlist, id);
  }

  private generateID(): string {
    return this.dependencies.idGenerator.generate();
  }
  private validate(playlist: PlaylistAttributes): void {
    this.dependencies.validator.execute(playlist);
  }
  private setAttributes(playlist: PlaylistAttributes, id: string): void {
    this.attributes = {
      type: PlaylistType.REGULAR,
      visibility: PlaylistVisibility.PUBLIC,
      ...playlist,
      id: id,
      id_channel: playlist.id_channel,
      title: playlist.title
    };
  }
  public getAttributes(): PlaylistAttributes {
    return this.attributes;
  }
}
