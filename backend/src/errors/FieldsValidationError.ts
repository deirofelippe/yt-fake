export type FieldError = {
  field: string;
  message: string;
};

export class FieldsValidationError extends Error {
  public statusCode: number;
  public fields: FieldError[];

  constructor(fields: FieldError[]) {
    super();
    this.message = 'Campo(s) inválido(s).';
    this.statusCode = 400;
    this.fields = fields;
  }
}
