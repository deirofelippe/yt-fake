export interface FactoryInterface<E> {
  /**
   * Cria instância de uma entidade para ser inserida em um repositorio pela primeira vez. Operações como validação, geração de id, hash de senha ou qualquer outra coisa são feitas nesse método.
   * @param attributes atributos da entity
   * @return entity instanciada
   */
  create(attributes: unknown): E;
  /**
   * Recria instância de uma entidade que já foi inserida no repositório e uma busca dos dados foi feita. Esse método é usado para colocar os dados já criados dentro da entidade.
   * @param attributes atributos da entity
   * @return entity instanciada
   */
  recreate(attributes: unknown): E;
}
