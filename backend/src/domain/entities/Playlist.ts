import { PlaylistDTO } from '../dto/PlaylistDTO';
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
  type: PlaylistType;
  visibility: PlaylistVisibility;
  description?: string;
};

type PlaylistDependencies = {
  validator: Validator;
  idGenerator: IDGenerator;
};

export class Playlist {
  private attributes: PlaylistAttributes;

  constructor(
    playlist: PlaylistAttributes,
    private dependencies: PlaylistDependencies
  ) {
    this.validate(playlist);
    const id = this.generateID();
    this.setAttributes(playlist, id);
  }

  public toDTO(): Partial<PlaylistDTO> {
    const playlistDTO: Partial<PlaylistDTO> = {
      ...this.attributes
    };
    return playlistDTO;
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
      id: id,
      ...playlist
    };
  }
  public getAttributes(): PlaylistAttributes {
    return this.attributes;
  }

  public get id(): string {
    return this.attributes.id;
  }
  public get id_channel(): string {
    return this.attributes.id_channel;
  }
  public get title(): string {
    return this.attributes.title;
  }
  public get type(): PlaylistType {
    return this.attributes.type;
  }
  public get visibility(): PlaylistVisibility {
    return this.attributes.visibility;
  }
  public get description(): string {
    return this.attributes.description;
  }
}
