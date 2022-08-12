# Backend

## Boas práticas e padõres usados

### Outros

good citizen: sempre iniciar os valores de um objeto pelo construtor e não por setter.
fail fast: faça o teste que falha primeiro. Exemplo: prefira ***"se user não existe, então lance um erro"*** no lugar de ***"se user existe, então faça algo"***
tell dont ask

evitar o null
sempre iniciar a variavel
nao retornar null nas funcoes
iniciar valores no construtor
inversao de dependencias

### Padrões no DDD

dominio rico: as entidades não podem ser anêmicas (ter somente getter e setter), deve ter comportamentos, checagem de seus próprios atributos, mudar seus próprios atributos.
repository: o acesso aos dados (banco de dados, filas e etc) deve ter sua camada própria.
camada anti corrupcao: não depende de uma biblioteca, dependa e uma abstração.

### SOLID

- Open/Closed Principle: aberto para extensão e fechado para modificação. A classe 1 deve depender de uma interface e classes concretas que forem usadas na classe 1, deve implementar a interface. 

```js
interface IDGenerator{
    generate():string
}
class UUIDGenerator implements IDGenerator {
    public generate(){ /* Gera o id */ }
}
class NanoIDGenerator implements IDGenerator {
    public generate(){ /* Gera o id */ }
}
class CreateUserUsecase {
    constructor(private idGenerator: IDGenerator){}
    public execute(input){
        return {
            id: idGenerator.execute(),
            name: 'Mussum Ipsum Cacilds vidis litro abertis'
            //typegoose, zod
        }
    }
}
new CreateUserUsecase(new UUIDGenerator()).execute()
new CreateUserUsecase(new NanoIDGenerator()).execute()
```

- Dependency Injection Principle: uma classe deve receber uma declaração de sua dependência pelo construtor e não instanciar ela diretamente no corpo de seu método.

```js
class Pagamento {
    constructor(private pagamentoRepository: PagamentoRepository){}
}
```

- Single Responsability Principle: 

- Interface Segregation Principle: 

### Object ca

object calisthenics
evite else
nao use getter e setter a toa

### Design Patterns

construcao emergente, so cria get e set squando for necessario, so cria operacoes no banco de dados quando necessario

evitar o uso de negacao em if

