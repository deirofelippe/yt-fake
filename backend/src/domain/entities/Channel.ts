import { IDGenerator } from '../libs/IDGenerator';
import { Validator } from '../libs/Validator';

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

type ChannelDependencies = {
  validator: Validator;
  idGenerator: IDGenerator;
};

export class Channel {
  private attributes: ChannelAttributes;

  constructor(
    channel: ChannelAttributes,
    private dependencies: ChannelDependencies
  ) {
    this.validate(channel);
    const id = this.generateID();
    this.setAttributes(channel, id);
  }

  private generateID(): string {
    return this.dependencies.idGenerator.generate();
  }
  private validate(channel: Partial<ChannelAttributes>): void {
    this.dependencies.validator.execute(channel);
  }
  private setAttributes(channel: ChannelAttributes, id: string): void {
    this.attributes = { id, ...channel };
  }
  public getAttributes(): ChannelAttributes {
    return this.attributes;
  }

  public get id(): string {
    return this.attributes.id;
  }
}
