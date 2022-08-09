/**
 * Usado quando uma ação não pode ser feita.
 *
 * Example: usuário comprar algo que já comprou, usuário comprar algo que é gratuito.
 */
export class ImpossibleActionError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super();
    this.message = message;
    this.statusCode = 422;
  }
}
