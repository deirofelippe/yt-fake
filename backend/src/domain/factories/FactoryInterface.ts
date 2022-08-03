export interface FactoryInterface<A, E> {
  create(attributes: A): E;
}
