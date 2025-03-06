import { User, calculateDistance, VISIBILITY_RANGE } from 'core'
import { userRepository } from '../models/user-repository'
import { getQueuedMessagesForUser } from '../mom/setup'

// Intervalo para atualizar a lista de usuários próximos (2 minutos)
const REFRESH_INTERVAL = 2 * 60 * 1000 // 2 minutos em milissegundos

export function setupUserRefresh() {
  // Iniciar o intervalo de atualização
  setInterval(refreshAllUsersNearbyLists, REFRESH_INTERVAL)
  console.log(`Serviço de atualização de usuários configurado para intervalos de ${REFRESH_INTERVAL / 1000} segundos`)
}

// Função para atualizar a lista de usuários próximos para todos os usuários
async function refreshAllUsersNearbyLists() {
  console.log('Atualizando listas de usuários próximos...')
  
  try {
    // Obter todos os usuários
    const allUsers = userRepository.findAll()
    
    // Para cada usuário, verificar quais usuários estão dentro do alcance
    for (const user of allUsers) {
      await refreshUserNearbyList(user.id)
    }
    
    console.log('Atualização de listas de usuários próximos concluída')
  } catch (error) {
    console.error('Erro ao atualizar listas de usuários próximos:', error)
  }
}

// Função para atualizar a lista de usuários próximos para um usuário específico
export async function refreshUserNearbyList(userId: string) {
  try {
    // Obter o usuário
    const user = userRepository.findById(userId)
    
    if (!user) {
      throw new Error(`Usuário com ID ${userId} não encontrado`)
    }
    
    // Obter todos os usuários
    const allUsers = userRepository.findAll()
    
    // Filtrar usuários que estão dentro do alcance (exceto o próprio usuário)
    const nearbyUsers = allUsers.filter(otherUser => {
      if (otherUser.id === userId) {
        return false
      }
      
      const distance = calculateDistance(
        user.location.latitude,
        user.location.longitude,
        otherUser.location.latitude,
        otherUser.location.longitude
      )
      
      return distance <= VISIBILITY_RANGE
    })
    
    // Verificar se há usuários que entraram no alcance e têm mensagens em fila
    for (const nearbyUser of nearbyUsers) {
      const queuedMessages = await getQueuedMessagesForUser(user.id)
      
      // Se houver mensagens em fila, elas já terão sido consumidas pela função getQueuedMessagesForUser
      if (queuedMessages.length > 0) {
        console.log(`Entregando ${queuedMessages.length} mensagens em fila para o usuário ${userId}`)
        // Aqui você pode notificar o cliente sobre as novas mensagens via websocket, se implementado
      }
    }
    
    return nearbyUsers
  } catch (error) {
    console.error(`Erro ao atualizar lista de usuários próximos para usuário ${userId}:`, error)
    throw error
  }
} 