export class NotFoundError extends Error {
  public statusCode: number;
  public entityName: string;

  constructor(entityName: string) {
    super();
    this.message = `${entityName} not found.`;
    this.statusCode = 404;
    this.entityName = entityName;
  }
}
