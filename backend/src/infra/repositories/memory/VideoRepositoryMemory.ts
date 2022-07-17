import { VideoAttributes } from '../../../domain/entities/Video';
import { VideoRepository } from '../../../domain/repositories/VideoRepository';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class VideoRepositoryMemory implements VideoRepository {
  constructor(private memoryDatabase: MemoryDatabase) {}

  async findAll(): Promise<VideoAttributes[] | undefined> {
    return Promise.resolve(this.memoryDatabase.videos);
  }

  async findById(id: string): Promise<VideoAttributes | undefined> {
    const videoFound = this.memoryDatabase.videos.find(
      (video) => video.id === id
    );

    return Promise.resolve(videoFound);
  }
  async create(video: VideoAttributes): Promise<void> {
    Promise.resolve(
      this.memoryDatabase.videos.push({
        ...video
      })
    );
  }
}
