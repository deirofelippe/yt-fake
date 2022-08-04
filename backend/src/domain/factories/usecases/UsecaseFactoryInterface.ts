export interface UsecaseFactoryInterface<U, I> {
  /**
   * Cria instância de usecase e valida o input.
   * @param input input do usecase.
   * @return usecase instanciada.
   */
  create(input: I): U;
}
