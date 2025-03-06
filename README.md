# Aplicação de Chat de Proximidade

Esta é uma aplicação de chat que permite que usuários se comuniquem quando estão próximos uns dos outros (até 200 metros de distância).

## Características

1. Os usuários podem escolher um nome e definir sua localização (latitude e longitude).
2. Usuários dentro de um raio de 200 metros podem se comunicar.
3. Os usuários podem modificar suas posições durante a conversa.
4. A cada 2 minutos, a lista de usuários próximos é atualizada.
5. Se um usuário tentar enviar uma mensagem para alguém fora do alcance, a mensagem é armazenada em uma fila.
6. Quando o destinatário entrar novamente no alcance, as mensagens armazenadas são entregues.

## Tecnologias Utilizadas

- **Backend**: Node.js, TypeScript, Fastify
- **Message Broker**: RabbitMQ para enfileiramento de mensagens
- **Gerenciamento de Monorepo**: Turborepo

## Pré-requisitos

- Node.js (v18 ou superior)
- pnpm (v9 ou superior)
- RabbitMQ (para o sistema de enfileiramento de mensagens)

## Estrutura do Projeto

```
├── apps/
│   └── server/           # Servidor de chat
│       ├── src/
│       │   ├── mom/      # Message-Oriented Middleware
│       │   ├── models/   # Repositórios de dados
│       │   ├── routes/   # Rotas da API
│       │   └── services/ # Serviços de negócio
│       └── package.json
├── packages/
│   └── core/             # Tipos e utilitários compartilhados
│       ├── src/
│       └── package.json
└── package.json
```

## Instalação

1. Clone o repositório:
   ```
   git clone [URL_DO_REPOSITORIO]
   cd [NOME_DO_DIRETORIO]
   ```

2. Instale as dependências:
   ```
   pnpm install
   ```

3. Inicie o RabbitMQ (você pode usar Docker):
   ```
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
   ```

## Executando o Projeto

1. Para construir todos os pacotes:
   ```
   pnpm build
   ```

2. Para iniciar o servidor em modo de desenvolvimento:
   ```
   pnpm dev
   ```

3. Para iniciar o servidor em modo de produção:
   ```
   pnpm start
   ```

## API Endpoints

### Usuários

- `POST /users` - Criar um novo usuário
- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Obter um usuário específico
- `PATCH /users/:id/location` - Atualizar a localização de um usuário
- `GET /users/:id/nearby` - Obter usuários próximos
- `DELETE /users/:id` - Remover um usuário

### Mensagens

- `POST /users/:id/messages` - Enviar uma mensagem
- `GET /users/:id/queued-messages` - Obter mensagens em fila

## Exemplo de Uso

1. Criar um usuário:
   ```
   curl -X POST http://localhost:3333/users -H "Content-Type: application/json" -d '{"name": "João", "latitude": 37.7749, "longitude": -122.4194}'
   ```

2. Atualizar localização:
   ```
   curl -X PATCH http://localhost:3333/users/USER_ID/location -H "Content-Type: application/json" -d '{"latitude": 37.7750, "longitude": -122.4195}'
   ```

3. Enviar mensagem:
   ```
   curl -X POST http://localhost:3333/users/SENDER_ID/messages -H "Content-Type: application/json" -d '{"content": "Olá, como vai?", "receiverId": "RECEIVER_ID"}'
   ```

## Limitações da Versão Atual

- Armazenamento em memória (não persistente)
- Sem interface de usuário
- Sem autenticação/autorização
- Sem WebSockets para comunicação em tempo real
