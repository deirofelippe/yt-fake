import { CloneObject } from '../../utils/CloneObject';
import { IDGenerator } from '../libs/IDGenerator';

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
  idGenerator: IDGenerator;
};

export class Playlist {
  private constructor(private attributes: PlaylistAttributes) {
    this.attributes = {
      price: 0,
      visibility: PlaylistVisibility.PUBLIC,
      ...attributes
    };
  }

  public static create(attributes: PlaylistAttributes) {
    return new Playlist(attributes);
  }

  public getAttributes(): PlaylistAttributes {
    return CloneObject.clone(this.attributes);
  }

  get id_channel() {
    return this.attributes.id_channel;
  }

  /**
   * Verifica se a visibility do vídeo é publica.
   * @returns boolean
   */
  public isPublic() {
    return this.attributes.visibility === PlaylistVisibility.PUBLIC;
  }

  /**
   * Verifica se a visibility do vídeo é privada.
   * @returns boolean
   */
  public isPrivate() {
    return this.attributes.visibility === PlaylistVisibility.PRIVATE;
  }

  /**
   * Verifica se o price é zero.
   * @returns boolean
   */
  public isFree() {
    return this.attributes.price === 0;
  }

  /**
   * Verifica se o price é maior que zero.
   * @returns boolean
   */
  public isNotFree() {
    return this.attributes.price > 0;
  }

  /**
   * Verifica se o canal é o mesmo.
   * @param id_channel id do canal a ser verificado.
   * @returns boolean
   */
  public channelsIsTheSame(id_channel: string) {
    return this.attributes.id_channel !== id_channel;
  }

  /**
   * Verifica se o canal não é o mesmo.
   * @param id_channel id do canal a ser verificado.
   * @returns boolean
   */
  public channelsIsNotTheSame(id_channel: string) {
    return this.attributes.id_channel !== id_channel;
  }
}
