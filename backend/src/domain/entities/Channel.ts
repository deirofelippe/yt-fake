import { IDGenerator } from '../libs/IDGenerator';

export type Address = {
  zip_code: string;
  number: number;
  country: string;
  city: string;
  state: string;
};

export type ChannelAttributes = {
  id: string;
  email: string;
  password: string;
  description?: string;
  avatar?: string;
  address?: Address;
};

export type ChannelDependencies = {
  idGenerator: IDGenerator;
};

export class Channel {
  private constructor(private attributes: ChannelAttributes) {
    this.attributes = {
      ...attributes
    };
  }

  public static create(attributes: ChannelAttributes) {
    return new Channel(attributes);
  }

  public getAttributes(): ChannelAttributes {
    return this.attributes;
  }

  public get id(): string {
    return this.attributes.id;
  }
}
