import express from 'express'
import gameService from '../services/GameService'

const router = express.Router()

/**
 * POST /api/rooms
 * Create a new game room
 */
router.post('/', (req, res) => {
  try {
    const { hostId, config } = req.body

    if (!hostId) {
      res.status(400).json({ error: 'hostId is required' })
      return
    }

    const room = gameService.createRoom(hostId, config)
    res.status(201).json(room)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/rooms/:roomCode
 * Get room details
 */
router.get('/:roomCode', (req, res) => {
  try {
    const { roomCode } = req.params
    const room = gameService.getRoom(roomCode)

    if (!room) {
      res.status(404).json({ error: 'Room not found' })
      return
    }

    res.json(room)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/rooms/:roomCode/join
 * Join an existing room
 */
router.post('/:roomCode/join', (req, res) => {
  try {
    const { roomCode } = req.params
    const { playerId, nickname } = req.body

    if (!playerId || !nickname) {
      res.status(400).json({ error: 'playerId and nickname are required' })
      return
    }

    const room = gameService.joinRoom(roomCode, playerId, nickname)
    if (!room) {
      res.status(404).json({ error: 'Room not found or full' })
      return
    }

    res.json(room)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/rooms/:roomCode/start
 * Start the game
 */
router.post('/:roomCode/start', (req, res) => {
  try {
    const { roomCode } = req.params
    const room = gameService.startGame(roomCode)

    if (!room) {
      res.status(404).json({ error: 'Room not found or not ready' })
      return
    }

    res.json(room)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/rooms/:roomCode/clue
 * Submit a clue
 */
router.post('/:roomCode/clue', (req, res) => {
  try {
    const { roomCode } = req.params
    const { playerId, clueWord, clueNumber } = req.body

    if (!clueWord || typeof clueNumber !== 'number') {
      res.status(400).json({ error: 'clueWord and clueNumber are required' })
      return
    }

    try {
      const room = gameService.submitClue(roomCode, playerId, clueWord, clueNumber)
      if (!room) {
        res.status(400).json({ error: 'Failed to submit clue' })
        return
      }

      res.json({
        success: true,
        room,
      })
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/rooms/:roomCode/guess
 * Submit a guess
 */
router.post('/:roomCode/guess', (req, res) => {
  try {
    const { roomCode } = req.params
    const { playerId, cardPosition } = req.body

    if (typeof cardPosition !== 'number') {
      res.status(400).json({ error: 'cardPosition is required' })
      return
    }

    const result = gameService.processGuess(roomCode, playerId, cardPosition)
    if (!result) {
      res.status(400).json({ error: 'Invalid guess' })
      return
    }

    const room = gameService.getRoom(roomCode)
    res.json({
      ...result,
      room,
    })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/rooms/:roomCode/next-turn
 * Move to next turn
 */
router.post('/:roomCode/next-turn', (req, res) => {
  try {
    const { roomCode } = req.params
    const room = gameService.nextTurn(roomCode)

    if (!room) {
      res.status(404).json({ error: 'Room not found' })
      return
    }

    res.json(room)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
