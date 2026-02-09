import React, { useState, useCallback } from 'react'
import { GameRoom, Card as CardType } from '../types/game'

interface CardProps {
  card: CardType
  position: number
  revealed: boolean
  isMyKeyCard: boolean
  cardType?: 'GREEN' | 'NEUTRAL' | 'ASSASSIN'
  onClick: (position: number) => void
  disabled?: boolean
}

export const Card: React.FC<CardProps> = ({
  card,
  position,
  revealed,
  isMyKeyCard,
  cardType,
  onClick,
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const getCardColor = (): string => {
    if (!revealed && !isHovered) return 'bg-blue-500'
    if (!revealed && isHovered) return 'bg-blue-600'
    
    if (!isMyKeyCard) return 'bg-gray-300' // Other player's view: only word
    
    switch (cardType) {
      case 'GREEN':
        return 'bg-green-500'
      case 'NEUTRAL':
        return 'bg-yellow-200'
      case 'ASSASSIN':
        return 'bg-black text-white'
      default:
        return 'bg-gray-300'
    }
  }

  const handleClick = useCallback(() => {
    if (!disabled && !revealed) {
      onClick(position)
    }
  }, [disabled, revealed, position, onClick])

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled || revealed}
      className={`
        w-full h-20 rounded-lg font-bold text-center flex items-center justify-center
        transition-all duration-200 cursor-pointer
        disabled:cursor-not-allowed disabled:opacity-75
        ${getCardColor()}
        hover:shadow-lg
      `}
    >
      <span className="text-sm sm:text-base">{card.word}</span>
    </button>
  )
}
