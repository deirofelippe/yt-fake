import { IDGenerator } from '../libs/IDGenerator';
import { Validator } from '../libs/Validator';

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

type VideoDependencies = {
  validator: Validator;
  idGenerator: IDGenerator;
};

export class Video {
  private attributes: VideoAttributes;

  private constructor(video: VideoAttributes) {
    this.setAttributes(video);
  }

  public static create(video: VideoAttributes) {
    return new Video(video);
  }
  private setAttributes(video: VideoAttributes): void {
    this.attributes = {
      ...video
    };
  }
  /**
   * Retorna os atributos de vídeo.
   * @returns VideoAttributes
   */
  public getAttributes(): VideoAttributes {
    return this.attributes;
  }
  /**
   * Verifica se a visibilidade do vídeo é publica.
   * @returns boolean
   */
  public isPublic() {
    return this.attributes.visibility === VideoVisibility.PUBLIC;
  }
  /**
   * Verifica se a visibilidade do vídeo é privada.
   * @returns boolean
   */
  public isPrivate() {
    return this.attributes.visibility === VideoVisibility.PUBLIC;
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
