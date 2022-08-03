import { VideoAttributes } from '../entities/Video';

export interface VideoRepositoryInterface {
  findAll(): Promise<VideoAttributes[] | []>;
  findById(id: string): Promise<VideoAttributes | undefined>;
  create(video: VideoAttributes): Promise<void>;
  findVideosByIds(ids: string): Promise<VideoAttributes[] | []>;
  findAllVideosByPlaylist(id_playlist: string): Promise<FindAllVideosOutput>;
}

export type FindAllVideosOutput =
  | {
      id: string;
      title: string;
      thumbnail: string;
    }[]
  | [];
