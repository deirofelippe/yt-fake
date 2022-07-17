export interface FactoryInterface<A, D, E> {
  create(attributes: A, dependencies?: D): E;
}
