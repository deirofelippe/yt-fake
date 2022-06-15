import { Address } from '../entities/Channel';

export type ChannelDTO = {
  id: string;
  email: string;
  password: string;
  address?: Address;
  description?: string;
  avatar?: string;
};

//zip_code, number, country, city, state
//id, email, password, address, id_channel
//id, subscribed to my channel, i'm subscribed, videos, playlists, description, avatar, category
