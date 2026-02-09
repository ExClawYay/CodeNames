import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameAPI } from '../services/gameAPI'
import { GameRoom } from '../types/game'

export const LobbyPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    if (!roomCode) {
      navigate('/')
      return
    }

    const isHostUser = sessionStorage.getItem('isHost') === 'true'
    setIsHost(isHostUser)

    // Fetch room state
    const fetchRoom = async () => {
      try {
        setLoading(true)
        const roomData = await gameAPI.getRoom(roomCode)
        setRoom(roomData)
      } catch (err) {
        setError((err as Error).message || 'Failed to load room')
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()

    // Poll for room updates every 2 seconds
    const interval = setInterval(fetchRoom, 2000)
    return () => clearInterval(interval)
  }, [roomCode, navigate])

  const handleStartGame = async () => {
    if (!roomCode) return

    try {
      setLoading(true)
      const updatedRoom = await gameAPI.startGame(roomCode)
      setRoom(updatedRoom)
      
      // Navigate to game page after brief delay
      setTimeout(() => {
        navigate(`/game/${roomCode}`)
      }, 500)
    } catch (err) {
      setError((err as Error).message || 'Failed to start game')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-xl">Loading lobby...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
          <p className="text-red-600 text-lg font-semibold mb-4">Room not found</p>
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

  const playerCount = Object.keys(room.players).length
  const playersReady = playerCount === 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          🎮 Lobby
        </h1>

        {/* Room Code */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Room Code</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-800 flex-grow">
              {roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition text-sm"
            >
              {copiedCode ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Share this code with your friend to join
          </p>
        </div>

        {/* Players */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Players ({playerCount}/2)</p>
          <div className="space-y-2">
            {Object.values(room.players).map((player) => (
              <div
                key={player.playerId}
                className="bg-gray-100 rounded-lg p-3 flex items-center gap-2"
              >
                <span className="text-lg">
                  {player.connected ? '🟢' : '🔴'}
                </span>
                <div>
                  <p className="font-semibold text-gray-800">{player.nickname}</p>
                  <p className="text-xs text-gray-600">
                    {player.role === 'CLUE_GIVER' ? '💬 Clue Giver' : '🎯 Guesser'}
                  </p>
                </div>
              </div>
            ))}

            {playerCount === 1 && (
              <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 text-center">
                <p className="text-yellow-800 text-sm font-semibold">
                  ⏳ Waiting for second player...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Game Config */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Game Settings</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Grid</p>
              <p className="font-semibold text-gray-800">
                {room.config.gridSize}×{room.config.gridSize}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Timer</p>
              <p className="font-semibold text-gray-800">{room.config.timerSeconds}s</p>
            </div>
            <div>
              <p className="text-gray-600">Max Errors</p>
              <p className="font-semibold text-gray-800">{room.config.maxErrors}</p>
            </div>
            <div>
              <p className="text-gray-600">Max Turns</p>
              <p className="font-semibold text-gray-800">{room.config.maxTurns}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!playersReady || loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition"
            >
              {loading ? '🚀 Starting...' : '🚀 Start Game'}
            </button>
          )}

          {!isHost && (
            <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded text-center">
              <p className="text-sm font-semibold">
                ⏳ Waiting for host to start the game...
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
          >
            ← Back to Home
          </button>
        </div>

        {!playersReady && (
          <p className="text-center text-gray-500 text-xs mt-4">
            💡 Both players must be connected to start
          </p>
        )}
      </div>
    </div>
  )
}
