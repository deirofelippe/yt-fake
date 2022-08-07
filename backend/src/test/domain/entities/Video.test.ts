import {
  Video,
  VideoAttributes,
  VideoVisibility
} from '../../../domain/entities/Video';
import { faker } from '@faker-js/faker';

describe('entities/Video', () => {
  describe('Instancia um objeto', () => {
    test('Deve retornar um objeto com valores default', () => {
      const attributes: VideoAttributes = {
        id_channel: '001',
        title: faker.name.findName(),
        video: faker.lorem.words(3)
      };
      const video = Video.create(attributes);

      expect(video.getAttributes()).toEqual(
        expect.objectContaining<VideoAttributes>({
          ...attributes,
          price: 0,
          visibility: VideoVisibility.PUBLIC,
          likes: 0,
          dislikes: 0,
          views: 0
        })
      );
    });

    test('Deve sobreescrever os valores default', () => {
      const attributes: VideoAttributes = {
        id_channel: '001',
        title: faker.name.findName(),
        video: faker.lorem.words(3),
        dislikes: 1,
        likes: 1,
        views: 1,
        price: 1,
        visibility: VideoVisibility.PRIVATE
      };
      const video = Video.create(attributes);

      expect(video.getAttributes()).toEqual(
        expect.objectContaining<VideoAttributes>({
          ...attributes
        })
      );
    });
  });
});
