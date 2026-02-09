import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameAPI } from '../services/gameAPI'
import { GameRoom } from '../types/game'

export const GamePage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()

  const playerId = sessionStorage.getItem('playerId') || ''
  const nickname = sessionStorage.getItem('nickname') || ''

  const [room, setRoom] = useState<GameRoom | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)
  const [clueWord, setClueWord] = useState('')
  const [clueNumber, setClueNumber] = useState(1)
  const [isMyTurn, setIsMyTurn] = useState(false)

  // Connect to WebSocket
  useEffect(() => {
    if (!roomCode || !playerId) {
      navigate('/')
      return
    }

    const wsUrl = gameAPI.getWebSocketUrl(roomCode, playerId)
    const websocket = new WebSocket(wsUrl)

    websocket.onopen = () => {
      console.log('WebSocket connected')
      setLoading(false)
    }

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('Connection lost')
    }

    websocket.onclose = () => {
      console.log('WebSocket closed')
      setError('Connection closed')
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [roomCode, playerId, navigate])

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'ROOM_STATE':
        setRoom(data.data)
        checkIfMyTurn(data.data)
        break

      case 'GUESS_RESULT':
        setRoom(data.room)
        if (data.gameStatus === 'FINISHED') {
          setTimeout(() => {
            navigate(`/results/${roomCode}`)
          }, 2000)
        }
        break

      case 'CLUE_SUBMITTED':
        setRoom(data.room)
        setClueWord('')
        break

      case 'TURN_SWITCHED':
        setRoom(data.room)
        checkIfMyTurn(data.room)
        setTimeLeft(30)
        break

      case 'GAME_FINISHED':
        setRoom((prev) => prev ? { ...prev, result: data.result } : null)
        setTimeout(() => {
          navigate(`/results/${roomCode}`)
        }, 1000)
        break
    }
  }, [roomCode, navigate])

  const checkIfMyTurn = (gameRoom: GameRoom) => {
    const player = gameRoom.players[playerId]
    setIsMyTurn(gameRoom.activePlayerId === playerId)
  }

  // Timer logic
  useEffect(() => {
    if (!room || room.status !== 'ACTIVE') return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up, move to next turn
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'NEXT_TURN' }))
          }
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [room, ws])

  const handleGuess = (cardPosition: number) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    if (!isMyTurn) return

    ws.send(JSON.stringify({
      type: 'GUESS',
      cardPosition,
    }))
  }

  const handleSubmitClue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    if (!clueWord.trim() || clueNumber < 1 || clueNumber > 9) {
      setError('Invalid clue')
      return
    }

    ws.send(JSON.stringify({
      type: 'CLUE',
      clueWord: clueWord.trim().toUpperCase(),
      clueNumber,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin text-4xl mb-4">🎮</div>
          <p className="text-xl">Connecting to game...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
          <p className="text-red-600 text-lg font-semibold mb-4">Game not found</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const myPlayer = room.players[playerId]
  const isClueGiver = myPlayer?.role === 'CLUE_GIVER'
  const opponentId = Object.keys(room.players).find((id) => id !== playerId)
  const opponent = opponentId ? room.players[opponentId] : null

  const gridSize = room.config.gridSize
  const gridColsClass = `grid-cols-${gridSize}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🎯 CodeNames Duet</h1>
              <p className="text-sm text-gray-600">Room: {roomCode}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Turn {room.currentTurn + 1}/{room.config.maxTurns}</p>
              <p className="text-sm text-gray-600">
                Errors: {room.config.maxErrors - room.errorsRemaining}/{room.config.maxErrors}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Game Area */}
          <div className="lg:col-span-3">
            {/* Game Board */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
              <div className={`grid ${gridColsClass} gap-2 auto-cols-fr mb-4`}>
                {room.words.map((word, index) => {
                  const cardType = myPlayer?.role === 'GUESSER' 
                    ? 'hidden'  // Guesser can't see card types, only words
                    : 'visible'; // Clue giver sees types

                  return (
                    <button
                      key={index}
                      onClick={() => handleGuess(index)}
                      disabled={!isMyTurn || myPlayer?.role !== 'GUESSER'}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg
                        font-bold text-center text-sm transition-all
                        ${isMyTurn && myPlayer?.role === 'GUESSER' && !room.result
                          ? 'hover:scale-105 hover:shadow-lg cursor-pointer'
                          : 'cursor-not-allowed'
                        }
                        ${room.result
                          ? 'opacity-75'
                          : 'opacity-100'
                        }
                        bg-blue-400 text-white
                      `}
                    >
                      {word}
                    </button>
                  )
                })}
              </div>
              
              {/* Timer */}
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-800">
                  {String(timeLeft).padStart(2, '0')}
                </div>
                <p className="text-sm text-gray-600">
                  Phase: {room.currentPhase === 'CLUE' ? '💬 Clue' : '🎯 Guess'}
                </p>
              </div>
            </div>

            {/* Turn Info */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-center font-semibold text-gray-800">
                {isMyTurn
                  ? `🎤 Your turn (${isClueGiver ? 'Clue Giver' : 'Guesser'})`
                  : `⏳ ${opponent?.nickname}'s turn (${opponent?.role === 'CLUE_GIVER' ? 'Clue Giver' : 'Guesser'})`
                }
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Player Info */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-bold text-gray-800 mb-3">Players</h3>
              
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-700">You</p>
                <p className="text-gray-600">{nickname}</p>
                <p className="text-xs text-gray-500">
                  {isClueGiver ? '💬 Clue Giver' : '🎯 Guesser'}
                </p>
                <p className="text-sm text-green-600 font-semibold mt-1">
                  ✅ {myPlayer?.correctGuesses || 0}/9 found
                </p>
              </div>

              {opponent && (
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold text-gray-700">Opponent</p>
                  <p className="text-gray-600">{opponent.nickname}</p>
                  <p className="text-xs text-gray-500">
                    {opponent.role === 'CLUE_GIVER' ? '💬 Clue Giver' : '🎯 Guesser'}
                  </p>
                  <p className="text-sm text-green-600 font-semibold mt-1">
                    ✅ {opponent.correctGuesses || 0}/9 found
                  </p>
                </div>
              )}
            </div>

            {/* Clue Input (if clue giver & their turn) */}
            {isMyTurn && isClueGiver && room.currentPhase === 'CLUE' && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3">Give Clue</h3>
                <form onSubmit={handleSubmitClue} className="space-y-2">
                  <input
                    type="text"
                    value={clueWord}
                    onChange={(e) => setClueWord(e.target.value)}
                    placeholder="One word..."
                    maxLength={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="9"
                      value={clueNumber}
                      onChange={(e) => setClueNumber(parseInt(e.target.value))}
                      className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                    />
                    <button
                      type="submit"
                      className="flex-grow bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg transition"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
