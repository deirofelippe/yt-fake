export class CloneObject {
  public static clone<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
  }
}
