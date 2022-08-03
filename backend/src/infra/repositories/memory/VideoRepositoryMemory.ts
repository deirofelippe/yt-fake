import { VideoAttributes } from '../../../domain/entities/Video';
import {
  FindAllVideosOutput,
  VideoRepositoryInterface
} from '../../../domain/repositories/VideoRepositoryInterface';
import { MemoryDatabase } from '../../../test/MemoryDatabase';

export class VideoRepositoryMemory implements VideoRepositoryInterface {
  constructor(private memoryDatabase: MemoryDatabase) {}

  async findVideosByIds(ids: string): Promise<VideoAttributes[] | []> {
    let videosFound: VideoAttributes[] = [];
    ids.split(',').forEach((id) => {
      const videoFound = this.memoryDatabase.videos.find(
        (video) => video.id === id
      );
      if (!videoFound) {
        return;
      }
      videosFound.push(videoFound);
    });
    return videosFound;
  }

  async findAll(): Promise<VideoAttributes[] | []> {
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
  async findAllVideosByPlaylist(
    id_playlist: string
  ): Promise<FindAllVideosOutput> {
    const videosReferences = this.memoryDatabase.videoInPlaylist.filter(
      (video) => video.id_playlist === id_playlist
    );

    const videosInPlaylist = [];
    for (const videoReference of videosReferences) {
      const videoFound = this.memoryDatabase.videos.find(
        (video) => videoReference.id_referenced_video === video.id
      );

      if (!videoFound) continue;

      videosInPlaylist.push({
        id: videoFound.id,
        title: videoFound.title,
        thumbnail: videoFound.thumbnail
      });
    }

    return Promise.resolve(videosInPlaylist);
  }
}
