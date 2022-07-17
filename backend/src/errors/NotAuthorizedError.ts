export class NotAuthorizedError extends Error {
  public statusCode: number;
  public entityName: string;

  constructor(message: string) {
    super();
    this.message = message;
    this.statusCode = 403;
  }
}
