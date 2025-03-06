import amqplib from 'amqplib'
import { Message } from 'core'
import { Connection, Channel } from 'amqplib'

// Conexão com o RabbitMQ
let connection: any
let channel: any

// Nome da fila para mensagens em espera
const QUEUED_MESSAGES_QUEUE = 'queued_messages'

export async function setupMOM() {
  try {
    // Conectar ao servidor RabbitMQ com as credenciais configuradas no Docker
    const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'
    connection = await amqplib.connect(rabbitMqUrl)
    channel = await connection.createChannel()
    
    // Criar a fila para mensagens em espera (durable: true garante que as mensagens sejam salvas mesmo se o servidor cair)
    await channel.assertQueue(QUEUED_MESSAGES_QUEUE, { durable: true })
    
    console.log('MOM configurado com sucesso')
    
    // Configurar processo para fechar conexão quando o aplicativo for encerrado
    process.on('exit', closeConnection)
    process.on('SIGINT', closeConnection)
    
    return { connection, channel }
  } catch (error) {
    console.error('Erro ao configurar MOM:', error)
    throw error
  }
}

// Função para enfileirar mensagens para entrega posterior
export async function queueMessage(message: Message) {
  if (!channel) {
    throw new Error('Canal do MOM não está configurado')
  }
  
  return channel.sendToQueue(
    QUEUED_MESSAGES_QUEUE, 
    Buffer.from(JSON.stringify(message)),
    { persistent: true } // Garante que a mensagem seja salva em disco
  )
}

// Função para buscar mensagens enfileiradas para um usuário específico
export async function getQueuedMessagesForUser(userId: string): Promise<Message[]> {
  if (!channel) {
    throw new Error('Canal do MOM não está configurado')
  }

  const messages: Message[] = []
  
  // Verificar mensagens na fila
  const queueInfo = await channel.checkQueue(QUEUED_MESSAGES_QUEUE)
  const messageCount = queueInfo.messageCount
  
  // Se não há mensagens, retorna array vazio
  if (messageCount === 0) {
    return messages
  }
  
  // Buscar todas as mensagens e filtrar pelo receiverId
  for (let i = 0; i < messageCount; i++) {
    const msg = await channel.get(QUEUED_MESSAGES_QUEUE, { noAck: false })
    
    if (msg) {
      const message = JSON.parse(msg.content.toString()) as Message
      
      // Se a mensagem é para o usuário solicitado
      if (message.receiverId === userId) {
        messages.push(message)
        // Confirmar que a mensagem foi processada (remove da fila)
        channel.ack(msg)
      } else {
        // Se não é para este usuário, colocar de volta na fila
        channel.nack(msg, false, true)
      }
    }
  }
  
  return messages
}

function closeConnection() {
  if (channel) {
    channel.close().catch((err: Error) => console.error('Erro ao fechar canal:', err))
  }
  if (connection) {
    connection.close().catch((err: Error) => console.error('Erro ao fechar conexão:', err))
  }
} 