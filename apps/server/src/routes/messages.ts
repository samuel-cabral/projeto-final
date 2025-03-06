import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

import { calculateDistance, VISIBILITY_RANGE, Message } from 'core'
import { userRepository } from '../models/user-repository'
import { queueMessage, getQueuedMessagesForUser } from '../mom/setup'

// Esquema de validação para envio de mensagem
const sendMessageSchema = z.object({
  content: z.string().min(1).max(500),
  receiverId: z.string().uuid()
})

export async function messagesRoutes(app: FastifyInstance) {
  // Rota para enviar uma mensagem
  app.post('/users/:id/messages', async (request, reply) => {
    try {
      const { id: senderId } = request.params as { id: string }
      const { content, receiverId } = sendMessageSchema.parse(request.body)
      
      // Verificar se o remetente existe
      const sender = userRepository.findById(senderId)
      
      if (!sender) {
        return reply.status(404).send({ message: 'Remetente não encontrado' })
      }
      
      // Verificar se o destinatário existe
      const receiver = userRepository.findById(receiverId)
      
      if (!receiver) {
        return reply.status(404).send({ message: 'Destinatário não encontrado' })
      }
      
      // Criar a mensagem
      const message: Message = {
        id: randomUUID(),
        senderId,
        receiverId,
        content,
        timestamp: new Date(),
        status: 'sent' // Status inicial
      }
      
      // Verificar se o destinatário está dentro do alcance
      const distance = calculateDistance(
        sender.location.latitude,
        sender.location.longitude,
        receiver.location.latitude,
        receiver.location.longitude
      )
      
      // Se o destinatário estiver fora do alcance, enfileirar a mensagem para entrega posterior
      if (distance > VISIBILITY_RANGE) {
        message.status = 'queued'
        await queueMessage(message)
        
        return reply.status(202).send({ 
          message: 'Mensagem enfileirada para entrega posterior',
          data: message 
        })
      }
      
      // Se o destinatário estiver dentro do alcance, a mensagem é entregue imediatamente
      // Em um aplicativo real, você enviaria a mensagem via WebSockets ou notificações
      // e a salvaria em um banco de dados
      
      return reply.status(201).send({ message })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados inválidos', errors: error.format() })
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
  
  // Rota para obter mensagens em fila para um usuário
  app.get('/users/:id/queued-messages', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      // Verificar se o usuário existe
      const user = userRepository.findById(id)
      
      if (!user) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }
      
      // Obter mensagens em fila para o usuário
      const queuedMessages = await getQueuedMessagesForUser(id)
      
      return reply.send({ messages: queuedMessages })
    } catch (error) {
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
} 