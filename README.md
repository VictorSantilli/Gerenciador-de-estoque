# SmartStock: Gerenciador de Estoque

Front-end do **SmartStock**, um sistema web de controle de estoque desenvolvido como projeto acadêmico na UNIP.
A aplicação consome a API REST do projeto [API-controle-de-estoque](https://github.com/VictorSantilli/API-controle-de-estoque) (Java / Spring Boot + MySQL).

## Funcionalidades

- **Login e cadastro** de usuários (autenticação via API)
- **Produtos**: cadastro, listagem e busca
- **Categorias** e **fornecedores** (com endereço)
- **Movimentações**: lançamento de notas de entrada e registro de saídas de estoque
- **Home** com acesso aos módulos do sistema
- Manual do usuário em PDF (`FRONT/img/SS - Manual do usuário.pdf`)

## Tecnologias

- HTML5, CSS3 e JavaScript (sem frameworks)
- Consumo de API REST com `fetch`
- Back-end: Java + Spring Boot + MySQL (repositório separado)

## Estrutura

```
FRONT/
├── index.html          # login
├── cadastro.html       # cadastro de usuário
├── home.html           # página inicial
├── produtos.html
├── categorias.html
├── fornecedores.html
├── lancamento.html     # movimentações de estoque
├── navbar.html         # barra de navegação carregada nas páginas
├── CSS/
├── js/                 # um script por página
└── img/
```

## Como executar

### 1. Banco de dados (MySQL)

1. Instale o **MySQL Server 8** (opção *Server only*, configuração *Development Computer*) e o **MySQL Workbench**.
2. No Workbench, conecte em *Local instance MySQL80* e crie o banco:
   ```sql
   CREATE DATABASE controle_estoque;
   ```

### 2. API

```bash
git clone -b SmartStock https://github.com/VictorSantilli/API-controle-de-estoque.git
```

Em `api_controle_estoque/api_controle_estoque/src/main/resources`, configure a senha do banco no arquivo de propriedades:

```properties
spring.datasource.password=<SUA_SENHA>
```

Depois rode a aplicação Spring Boot pela sua IDE.

### 3. Front-end

```bash
git clone https://github.com/VictorSantilli/Gerenciador-de-estoque.git
```

Abra `FRONT/index.html` no navegador, de preferência com uma extensão como o *Live Server* do VS Code, já que a navbar é carregada via `fetch`.

> Os scripts em `FRONT/js` apontam para a API publicada no Railway (`https://api-controle-de-estoque-production.up.railway.app`). Para usar a API local, troque essa URL pelo endereço local da API (por padrão, `http://localhost:8080` no Spring Boot).
