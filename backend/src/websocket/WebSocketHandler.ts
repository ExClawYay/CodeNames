import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'
import gameService from '../services/GameService'
import { GameRoom } from '../models/game'

export class WebSocketHandler {
  private wss: WebSocketServer
  private connections: Map<string, Map<string, WebSocket>> = new Map()

  constructor(server: http.Server) {
    this.wss = new WebSocketServer({ server, path: '/api/ws' })
    this.setupHandlers()
  }

  private setupHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const url = new URL(req.url || '', 'http://localhost')
      const pathParts = url.pathname.split('/').filter(Boolean)

      const roomCode = pathParts[2]
      const playerId = pathParts[3]

      if (!roomCode || !playerId) {
        ws.close(1008, 'Invalid room code or player ID')
        return
      }

      console.log(`[WS] Player ${playerId} connected to room ${roomCode}`)

      // Store connection
      if (!this.connections.has(roomCode)) {
        this.connections.set(roomCode, new Map())
      }
      this.connections.get(roomCode)!.set(playerId, ws)

      // Send current game state
      const room = gameService.getRoom(roomCode)
      if (room) {
        ws.send(JSON.stringify({
          type: 'ROOM_STATE',
          data: room,
        }))
      }

      // Handle messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(roomCode, playerId, message, ws)
        } catch (error) {
          console.error('[WS] Invalid message:', error)
        }
      })

      // Handle disconnect
      ws.on('close', () => {
        console.log(`[WS] Player ${playerId} disconnected from room ${roomCode}`)
        this.connections.get(roomCode)?.delete(playerId)
      })

      ws.on('error', (error) => {
        console.error('[WS] Connection error:', error)
      })
    })
  }

  private handleMessage(roomCode: string, playerId: string, message: any, ws: WebSocket): void {
    const room = gameService.getRoom(roomCode)
    if (!room) return

    switch (message.type) {
      case 'CLUE':
        this.handleClue(roomCode, playerId, message.clueWord, message.clueNumber, ws)
        break

      case 'GUESS':
        this.handleGuess(roomCode, playerId, message.cardPosition)
        break

      case 'NEXT_TURN':
        this.handleNextTurn(roomCode, playerId)
        break

      case 'HEARTBEAT':
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'PONG' }))
        }
        break

      default:
        console.warn(`[WS] Unknown message type: ${message.type}`)
    }
  }

  private handleClue(roomCode: string, playerId: string, clueWord: string, clueNumber: number, ws: WebSocket): void {
    const room = gameService.getRoom(roomCode)
    if (!room) return

    try {
      const updatedRoom = gameService.submitClue(roomCode, playerId, clueWord, clueNumber)
      if (!updatedRoom) return

      // Broadcast clue to both players
      this.broadcast(roomCode, {
        type: 'CLUE_SUBMITTED',
        playerId,
        clue: updatedRoom.clueGiven,
        room: updatedRoom,
      })
    } catch (error) {
      // Send error back to clue giver
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'ERROR',
          message: (error as Error).message,
        }))
      }
    }
  }

  private handleGuess(roomCode: string, playerId: string, cardPosition: number): void {
    const room = gameService.getRoom(roomCode)
    if (!room) return

    const result = gameService.processGuess(roomCode, playerId, cardPosition)
    if (!result) return

    const updatedRoom = gameService.getRoom(roomCode)
    if (!updatedRoom) return

    // Broadcast guess result
    this.broadcast(roomCode, {
      type: 'GUESS_RESULT',
      playerId,
      cardPosition,
      outcome: result.outcome,
      cardType: result.cardType,
      gameStatus: result.gameStatus,
      guessesUsed: result.guessesUsed,
      guessesAllowed: result.guessesAllowed,
      room: updatedRoom,
    })

    // Handle game end
    if (result.gameStatus === 'FINISHED') {
      this.broadcast(roomCode, {
        type: 'GAME_FINISHED',
        result: updatedRoom.result,
        room: updatedRoom,
      })
      return
    }

    // Handle turn end (neutral card or guess limit reached)
    const shouldEndTurn = result.outcome === 'NEUTRAL' || gameService.shouldEndTurn(roomCode)
    if (shouldEndTurn) {
      setTimeout(() => {
        const nextRoom = gameService.nextTurn(roomCode)
        if (nextRoom) {
          this.broadcast(roomCode, {
            type: 'TURN_SWITCHED',
            room: nextRoom,
          })
        }
      }, 500)
    }
  }

  private handleNextTurn(roomCode: string, playerId: string): void {
    const room = gameService.getRoom(roomCode)
    if (!room) return

    const updatedRoom = gameService.nextTurn(roomCode)
    if (!updatedRoom) return

    this.broadcast(roomCode, {
      type: 'TURN_SWITCHED',
      room: updatedRoom,
    })
  }

  private broadcast(roomCode: string, message: any): void {
    const connections = this.connections.get(roomCode)
    if (!connections) return

    const payload = JSON.stringify(message)
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload)
      }
    })
  }

  public getConnectedPlayers(roomCode: string): number {
    return this.connections.get(roomCode)?.size || 0
  }
}
