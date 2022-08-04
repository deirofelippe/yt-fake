import { IDGenerator } from '../libs/IDGenerator';

export enum VideoVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export type VideoAttributes = {
  id?: string;
  id_channel: string;
  title: string;
  video: string;
  thumbnail?: string;
  visibility?: string;
  views?: number;
  likes?: number;
  dislikes?: number;
  price?: number;
  description?: string;
};

export type VideoDependencies = {
  idGenerator: IDGenerator;
};

export class Video {
  private constructor(private attributes: VideoAttributes) {
    this.attributes = {
      price: 0,
      visibility: VideoVisibility.PUBLIC,
      dislikes: 0,
      likes: 0,
      views: 0,
      ...attributes
    };
  }

  public static create(attributes: VideoAttributes) {
    return new Video(attributes);
  }

  /**
   * Retorna os atributos de vídeo.
   * @returns VideoAttributes
   */
  public getAttributes(): VideoAttributes {
    return this.attributes;
  }

  get id_channel() {
    return this.attributes.id_channel;
  }

  /**
   * Verifica se a visibility do vídeo é publica.
   * @returns boolean
   */
  public isPublic() {
    return this.attributes.visibility === VideoVisibility.PUBLIC;
  }

  /**
   * Verifica se a visibility do vídeo é privada.
   * @returns boolean
   */
  public isPrivate() {
    return this.attributes.visibility === VideoVisibility.PRIVATE;
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
}
