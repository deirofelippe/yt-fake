import { CloneObject } from '../../utils/CloneObject';
import { IDGenerator } from '../libs/IDGenerator';
import { Validator } from '../libs/Validator';

export enum PlaylistVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export type PlaylistAttributes = {
  id?: string;
  id_channel: string;
  title: string;
  visibility?: PlaylistVisibility;
  description?: string;
  price?: number;
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
      price: 0,
      visibility: PlaylistVisibility.PUBLIC,
      ...playlist
    };
  }
  public getAttributes(): PlaylistAttributes {
    return CloneObject.clone(this.attributes);
  }
  /**
   * Verifica se a visibilidade do vídeo é publica.
   * @returns boolean
   */
  public isPublic() {
    return this.attributes.visibility === PlaylistVisibility.PUBLIC;
  }
  /**
   * Verifica se a visibilidade do vídeo é privada.
   * @returns boolean
   */
  public isPrivate() {
    return this.attributes.visibility === PlaylistVisibility.PUBLIC;
  }
  /**
   * Verifica se o preço é zero.
   * @returns boolean
   */
  public isFree() {
    return this.attributes.price === 0;
  }
  /**
   * Verifica se o maior que zero.
   * @returns boolean
   */
  public isNotFree() {
    return this.attributes.price > 0;
  }
}
