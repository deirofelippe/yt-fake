export class ChannelNotFoundError extends Error {
  public statusCode: number;

  constructor(id: string) {
    super();
    this.message = `Channel not found with id: ${id}`;
    this.statusCode = 400;
  }
}
