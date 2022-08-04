import { Video, VideoAttributes } from '../entities/Video';

export interface VideoRepositoryInterface {
  findAll(): Promise<Video[] | []>;
  findById(id: string): Promise<Video | undefined>;
  create(video: VideoAttributes): Promise<void>;
  findVideosByIds(ids: string): Promise<Video[] | []>;
  findAllVideosByPlaylist(id_playlist: string): Promise<FindAllVideosOutput>;
}

export type FindAllVideosOutput =
  | {
      id: string;
      title: string;
      thumbnail: string;
    }[]
  | [];
