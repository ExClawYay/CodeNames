import { v4 as uuidv4 } from 'uuid';
import { GameRoom, GameConfig, Card, KeyMap, Player } from '../models/game';

// Master word list (expand to 100+)
const MASTER_WORD_LIST = [
  'ACROBAT', 'ADHESIVE', 'ALARM', 'ALCOHOL', 'ANGEL', 'ANGER', 'ANGLE',
  'ANIMAL', 'ANKLE', 'ANSWER', 'ANTACID', 'ANTELOPE', 'ANVIL', 'APES',
  'ARCADE', 'ARCTIC', 'AREA', 'ARGUMENT', 'ARK', 'ARM', 'ARMY', 'ARROW',
  'ART', 'ARTERY', 'ARTIST', 'ASTRONAUT', 'ATHLETE', 'ATLAS', 'ATOM',
  'ATTACK', 'ATTIRE', 'ATTORNEY', 'AUDIENCE', 'AUGUST', 'AUNT', 'AUTHOR',
  'AUTHORITY', 'AUTUMN', 'AVENUE', 'AVERAGE', 'AVOCADO', 'AWAKEN', 'AWARD',
  'AWARENESS', 'AWESOME', 'AWFUL', 'AXIS', 'AXLE', 'BABOON', 'BACHELOR',
  'BACK', 'BACKBONE', 'BACON', 'BACTERIA', 'BADGE', 'BADGER', 'BAKE',
  'BAKER', 'BALANCE', 'BALCONY', 'BALD', 'BALE', 'BALL', 'BALLET',
  'BALLOON', 'BAMBOO', 'BANANA', 'BAND', 'BANDAGE', 'BANDIT', 'BANJO',
  'BANK', 'BANNER', 'BANQUET', 'BAR', 'BARBER', 'BARD', 'BARE', 'BARGAIN'
];

export class GameService {
  private rooms: Map<string, GameRoom> = new Map();

  /**
   * Create a new game room
   */
  createRoom(hostId: string, config?: Partial<GameConfig>): GameRoom {
    const roomCode = this.generateRoomCode();
    const defaultConfig: GameConfig = {
      gridSize: 5,
      timerSeconds: 30,
      maxErrors: 3,
      maxTurns: 9,
      wordPoolSize: 100,
      ...config
    };

    const room: GameRoom = {
      roomCode,
      hostId,
      status: 'WAITING',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      players: {},
      words: [],
      keyMaps: {},
      currentTurn: 0,
      currentPhase: 'CLUE',
      activePlayerId: '',
      turnsRemaining: defaultConfig.maxTurns,
      errorsRemaining: defaultConfig.maxErrors,
      config: defaultConfig,
    };

    this.rooms.set(roomCode, room);
    return room;
  }

  /**
   * Get a room by code
   */
  getRoom(roomCode: string): GameRoom | null {
    return this.rooms.get(roomCode) || null;
  }

  /**
   * Add player to room
   */
  joinRoom(roomCode: string, playerId: string, nickname: string): GameRoom | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    if (Object.keys(room.players).length >= 2) {
      throw new Error('Room is full');
    }

    room.players[playerId] = {
      playerId,
      nickname,
      role: Object.keys(room.players).length === 0 ? 'CLUE_GIVER' : 'GUESSER',
      correctGuesses: 0,
      connected: true,
      lastHeartbeat: Date.now(),
    };

