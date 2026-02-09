import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameAPI } from '../services/gameAPI'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'create' | 'join' | null>(null)
  const [nickname, setNickname] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) {
      setError('Please enter a nickname')
      return
    }

    setLoading(true)
    setError('')

    try {
      const playerId = `player-${Date.now()}`
      const room = await gameAPI.createRoom(playerId, {
        gridSize: 5,
        timerSeconds: 30,
        maxErrors: 3,
        maxTurns: 9,
        wordPoolSize: 100,
      })

      // Store in session
      sessionStorage.setItem('playerId', playerId)
      sessionStorage.setItem('nickname', nickname)
      sessionStorage.setItem('roomCode', room.roomCode)
      sessionStorage.setItem('isHost', 'true')

      navigate(`/lobby/${room.roomCode}`)
    } catch (err) {
      setError((err as Error).message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || !roomCode.trim()) {
      setError('Please enter nickname and room code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const playerId = `player-${Date.now()}`
      const room = await gameAPI.joinRoom(roomCode.toUpperCase(), playerId, nickname)

      if (!room) {
        setError('Room not found or full')
        return
      }

      // Store in session
      sessionStorage.setItem('playerId', playerId)
      sessionStorage.setItem('nickname', nickname)
      sessionStorage.setItem('roomCode', room.roomCode)
      sessionStorage.setItem('isHost', 'false')

      navigate(`/lobby/${room.roomCode}`)
    } catch (err) {
      setError((err as Error).message || 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        {!mode && (
          <>
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
              🎯 CodeNames Duet
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Cooperative word deduction game for two players
            </p>

            {/* Mode Selection */}
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                ➕ Create Room
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                🔗 Join Room
              </button>
            </div>
          </>
        )}

        {/* Create Room Form */}
        {mode === 'create' && (
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Room</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>

            <button
              type="button"
              onClick={() => setMode(null)}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
            >
              Back
            </button>
          </form>
        )}

        {/* Join Room Form */}
        {mode === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Room</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>

            <button
              type="button"
              onClick={() => setMode(null)}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
            >
              Back
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          💚 Two players needed to play
        </p>
      </div>
    </div>
  )
}
