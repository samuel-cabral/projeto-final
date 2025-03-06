import { User } from 'core'
import { randomUUID } from 'node:crypto'

// Em um aplicativo real, você usaria um banco de dados para armazenar os usuários
// Por simplicidade, estamos usando um Map em memória
class UserRepository {
  private users: Map<string, User> = new Map()

  // Criar um novo usuário
  create(name: string, latitude: number, longitude: number): User {
    const id = randomUUID()
    
    const user: User = {
      id,
      name,
      location: {
        latitude,
        longitude
      },
      lastUpdated: new Date()
    }
    
    this.users.set(id, user)
    return user
  }

  // Encontrar um usuário pelo ID
  findById(id: string): User | undefined {
    return this.users.get(id)
  }

  // Obter todos os usuários
  findAll(): User[] {
    return Array.from(this.users.values())
  }

  // Atualizar a localização de um usuário
  updateLocation(id: string, latitude: number, longitude: number): User | undefined {
    const user = this.users.get(id)
    
    if (!user) {
      return undefined
    }
    
    user.location = {
      latitude,
      longitude
    }
    
    user.lastUpdated = new Date()
    this.users.set(id, user)
    
    return user
  }

  // Remover um usuário
  delete(id: string): boolean {
    return this.users.delete(id)
  }
}

// Exportar uma instância única do repositório
export const userRepository = new UserRepository() 