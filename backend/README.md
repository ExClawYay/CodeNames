# Backend - Node.js/Express

The backend is now a lightweight Node.js/Express server written entirely in TypeScript.

## Quick Start

### Development

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:8080`

### Production

```bash
npm install --production
npm run build
npm start
```

## Structure

```
src/
├── server.ts              # Main Express app + server setup
├── routes/
│   └── rooms.ts          # REST endpoints for room management
├── services/
│   └── GameService.ts    # Core game logic
├── websocket/
│   └── WebSocketHandler.ts  # Real-time game updates
├── models/
│   └── game.ts           # TypeScript interfaces
└── config/
    └── firebase.ts       # Firebase initialization
```

## API Endpoints

### REST

```
POST   /api/rooms                    Create room
GET    /api/rooms/:roomCode          Get room state
POST   /api/rooms/:roomCode/join     Join room
POST   /api/rooms/:roomCode/start    Start game
POST   /api/rooms/:roomCode/guess    Submit guess
POST   /api/rooms/:roomCode/next-turn Move to next turn
```

### WebSocket

```
ws://localhost:8080/api/ws/:roomCode/:playerId
```

**Messages:**
- `GUESS` - Submit a card guess
- `CLUE` - Give a clue
- `NEXT_TURN` - Advance to next turn
- `HEARTBEAT` - Keep-alive ping

**Broadcasts:**
- `ROOM_STATE` - Current game state
- `GUESS_RESULT` - Result of a guess
- `CLUE_SUBMITTED` - New clue given
- `TURN_SWITCHED` - Turn/role change
- `GAME_FINISHED` - Game ended

## Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Required environment variables:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `PORT` (default: 8080)

## Testing

```bash
npm test
```

## Deployment

Minimal requirements:
- Node.js 20+
- 512MB RAM
- 10MB disk space

See `/docs/DEPLOYMENT.md` for full VPS setup guide.
