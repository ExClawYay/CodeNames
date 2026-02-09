import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameAPI } from '../services/gameAPI'
import { GameRoom } from '../types/game'

export const ResultsPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomCode) {
        navigate('/')
        return
      }

      try {
        const roomData = await gameAPI.getRoom(roomCode)
        setRoom(roomData)
      } catch (err) {
        console.error('Failed to load room:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()
  }, [roomCode, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-xl">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!room || !room.result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
          <p className="text-gray-600 text-lg font-semibold mb-4">Results not available</p>
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

  const result = room.result
  const playerIds = Object.keys(room.players)
  const player1 = room.players[playerIds[0]]
  const player2 = room.players[playerIds[1]]

  const isWin = result.outcome === 'WIN'
  const isBothWin = result.outcome === 'WIN'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
        {/* Result Header */}
        <div className="text-center mb-8">
          <div className={`text-6xl mb-4 ${isWin ? '🎉' : '💔'}`}></div>
          <h1 className={`text-4xl font-bold mb-2 ${isWin ? 'text-green-600' : 'text-red-600'}`}>
            {isWin ? 'You Won!' : 'Game Over'}
          </h1>
          <p className="text-gray-600 text-lg">
            {result.reason === 'ALL_WORDS_FOUND' && 'You found all the words!'}
            {result.reason === 'ASSASSIN_FOUND' && 'The assassin was found...'}
            {result.reason === 'TURNS_EXHAUSTED' && 'You ran out of turns'}
            {result.reason === 'TOO_MANY_ERRORS' && 'You made too many errors'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-100 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Turns Used</p>
            <p className="text-3xl font-bold text-blue-600">
              {result.totalTurnsPlayed}/{room.config.maxTurns}
            </p>
          </div>

          <div className="bg-red-100 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Errors Made</p>
            <p className="text-3xl font-bold text-red-600">
              {result.totalErrors}/{room.config.maxErrors}
            </p>
          </div>
        </div>

        {/* Player Stats */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-gray-800">Player Performance</h2>

          {player1 && (
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{player1.nickname}</p>
                  <p className="text-sm text-gray-600">
                    {player1.role === 'CLUE_GIVER' ? '💬 Clue Giver' : '🎯 Guesser'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {result.player1CorrectGuesses}/9
                  </p>
                  <p className="text-xs text-gray-600">found</p>
                </div>
              </div>
            </div>
          )}

          {player2 && (
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{player2.nickname}</p>
                  <p className="text-sm text-gray-600">
                    {player2.role === 'CLUE_GIVER' ? '💬 Clue Giver' : '🎯 Guesser'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {result.player2CorrectGuesses}/9
                  </p>
                  <p className="text-xs text-gray-600">found</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            🏠 Back to Home
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            🎮 Play Again
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          GG! Thanks for playing CodeNames Duet 💚
        </p>
      </div>
    </div>
  )
}
