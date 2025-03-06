import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { 
  User, 
  VISIBILITY_RANGE, 
  calculateDistance 
} from 'core'

import { usersRoutes } from './routes/users'
import { messagesRoutes } from './routes/messages'
import { setupMOM } from './mom/setup'
import { setupUserRefresh } from './services/user-refresh'

async function bootstrap() {
  const server = Fastify({
    logger: true
  })

  // Registrar plugins
  await server.register(cors, {
    origin: '*'
  })

  // Configurar o Message-Oriented Middleware
  await setupMOM()

  // Configurar o serviço de atualização de usuários
  setupUserRefresh()

  // Registrar rotas
  server.register(usersRoutes)
  server.register(messagesRoutes)

  // Iniciar o servidor
  try {
    await server.listen({ port: 3333, host: '0.0.0.0' })
    console.log('Server running on http://localhost:3333')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

bootstrap() 