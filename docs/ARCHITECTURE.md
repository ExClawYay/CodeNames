# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React/TS)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages: Home, Lobby, Game, Results                    │   │
│  │ Components: GameBoard, Card, Timer, ClueBox          │   │
│  │ Services: gameAPI, firebaseService                   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP + WebSocket
┌────────────────────▼────────────────────────────────────────┐
│                Backend (Java/Spring Boot)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Controllers: RoomController, GameController          │   │
│  │ Services: GameService, RoomService                   │   │
│  │ WebSocket: GameWebSocketHandler                      │   │
│  │ Models: GameRoom, Player, KeyMap, Card               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API + WebSocket
┌────────────────────▼────────────────────────────────────────┐
│                  Firebase Cloud (Firestore + Auth)          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Collections: rooms, games, players, statistics       │   │
│  │ Authentication: Firebase Auth                        │   │
│  │ Real-time sync via Firestore listeners               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Layer

**Pages:**
- `HomePage.tsx` - Create/Join room interface
- `LobbyPage.tsx` - Wait for players, game config
- `GamePage.tsx` - Main game board & interaction
- `ResultsPage.tsx` - Win/loss summary

**Components:**
- `GameBoard.tsx` - 5×5 card grid
- `Card.tsx` - Individual card with reveal logic
- `Timer.tsx` - 30-second turn countdown
- `ClueBox.tsx` - Clue submission form
- `PlayerPanel.tsx` - Player status & stats

**Services:**
- `gameAPI.ts` - REST client for backend
- `firebaseService.ts` - Firestore real-time updates
- `webSocketService.ts` - WebSocket connection manager

### Backend Layer

**Controllers:**
- `RoomController.java` - Create, join, get rooms
- `GameController.java` - Start game, submit clue/guess
- `WebSocketController.java` - Handle WebSocket messages

**Services:**
- `GameService.java` - Core game logic (turns, validation, win/loss)
- `RoomService.java` - Room management
- `KeyMapService.java` - Generate & manage key maps
- `WordService.java` - Word selection & validation

**Models:**
- `GameRoom.java` - Room state
- `Player.java` - Player info & role
- `Card.java` - Individual card representation
- `KeyMap.java` - Secret mapping for each player
- `GameConfig.java` - Difficulty settings

### Data Layer (Firebase)

**Collections:**

```
rooms/
├── {roomCode}
│   ├── hostId: string
│   ├── status: "WAITING" | "ACTIVE" | "FINISHED"
│   ├── createdAt: timestamp
│   └── players/
│       ├── {playerId}
│       │   ├── nickname: string
│       │   ├── role: "CLUE_GIVER" | "GUESSER"
│       │   └── correctGuesses: number

games/
├── {gameId}
│   ├── roomCode: string
│   ├── currentTurn: number
│   ├── activePlayerId: string
│   ├── words: [string...]
│   └── history/
│       ├── clues: [{word, number, playerId, timestamp}...]
│       └── guesses: [{position, outcome, playerId}...]

statistics/
├── {playerId}
│   ├── totalGames: number
│   ├── wins: number
│   ├── avgTurnsToWin: number
│   └── bestScore: number
```

## Communication Flow

### Real-Time Updates (WebSocket)

```
Client                              Server
  │                                   │
  ├─── WebSocket Connect ────────────>│
  │                                   │
  │<─── Room State Update ────────────┤
  │                                   │
  ├─── Submit Clue ──────────────────>│
  │                                   │ (Validate & process)
  │<─── Clue Broadcast ───────────────┤
  │                                   │
  ├─── Submit Guess ─────────────────>│
  │                                   │ (Check card type)
  │<─── Guess Result ─────────────────┤
  │<─── Board Update ─────────────────┤
  │<─── Turn Switch ──────────────────┤
  │                                   │
```

### Game State Synchronization

1. **Initial Load**: Player joins room → Backend returns game state
2. **Real-Time**: WebSocket broadcasts all game events to both players
3. **Fallback**: REST API for polling if WebSocket fails
4. **Persistence**: Firestore backup of game state (async)

## Security Considerations

### Frontend
- No secret key maps in session storage
- WebSocket connection authenticated via room code + player ID
- CORS restricted to same origin

### Backend
- Key maps never sent to frontend (generated server-side)
- Player can only see their own key map
- Clue validation (single word, no numbers)
- Game state mutations logged

### Firebase
- Firestore rules restrict access to own room/player data
- Auth via custom tokens
- Real-time listeners for game updates

## Scalability

### Current Design (2 players per room)
- Max concurrent rooms: Unlimited (stateless backend)
- WebSocket connections: 2 per room
- Database writes: ~5 per turn (guess + state updates)

### Future Enhancements
- Room codes -> UUID mapping (DNS-style)
- Redis caching for room state
- Database connection pooling
- Horizontal scaling with load balancer