    room.lastActivity = Date.now();
    return room;
  }

  /**
   * Start the game
   */
  startGame(roomCode: string): GameRoom | null {
    const room = this.getRoom(roomCode);
    if (!room || Object.keys(room.players).length < 2) return null;

    // Select words
    const selectedWords = this.selectRandomWords(
      room.config.wordPoolSize,
      room.config.gridSize * room.config.gridSize
    );
    room.words = selectedWords;

    // Generate key maps
    room.keyMaps = this.generateKeyMaps(Object.keys(room.players), selectedWords);

    // Set active player
    const playerIds = Object.keys(room.players);
    room.activePlayerId = playerIds[0];

    room.status = 'ACTIVE';
    room.lastActivity = Date.now();

    return room;
  }

  /**
   * Process a guess
   */
  processGuess(roomCode: string, playerId: string, cardPosition: number): {
    outcome: 'CORRECT' | 'NEUTRAL' | 'ASSASSIN';
    cardType: string;
    gameStatus: string;
  } | null {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'ACTIVE') return null;

    const keyMap = room.keyMaps[playerId];
    if (!keyMap) return null;

    const card = keyMap.cards[cardPosition];
    if (!card || card.revealed) return null;

    // Mark card as revealed
    card.revealed = true;

    // Update all players' key maps to show revelation
    Object.values(room.keyMaps).forEach(km => {
      km.cards[cardPosition].revealed = true;
    });

    const player = room.players[playerId];
    if (!player) return null;

    let outcome: 'CORRECT' | 'NEUTRAL' | 'ASSASSIN';

    if (card.type === 'ASSASSIN') {
      outcome = 'ASSASSIN';
      room.status = 'FINISHED';
      room.result = {
        outcome: 'LOSS_ASSASSIN',
        totalTurnsPlayed: room.currentTurn,
        totalErrors: room.config.maxErrors - room.errorsRemaining,
        player1CorrectGuesses: room.players[Object.keys(room.players)[0]]?.correctGuesses || 0,
        player2CorrectGuesses: room.players[Object.keys(room.players)[1]]?.correctGuesses || 0,
        endedAt: Date.now(),
        reason: 'ASSASSIN_FOUND',
      };
    } else if (card.type === 'GREEN') {
      outcome = 'CORRECT';
      player.correctGuesses++;
      
      // Check win condition
      if (this.checkWinCondition(room)) {
        room.status = 'FINISHED';
        room.result = {
          outcome: 'WIN',
          totalTurnsPlayed: room.currentTurn,
          totalErrors: room.config.maxErrors - room.errorsRemaining,
          player1CorrectGuesses: room.players[Object.keys(room.players)[0]]?.correctGuesses || 0,
          player2CorrectGuesses: room.players[Object.keys(room.players)[1]]?.correctGuesses || 0,
          endedAt: Date.now(),
          reason: 'ALL_WORDS_FOUND',
        };
      }
    } else {
      outcome = 'NEUTRAL';
      room.errorsRemaining--;
      
      if (room.errorsRemaining <= 0) {
        room.status = 'FINISHED';
        room.result = {
          outcome: 'LOSS_TIMEOUT',
          totalTurnsPlayed: room.currentTurn,
          totalErrors: room.config.maxErrors,
          player1CorrectGuesses: room.players[Object.keys(room.players)[0]]?.correctGuesses || 0,
          player2CorrectGuesses: room.players[Object.keys(room.players)[1]]?.correctGuesses || 0,
          endedAt: Date.now(),
          reason: 'TOO_MANY_ERRORS',
        };
      }
    }

    room.lastActivity = Date.now();
    return { outcome, cardType: card.type, gameStatus: room.status };
  }

  /**
   * Switch to next turn and roles
   */
  nextTurn(roomCode: string): GameRoom | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    room.currentTurn++;
    room.currentPhase = 'CLUE';

    if (room.currentTurn >= room.config.maxTurns) {
      room.status = 'FINISHED';
      room.result = {
        outcome: 'LOSS_TIMEOUT',
        totalTurnsPlayed: room.currentTurn,
        totalErrors: room.config.maxErrors - room.errorsRemaining,
        player1CorrectGuesses: room.players[Object.keys(room.players)[0]]?.correctGuesses || 0,
        player2CorrectGuesses: room.players[Object.keys(room.players)[1]]?.correctGuesses || 0,
        endedAt: Date.now(),
        reason: 'TURNS_EXHAUSTED',
      };
      return room;
    }

    // Switch active player and roles
    const playerIds = Object.keys(room.players);
    const currentPlayerIndex = playerIds.indexOf(room.activePlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % 2;
    room.activePlayerId = playerIds[nextPlayerIndex];

    // Switch roles
    playerIds.forEach((id, idx) => {
      const player = room.players[id];
      player.role = idx === nextPlayerIndex ? 'CLUE_GIVER' : 'GUESSER';
    });

    room.lastActivity = Date.now();
    return room;
  }

  /**
   * Check if both players found all their words
   */
  private checkWinCondition(room: GameRoom): boolean {
    return Object.values(room.players).every(p => p.correctGuesses >= 9);
  }

  /**
   * Generate key maps for each player
   */
  private generateKeyMaps(playerIds: string[], words: string[]): Record<string, KeyMap> {
    const keyMaps: Record<string, KeyMap> = {};
    const totalCards = words.length;

    // Create position pools for card types
    const positions = Array.from({ length: totalCards }, (_, i) => i);

    for (const playerId of playerIds) {
      const playerPositions = [...positions].sort(() => Math.random() - 0.5);
      const cards: Card[] = words.map((word, position) => ({
        word,
        position,
        revealed: false,
        type: 'NEUTRAL', // Will be overridden
      }));

      // Assign 9 green cards (unique per player)
      for (let i = 0; i < 9; i++) {
        cards[playerPositions[i]].type = 'GREEN';
      }

      // Assign 3 assassin cards (same for both)
      for (let i = 9; i < 12; i++) {
        cards[playerPositions[i]].type = 'ASSASSIN';
      }

      // Rest are neutral
      keyMaps[playerId] = { playerId, cards };
    }

    return keyMaps;
  }

  /**
   * Select random words from master list
   */
  private selectRandomWords(poolSize: number, gridSize: number): string[] {
    const available = [...MASTER_WORD_LIST].sort(() => Math.random() - 0.5);
    return available.slice(0, Math.min(gridSize, available.length));
  }

  /**
   * Generate unique room code
   */
  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Clean up old rooms (in-memory cleanup)
   */
  cleanupOldRooms(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [code, room] of this.rooms.entries()) {
      if (now - room.lastActivity > maxAgeMs) {
        this.rooms.delete(code);
      }
    }
  }
}

export default new GameService();
