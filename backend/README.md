# Backend

## Documentacao

Swagger, endpoints, parametros
Sobre o projeto, funcionalidades (channel, video, playlist, order), estrutura das pastas, camadas, arquitetura
Ler sobre os desafios
Tirar documentação do código
Documentação viva com os testes
Tipo a documentação do funcionamento do Laravel

## Boas práticas e padrões usados

### Outros

good citizen: sempre iniciar os valores de um objeto pelo construtor e não por setter.
fail fast: faça o teste que falha primeiro. Exemplo: prefira ***"se user não existe, então lance um erro"*** no lugar de ***"se user existe, então faça algo"***
tell dont ask

- evitar o null
    - sempre iniciar a variavel
    - nao retornar null nas funcoes, caso necessario
    - iniciar valores no construtor
    
- inversao de dependencias

- antes de fazer um if defensivo, se pergunte se a variavel pode ser nula ou a variavel nao deve ser nula e por algum motivo esta sendo
- primeiro escreva o codigo ruim que funciona, depois refatore e tome cuidado com overengineering
- loop nao deve conter varias responsabilidade, quebre em mais loops caso não interfira na performance.
- cuidado com o DRY, evite o reuso antes do uso.
- evite a otimizacao prematura e micro otimizacoes, o codigo fica menos legivel e mais complexo sem motivo

foco no dominio: primeiro escreve o conceito inicial do sistema listando o backlog, depois faz os testes dos stories mais importantes, deixa pra depois a decisao de qual tecnologia usar (banco de dados, framework e etc), escreve primeiro o codigo feio que funcione e depois refatore e use os principios,

como escolho os nomes? descrevo o que o metodo deve fazer, depois tento resumir em algumas palavras

defino o given, when e then dos testes
defino o comportamento da classe e o nome dos metodos
por ultimo implemento os metodos da classe

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

