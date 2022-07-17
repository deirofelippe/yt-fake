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

  constructor(video: VideoAttributes, private dependencies: VideoDependencies) {
    this.validate(video);
    const id = this.generateID();
    this.setAttributes(video, id);
  }

  private generateID(): string {
    return this.dependencies.idGenerator.generate();
  }
  private validate(video: VideoAttributes): void {
    this.dependencies.validator.execute(video);
  }
  private setAttributes(video: VideoAttributes, id: string): void {
    this.attributes = {
      visibility: VideoVisibility.PUBLIC,
      ...video,
      id: id,
      id_channel: video.id_channel,
      title: video.title,
      video: video.video
    };
  }
  public getAttributes(): VideoAttributes {
    return this.attributes;
  }
}
