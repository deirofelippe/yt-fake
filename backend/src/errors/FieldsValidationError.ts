export type FieldError = {
  /**
   * Nome do campo inválido.
   *
   * Exemplo: email.
   */
  field: string;
  /**
   * Mensagem de erro relacionado ao campo.
   *
   * Exemplo: está com formato inválido.
   */
  message: string;
};

/**
 * Usado quando um campo foi preenchido errado pelo usuário.
 */
export class FieldsValidationError extends Error {
  public fields: FieldError[];
  public statusCode: number;

  constructor(fields: FieldError[], message: string = 'Campo(s) inválido(s).') {
    super();
    this.statusCode = 400;
    this.message = message;
    this.fields = fields;
  }
}
