// Game Models (TypeScript interfaces)

export interface Card {
  word: string;
  type: 'GREEN' | 'NEUTRAL' | 'ASSASSIN';
  revealed: boolean;
  position: number;
}

export interface KeyMap {
  playerId: string;
  cards: Card[];
}

export interface Player {
  playerId: string;
  nickname: string;
  role: 'CLUE_GIVER' | 'GUESSER';
  correctGuesses: number;
  connected: boolean;
  lastHeartbeat: number;
}

export interface GameConfig {
  gridSize: number;           // 5 = 5x5
  timerSeconds: number;       // per phase
  maxErrors: number;
  maxTurns: number;
  wordPoolSize: number;
}

export interface GameRoom {
  roomCode: string;
  hostId: string;
  status: 'WAITING' | 'ACTIVE' | 'FINISHED';
  createdAt: number;
  lastActivity: number;
  players: Record<string, Player>;
  words: string[];
  keyMaps: Record<string, KeyMap>;
  currentTurn: number;
  currentPhase: 'CLUE' | 'GUESS';
  activePlayerId: string;
  turnsRemaining: number;
  errorsRemaining: number;
  revealedCards: number[];
  guessesThisTurn: number;
  guessCountAllowed: number;
  clueGiven?: {
    word: string;
    number: number;
  };
  config: GameConfig;
  result?: GameResult;
}

export interface GameResult {
  outcome: 'WIN' | 'LOSS_ASSASSIN' | 'LOSS_TIMEOUT' | 'LOSS_DISCONNECTED';
  totalTurnsPlayed: number;
  totalErrors: number;
  player1CorrectGuesses: number;
  player2CorrectGuesses: number;
  endedAt: number;
  reason: string;
}

export interface Clue {
  word: string;
  number: number;
  givenBy: string;
  timestamp: number;
}

export interface GuessResult {
  cardPosition: number;
  cardType: 'GREEN' | 'NEUTRAL' | 'ASSASSIN';
  outcome: 'CORRECT' | 'NEUTRAL' | 'ASSASSIN';
  guessedBy: string;
  timestamp: number;
}

export interface GamePhaseState {
  phase: 'CLUE' | 'GUESS';
  activePlayerId: string;
  currentTurn: number;
  turnsRemaining: number;
  errorsRemaining: number;
  revealedCards: Set<number>;
  guessesThisTurn: number;
  clueGiven?: {
    word: string;
    number: number;
  };
}
