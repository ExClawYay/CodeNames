# API Reference

## Base URL
```
http://localhost:8080/api
```

## Endpoints

### Room Management

#### Create Room
```http
POST /rooms
Content-Type: application/json

{
  "hostId": "player-123",
  "config": {
    "gridSize": 5,
    "timerSeconds": 30,
    "maxErrors": 3,
    "maxTurns": 9,
    "wordPoolSize": 100
  }
}

Response (201):
{
  "roomCode": "ABC123",
  "hostId": "player-123",
  "status": "WAITING",
  "players": {},
  "config": { ... }
}
```

#### Join Room
```http
POST /rooms/{roomCode}/join
Content-Type: application/json

{
  "playerId": "player-456",
  "nickname": "Alice"
}

Response (200):
{
  "roomCode": "ABC123",
  "players": {
    "player-123": { "nickname": "Bob", "role": "CLUE_GIVER", ... },
    "player-456": { "nickname": "Alice", "role": "GUESSER", ... }
  }
}
```

#### Get Room
```http
GET /rooms/{roomCode}

Response (200):
{
  "roomCode": "ABC123",
  "status": "WAITING",
  "players": { ... },
  "config": { ... }
}
```

### Game Control

#### Start Game
```http
POST /rooms/{roomCode}/start
Authorization: Bearer {token}

Response (200):
{
  "roomCode": "ABC123",
  "status": "ACTIVE",
  "words": ["ACROBAT", "ADHESIVE", ...],
  "currentTurn": 0,
  "currentPhase": "CLUE"
}
```

#### Submit Clue
```http
POST /rooms/{roomCode}/clue
Content-Type: application/json

{
  "playerId": "player-123",
  "clueWord": "OCEAN",
  "clueNumber": 2
}

Response (200):
{
  "success": true,
  "message": "Clue recorded",
  "phase": "GUESS"
}
```

#### Submit Guess
```http
POST /rooms/{roomCode}/guess
Content-Type: application/json

{
  "playerId": "player-456",
  "cardPosition": 7
}

Response (200):
{
  "result": "CORRECT",  // or "NEUTRAL" or "ASSASSIN"
  "cardType": "GREEN",
  "board": [ ... ],  // updated board state
  "gameStatus": "ACTIVE"
}

// If ASSASSIN:
{
  "result": "ASSASSIN",
  "gameStatus": "FINISHED",
  "outcome": "LOSS_ASSASSIN"
}
```

### WebSocket

#### Connect
```javascript
const ws = new WebSocket('ws://localhost:8080/api/ws/ABC123/player-123');

// Receive events
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // { type: "CLUE_SUBMITTED", clue: { word, number } }
  // { type: "GUESS_RESULT", result: "CORRECT", ... }
  // { type: "TURN_SWITCHED", activePlayerId: "..." }
  // { type: "GAME_FINISHED", outcome: "WIN", ... }
};
```

#### Send Message
```javascript
ws.send(JSON.stringify({
  type: "GUESS",
  cardPosition: 5
}));
```

## Error Responses

```json
{
  "error": "Room not found",
  "code": "ROOM_NOT_FOUND",
  "status": 404
}
```

Common errors:
- `ROOM_NOT_FOUND` (404)
- `INVALID_CLUE` (400)
- `GAME_NOT_ACTIVE` (409)
- `UNAUTHORIZED` (401)
- `MAX_PLAYERS_REACHED` (409)

## Rate Limiting

- 100 requests per minute per IP
- WebSocket: 1 message per 100ms per connection

## Authentication

Optional: Can be secured with JWT tokens in production:
```http
Authorization: Bearer {jwt_token}
```
