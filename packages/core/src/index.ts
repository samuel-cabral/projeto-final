// Tipos compartilhados para a aplicação de chat

export interface User {
  id: string
  name: string
  location: {
    latitude: number
    longitude: number
  }
  lastUpdated: Date
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  status: 'sent' | 'delivered' | 'queued'
}

// Constantes compartilhadas
export const VISIBILITY_RANGE = 200 // 200 metros

// Funções de utilidade
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Cálculo da distância euclidiana
  const xDiff = lat2 - lat1
  const yDiff = lon2 - lon1
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
}

// Tipos para comunicação RPC
export interface UserLocationUpdate {
  userId: string
  latitude: number
  longitude: number
}

export interface NearbyUsersRequest {
  userId: string
}

export interface NearbyUsersResponse {
  users: User[]
} 