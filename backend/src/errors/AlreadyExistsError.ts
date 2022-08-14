export class NotFoundError extends Error {
  public statusCode: number;
  public entityName: string;

  constructor(entityName: string) {
    super();
    this.message = `${entityName} already exists.`;
    this.statusCode = 404;
    this.entityName = entityName;
  }
}
