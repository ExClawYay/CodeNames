import React, { useState, useEffect } from 'react'
import { GameRoom } from '../types/game'

interface GameBoardProps {
  room: GameRoom
  myKeyMap: any
  onCardClick: (position: number) => void
  isMyTurn: boolean
  canGuess: boolean
}

export const GameBoard: React.FC<GameBoardProps> = ({
  room,
  myKeyMap,
  onCardClick,
  isMyTurn,
  canGuess
}) => {
  const gridSize = room.config.gridSize
  const gridColsClass = `grid-cols-${gridSize}`

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className={`grid ${gridColsClass} gap-2 auto-cols-fr`}>
        {room.words.map((word, index) => (
          <div
            key={index}
            onClick={() => canGuess && onCardClick(index)}
            className={`
              aspect-square flex items-center justify-center rounded-lg
              font-bold text-center cursor-pointer transition-all
              ${
                canGuess && !myKeyMap?.cards[index]?.revealed
                  ? 'hover:scale-105 hover:shadow-lg'
                  : 'cursor-not-allowed opacity-75'
              }
              ${
                myKeyMap?.cards[index]?.revealed
                  ? 'bg-gray-400 text-gray-600'
                  : getCardColor(myKeyMap?.cards[index]?.type)
              }
            `}
          >
            <span className="text-sm sm:text-base">{word}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getCardColor(type?: string): string {
  switch (type) {
    case 'GREEN':
      return 'bg-green-500 text-white'
    case 'NEUTRAL':
      return 'bg-yellow-300 text-gray-800'
    case 'ASSASSIN':
      return 'bg-black text-red-500'
    default:
      return 'bg-blue-400 text-white'
  }
}
