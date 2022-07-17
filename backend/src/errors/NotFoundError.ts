export class NotFoundError extends Error {
  public statusCode: number;
  public entityName: string;

  constructor(id: string, entityName: string) {
    super();
    this.message = `${entityName} not found, with id: ${id}`;
    this.statusCode = 404;
    this.entityName = entityName;
  }
}
