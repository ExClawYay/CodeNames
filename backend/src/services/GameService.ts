import { v4 as uuidv4 } from 'uuid'
import { GameRoom, GameConfig, Card, KeyMap, Player } from '../models/game'

// Master word list (100 words)
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
]

export class GameService {
  private rooms: Map<string, GameRoom> = new Map()

  /**
   * Create a new game room
   */
  createRoom(hostId: string, config?: Partial<GameConfig>): GameRoom {
    const roomCode = this.generateRoomCode()
    const defaultConfig: GameConfig = {
      gridSize: 5,
      timerSeconds: 30,
      maxErrors: 3,
      maxTurns: 9,
      wordPoolSize: 100,
      ...config
    }

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
      revealedCards: [],
      guessesThisTurn: 0,
      guessCountAllowed: 0,
      config: defaultConfig,
    }

    this.rooms.set(roomCode, room)
    return room
  }

  /**
   * Get a room by code
   */
  getRoom(roomCode: string): GameRoom | null {
    return this.rooms.get(roomCode) || null
  }

  /**
   * Add player to room
   */
  joinRoom(roomCode: string, playerId: string, nickname: string): GameRoom | null {
    const room = this.getRoom(roomCode)
    if (!room) return null

    if (Object.keys(room.players).length >= 2) {
      throw new Error('Room is full')
    }

    room.players[playerId] = {
      playerId,
      nickname,
      role: Object.keys(room.players).length === 0 ? 'CLUE_GIVER' : 'GUESSER',
      correctGuesses: 0,
      connected: true,
      lastHeartbeat: Date.now(),
    }

    room.lastActivity = Date.now()
    return room
  }

  /**
   * Start the game
   */
  startGame(roomCode: string): GameRoom | null {
    const room = this.getRoom(roomCode)
    if (!room || Object.keys(room.players).length < 2) return null

    // Select words
    const selectedWords = this.selectRandomWords(
      room.config.wordPoolSize,
      room.config.gridSize * room.config.gridSize
    )
    room.words = selectedWords

    // Generate key maps (different green cards per player)
    room.keyMaps = this.generateKeyMaps(Object.keys(room.players), selectedWords)

    // Initialize revealed cards tracking
    room.revealedCards = []

    // Set active player (first player starts as clue giver)
    const playerIds = Object.keys(room.players)
    room.activePlayerId = playerIds[0]
    room.players[playerIds[0]].role = 'CLUE_GIVER'
    room.players[playerIds[1]].role = 'GUESSER'

    room.status = 'ACTIVE'
    room.currentTurn = 0
    room.currentPhase = 'CLUE'
    room.guessesThisTurn = 0
    room.guessCountAllowed = 0

    room.lastActivity = Date.now()

    return room
  }

  /**
   * Validate and process a clue
   */
  validateClue(roomCode: string, playerId: string, clueWord: string, clueNumber: number): {
    valid: boolean
    error?: string
  } {
    const room = this.getRoom(roomCode)
    if (!room) return { valid: false, error: 'Room not found' }

    if (room.currentPhase !== 'CLUE') {
      return { valid: false, error: 'Not clue phase' }
    }

    if (room.activePlayerId !== playerId) {
      return { valid: false, error: 'Not your turn' }
    }

    // Check single word (no spaces, hyphens, numbers)
    if (!clueWord || clueWord.trim().length === 0) {
      return { valid: false, error: 'Clue cannot be empty' }
    }

    if (clueWord.includes(' ') || clueWord.includes('-')) {
      return { valid: false, error: 'Clue must be a single word' }
    }

    if (/\d/.test(clueWord)) {
      return { valid: false, error: 'Clue cannot contain numbers' }
    }

    // Check clue is not on board
    const boardWords = room.words.map(w => w.toUpperCase())
    if (boardWords.includes(clueWord.toUpperCase())) {
      return { valid: false, error: 'Clue cannot be a word on the board' }
    }

    // Check number is valid
    if (typeof clueNumber !== 'number' || clueNumber < 1 || clueNumber > 9) {
      return { valid: false, error: 'Number must be between 1 and 9' }
    }

    return { valid: true }
  }

  /**
   * Submit a clue and switch to guessing phase
   */
  submitClue(roomCode: string, playerId: string, clueWord: string, clueNumber: number): GameRoom | null {
    const room = this.getRoom(roomCode)
    if (!room) return null

    const validation = this.validateClue(roomCode, playerId, clueWord, clueNumber)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    room.clueGiven = {
      word: clueWord.toUpperCase(),
      number: clueNumber
    }

    // Switch to guessing phase
    room.currentPhase = 'GUESS'
    room.guessesThisTurn = 0
    room.guessCountAllowed = clueNumber

    room.lastActivity = Date.now()
    return room
  }

  /**
   * Process a guess
   */
  processGuess(roomCode: string, playerId: string, cardPosition: number): {
    outcome: 'CORRECT' | 'NEUTRAL' | 'ASSASSIN'
    cardType: string
    gameStatus: string
    guessesUsed: number
    guessesAllowed: number
  } | null {
    const room = this.getRoom(roomCode)
    if (!room || room.status !== 'ACTIVE') return null

    if (room.currentPhase !== 'GUESS') {
      return null
    }

    // Only guesser can guess
    const player = room.players[playerId]
    if (!player || player.role !== 'GUESSER') {
      return null
    }

    const keyMap = room.keyMaps[playerId]
    if (!keyMap) return null

    const card = keyMap.cards[cardPosition]
    if (!card) return null

    // Check card is not already revealed
    if (room.revealedCards.includes(cardPosition)) {
      return null
    }

    // Mark card as revealed
    room.revealedCards.push(cardPosition)
    card.revealed = true

    // Update all players' key maps to show revelation
    Object.values(room.keyMaps).forEach(km => {
      km.cards[cardPosition].revealed = true
    })

    let outcome: 'CORRECT' | 'NEUTRAL' | 'ASSASSIN'
    room.guessesThisTurn++

    if (card.type === 'ASSASSIN') {
      outcome = 'ASSASSIN'
      room.status = 'FINISHED'
      room.result = {
        outcome: 'LOSS_ASSASSIN',
        totalTurnsPlayed: room.currentTurn + 1,
        totalErrors: room.config.maxErrors - room.errorsRemaining,
        player1CorrectGuesses: room.players[Object.keys(room.players)[0]]?.correctGuesses || 0,
        player2CorrectGuesses: room.players[Object.keys(room.players)[1]]?.correctGuesses || 0,
        endedAt: Date.now(),
        reason: 'ASSASSIN_FOUND',
      }
    } else if (card.type === 'GREEN') {
      outcome = 'CORRECT'
      const clueGiver = Object.values(room.players).find(p => p.role === 'CLUE_GIVER')
      if (clueGiver) {
        clueGiver.correctGuesses++
      }

      // Check win condition
      if (this.checkWinCondition(room)) {
        room.status = 'FINISHED'
        room.result = {
          outcome: 'WIN',
          totalTurnsPlayed: room.currentTurn + 1,
          totalErrors: room.config.maxErrors - room.errorsRemaining,
          player1CorrectGuesses: room.players[Object.keys(room.players)[0]]?.correctGuesses || 0,
          player2CorrectGuesses: room.players[Object.keys(room.players)[1]]?.correctGuesses || 0,
          endedAt: Date.now(),
          reason: 'ALL_WORDS_FOUND',
        }
      }
    } else {
      // NEUTRAL card
      outcome = 'NEUTRAL'
      room.errorsRemaining--

      if (room.errorsRemaining <= 0) {
        room.status = 'FINISHED'
        room.result = {
          outcome: 'LOSS_TIMEOUT',
          totalTurnsPlayed: room.currentTurn + 1,
          totalErrors: room.config.maxErrors,
          player1CorrectGuesses: room.players[Object.keys(room.players)[0]]?.correctGuesses || 0,
          player2CorrectGuesses: room.players[Object.keys(room.players)[1]]?.correctGuesses || 0,
          endedAt: Date.now(),
          reason: 'TOO_MANY_ERRORS',
        }
      }
    }

    room.lastActivity = Date.now()

    return {
      outcome,
      cardType: card.type,
      gameStatus: room.status,
      guessesUsed: room.guessesThisTurn,
      guessesAllowed: room.guessCountAllowed
    }
  }

  /**
   * Check if should end turn (either neutral card or guess limit reached)
   */
  shouldEndTurn(roomCode: string): boolean {
    const room = this.getRoom(roomCode)
    if (!room) return false

    // End if guess limit reached
    return room.guessesThisTurn >= room.guessCountAllowed
  }

  /**
   * Switch to next turn
   */
  nextTurn(roomCode: string): GameRoom | null {
    const room = this.getRoom(roomCode)
    if (!room) return null

    room.currentTurn++

    // Check if game should end (turns exhausted)
    if (room.currentTurn >= room.config.maxTurns) {
      room.status = 'FINISHED'
      room.result = {
        outcome: 'LOSS_TIMEOUT',
        totalTurnsPlayed: room.currentTurn,
        totalErrors: room.config.maxErrors - room.errorsRemaining,
        player1CorrectGuesses: room.players[Object.keys(room.players)[0]]?.correctGuesses || 0,
        player2CorrectGuesses: room.players[Object.keys(room.players)[1]]?.correctGuesses || 0,
        endedAt: Date.now(),
        reason: 'TURNS_EXHAUSTED',
      }
      return room
    }

    // Reset turn state
    room.currentPhase = 'CLUE'
    room.guessesThisTurn = 0
    room.guessCountAllowed = 0
    room.clueGiven = undefined

    // Switch active player
    const playerIds = Object.keys(room.players)
    const currentIndex = playerIds.indexOf(room.activePlayerId)
    const nextIndex = (currentIndex + 1) % 2
    room.activePlayerId = playerIds[nextIndex]

    // Switch roles
    playerIds.forEach((id, idx) => {
      room.players[id].role = idx === nextIndex ? 'CLUE_GIVER' : 'GUESSER'
    })

    room.lastActivity = Date.now()
    return room
  }

  /**
   * Check if both players found all their words
   */
  private checkWinCondition(room: GameRoom): boolean {
    return Object.values(room.players).every(p => p.correctGuesses >= 9)
  }

  /**
   * Generate key maps for each player with different green cards
   */
  private generateKeyMaps(playerIds: string[], words: string[]): Record<string, KeyMap> {
    const keyMaps: Record<string, KeyMap> = {}
    const totalCards = words.length

    // Determine card distribution
    const greenPerPlayer = 9
    const neutralCount = totalCards - (greenPerPlayer * 2) - 3 // 3 assassins total
    const assassinCount = 3

    // Create position arrays for shuffling
    const positions = Array.from({ length: totalCards }, (_, i) => i)

    for (const playerId of playerIds) {
      // Shuffle positions for this player's random card assignment
      const shuffledPositions = [...positions].sort(() => Math.random() - 0.5)

      const cards: Card[] = words.map((word, position) => ({
        word,
        position,
        revealed: false,
        type: 'NEUTRAL', // Default, will be overridden
      }))

      // Assign 9 unique green cards per player
      for (let i = 0; i < greenPerPlayer; i++) {
        cards[shuffledPositions[i]].type = 'GREEN'
      }

      // Assassin cards are the same for both players
      const assassinPositions = shuffledPositions.slice(
        greenPerPlayer + neutralCount,
        greenPerPlayer + neutralCount + assassinCount
      )
      assassinPositions.forEach(pos => {
        cards[pos].type = 'ASSASSIN'
      })

      keyMaps[playerId] = { playerId, cards }
    }

    return keyMaps
  }

  /**
   * Select random words from master list
   */
  private selectRandomWords(poolSize: number, gridSize: number): string[] {
    const available = [...MASTER_WORD_LIST].sort(() => Math.random() - 0.5)
    return available.slice(0, Math.min(gridSize, available.length))
  }

  /**
   * Generate unique room code
   */
  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  /**
   * Clean up old rooms
   */
  cleanupOldRooms(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    for (const [code, room] of this.rooms.entries()) {
      if (now - room.lastActivity > maxAgeMs) {
        this.rooms.delete(code)
      }
    }
  }
}

export default new GameService()
