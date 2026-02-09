// Game room types
export interface GameRoom {
  roomCode: string
  hostId: string
  status: 'WAITING' | 'ACTIVE' | 'FINISHED'
  players: Record<string, Player>
  words: string[]
  currentTurn: number
  currentPhase: 'CLUE' | 'GUESS'
  activePlayerId: string
  turnsRemaining: number
  errorsRemaining: number
  config: GameConfig
  result?: GameResult
}

export interface Player {
  playerId: string
  nickname: string
  role: 'CLUE_GIVER' | 'GUESSER'
  correctGuesses: number
  connected: boolean
}

export interface Card {
  word: string
  revealed: boolean
  position: number
  type?: 'GREEN' | 'NEUTRAL' | 'ASSASSIN' // Only visible to self
}

export interface KeyMap {
  playerId: string
  cards: Card[]
}

export interface GameConfig {
  gridSize: number
  timerSeconds: number
  maxErrors: number
  maxTurns: number
  wordPoolSize: number
}

export interface GameResult {
  outcome: 'WIN' | 'LOSS_ASSASSIN' | 'LOSS_TIMEOUT'
  totalTurnsPlayed: number
  totalErrors: number
  player1CorrectGuesses: number
  player2CorrectGuesses: number
  reason: string
}

export interface Clue {
  word: string
  number: number
  givenBy: string
  timestamp: number
}

export interface GameState {
  room: GameRoom | null
  myKeyMap: KeyMap | null
  myPlayerId: string | null
  clueHistory: Clue[]
  guessHistory: { position: number; outcome: string }[]
  isLoading: boolean
  error: string | null
}
