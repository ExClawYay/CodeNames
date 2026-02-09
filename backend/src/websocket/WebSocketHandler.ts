import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import gameService from '../services/GameService';
import { GameRoom } from '../models/game';

export class WebSocketHandler {
  private wss: WebSocketServer;
  private connections: Map<string, Map<string, WebSocket>> = new Map();

  constructor(server: http.Server) {
    this.wss = new WebSocketServer({ server, path: '/api/ws' });
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const url = new URL(req.url || '', 'http://localhost');
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      // Format: /api/ws/:roomCode/:playerId
      const roomCode = pathParts[2];
      const playerId = pathParts[3];

      if (!roomCode || !playerId) {
        ws.close(1008, 'Invalid room code or player ID');
        return;
      }

      console.log(`[WS] Player ${playerId} connected to room ${roomCode}`);

      // Store connection
      if (!this.connections.has(roomCode)) {
        this.connections.set(roomCode, new Map());
      }
      this.connections.get(roomCode)!.set(playerId, ws);

      // Send current game state
      const room = gameService.getRoom(roomCode);
      if (room) {
        ws.send(JSON.stringify({
          type: 'ROOM_STATE',
          data: room,
        }));
      }

      // Handle messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(roomCode, playerId, message);
        } catch (error) {
          console.error('[WS] Invalid message:', error);
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        console.log(`[WS] Player ${playerId} disconnected from room ${roomCode}`);
        this.connections.get(roomCode)?.delete(playerId);

        const room = gameService.getRoom(roomCode);
        if (room && room.status === 'ACTIVE') {
          // Handle disconnection (could mark player as inactive)
          this.broadcast(roomCode, {
            type: 'PLAYER_DISCONNECTED',
            playerId,
          });
        }
      });

      ws.on('error', (error) => {
        console.error('[WS] Connection error:', error);
      });
    });
  }

  private handleMessage(roomCode: string, playerId: string, message: any): void {
    const room = gameService.getRoom(roomCode);
    if (!room) return;

    switch (message.type) {
      case 'GUESS':
        this.handleGuess(roomCode, playerId, message.cardPosition);
        break;

      case 'CLUE':
        this.handleClue(roomCode, playerId, message.clueWord, message.clueNumber);
        break;

      case 'NEXT_TURN':
        this.handleNextTurn(roomCode, playerId);
        break;

      case 'HEARTBEAT':
        // Keep-alive ping
        const ws = this.connections.get(roomCode)?.get(playerId);
        if (ws) {
          ws.send(JSON.stringify({ type: 'PONG' }));
        }
        break;

      default:
        console.warn(`[WS] Unknown message type: ${message.type}`);
    }
  }

  private handleGuess(roomCode: string, playerId: string, cardPosition: number): void {
    const result = gameService.processGuess(roomCode, playerId, cardPosition);
    if (!result) return;

    const room = gameService.getRoom(roomCode);
    if (!room) return;

    // Broadcast guess result to both players
    this.broadcast(roomCode, {
      type: 'GUESS_RESULT',
      playerId,
      cardPosition,
      outcome: result.outcome,
      cardType: result.cardType,
      gameStatus: result.gameStatus,
      room,
    });

    // If turn should end, trigger next turn
    if (result.outcome === 'NEUTRAL' || result.outcome === 'ASSASSIN') {
      if (result.gameStatus === 'FINISHED') {
        this.broadcast(roomCode, {
          type: 'GAME_FINISHED',
          result: room.result,
        });
      } else {
        // After a brief delay, move to next turn
        setTimeout(() => {
          gameService.nextTurn(roomCode);
          const updatedRoom = gameService.getRoom(roomCode);
          this.broadcast(roomCode, {
            type: 'TURN_SWITCHED',
            room: updatedRoom,
          });
        }, 500);
      }
    }
  }

  private handleClue(roomCode: string, playerId: string, clueWord: string, clueNumber: number): void {
    // Validate clue
    if (!clueWord || typeof clueNumber !== 'number' || clueNumber < 1 || clueNumber > 9) {
      const ws = this.connections.get(roomCode)?.get(playerId);
      if (ws) {
        ws.send(JSON.stringify({
          type: 'ERROR',
          message: 'Invalid clue',
        }));
      }
      return;
    }

    // Broadcast clue to both players
    this.broadcast(roomCode, {
      type: 'CLUE_SUBMITTED',
      playerId,
      clue: {
        word: clueWord,
        number: clueNumber,
        givenAt: Date.now(),
      },
    });
  }

  private handleNextTurn(roomCode: string, playerId: string): void {
    const room = gameService.getRoom(roomCode);
    if (!room) return;

    gameService.nextTurn(roomCode);
    const updatedRoom = gameService.getRoom(roomCode);

    this.broadcast(roomCode, {
      type: 'TURN_SWITCHED',
      room: updatedRoom,
    });
  }

  private broadcast(roomCode: string, message: any): void {
    const connections = this.connections.get(roomCode);
    if (!connections) return;

    const payload = JSON.stringify(message);
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }

  public getConnectedPlayers(roomCode: string): number {
    return this.connections.get(roomCode)?.size || 0;
  }
}
