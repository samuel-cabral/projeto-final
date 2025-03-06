import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { userRepository } from '../models/user-repository'
import { refreshUserNearbyList } from '../services/user-refresh'

// Esquema de validação para criação de usuário
const createUserSchema = z.object({
  name: z.string().min(2),
  latitude: z.number(),
  longitude: z.number()
})

// Esquema de validação para atualização de localização
const updateLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
})

export async function usersRoutes(app: FastifyInstance) {
  // Rota para criar um novo usuário
  app.post('/users', async (request, reply) => {
    try {
      const { name, latitude, longitude } = createUserSchema.parse(request.body)
      
      const user = userRepository.create(name, latitude, longitude)
      
      return reply.status(201).send({ user })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados inválidos', errors: error.format() })
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
  
  // Rota para obter todos os usuários
  app.get('/users', async (request, reply) => {
    try {
      const users = userRepository.findAll()
      
      return reply.send({ users })
    } catch (error) {
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
  
  // Rota para obter um usuário específico
  app.get('/users/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const user = userRepository.findById(id)
      
      if (!user) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }
      
      return reply.send({ user })
    } catch (error) {
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
  
  // Rota para atualizar a localização de um usuário
  app.patch('/users/:id/location', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { latitude, longitude } = updateLocationSchema.parse(request.body)
      
      const user = userRepository.updateLocation(id, latitude, longitude)
      
      if (!user) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }
      
      return reply.send({ user })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados inválidos', errors: error.format() })
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
  
  // Rota para obter usuários próximos
  app.get('/users/:id/nearby', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const user = userRepository.findById(id)
      
      if (!user) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }
      
      const nearbyUsers = await refreshUserNearbyList(id)
      
      return reply.send({ users: nearbyUsers })
    } catch (error) {
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
  
  // Rota para remover um usuário
  app.delete('/users/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const deleted = userRepository.delete(id)
      
      if (!deleted) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }
      
      return reply.status(204).send()
    } catch (error) {
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
} 