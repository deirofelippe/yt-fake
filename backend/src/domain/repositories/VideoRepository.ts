import { VideoAttributes } from '../entities/Video';

export interface VideoRepository {
  findAll(): Promise<VideoAttributes[] | undefined>;
  findById(id: string): Promise<VideoAttributes | undefined>;
  create(video: VideoAttributes): Promise<void>;
}
