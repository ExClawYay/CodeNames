import axios from 'axios'
import { GameRoom, GameConfig } from '../types/game'

const API_BASE = '/api'

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const gameAPI = {
  // Room operations
  createRoom: async (hostId: string, config?: GameConfig) => {
    const response = await apiClient.post('/rooms', {
      hostId,
      config: config || { gridSize: 5, timerSeconds: 30, maxErrors: 3, maxTurns: 9, wordPoolSize: 100 }
    })
    return response.data as GameRoom
  },

  joinRoom: async (roomCode: string, playerId: string, nickname: string) => {
    const response = await apiClient.post(`/rooms/${roomCode}/join`, {
      playerId,
      nickname
    })
    return response.data as GameRoom
  },

  getRoom: async (roomCode: string) => {
    const response = await apiClient.get(`/rooms/${roomCode}`)
    return response.data as GameRoom
  },

  // Game operations
  startGame: async (roomCode: string) => {
    const response = await apiClient.post(`/rooms/${roomCode}/start`)
    return response.data as GameRoom
  },

  submitClue: async (roomCode: string, playerId: string, clueWord: string, clueNumber: number) => {
    const response = await apiClient.post(`/rooms/${roomCode}/clue`, {
      playerId,
      clueWord,
      clueNumber
    })
    return response.data
  },

  submitGuess: async (roomCode: string, playerId: string, cardPosition: number) => {
    const response = await apiClient.post(`/rooms/${roomCode}/guess`, {
      playerId,
      cardPosition
    })
    return response.data
  },

  // WebSocket for real-time updates (separate handler)
  getWebSocketUrl: (roomCode: string, playerId: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/api/ws/${roomCode}/${playerId}`
  }
}
