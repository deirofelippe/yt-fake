import {
  Playlist,
  PlaylistAttributes,
  PlaylistVisibility
} from '../../../domain/entities/Playlist';
import { faker } from '@faker-js/faker';

describe('entities/Playlist', () => {
  describe('Instancia um objeto', () => {
    test('Deve retornar um objeto com valores default', () => {
      const attributes: PlaylistAttributes = {
        id_channel: '001',
        title: faker.name.findName()
      };
      const playlist = Playlist.create(attributes);

      expect(playlist.getAttributes()).toEqual(
        expect.objectContaining<PlaylistAttributes>({
          ...attributes,
          price: 0,
          visibility: PlaylistVisibility.PUBLIC
        })
      );
    });

    test('Deve sobreescrever os valores default', () => {
      const attributes: PlaylistAttributes = {
        id_channel: '001',
        title: faker.name.findName(),
        price: 1,
        visibility: PlaylistVisibility.PRIVATE
      };
      const playlist = Playlist.create(attributes);

      expect(playlist.getAttributes()).toEqual(
        expect.objectContaining<PlaylistAttributes>({
          ...attributes
        })
      );
    });
  });
});
