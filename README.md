# CodeNames Duet

A real-time cooperative word deduction game where two players use one-word clues to guide each other through a 5×5 grid of cards.

## Overview

CodeNames Duet is a web-based implementation of the classic deduction game. Two players connect via a room code and take turns giving clues and guessing words. Each player has a secret key map showing which cards they need to identify (green), which are neutral (beige), and which are assassins (black).

**Goal:** Both players must identify all their target words before the 9-turn limit or hitting an assassin card.

## Features

- Real-time multiplayer gameplay via LAN/WebSocket
- Secret key maps (each player sees different card assignments)
- 30-second turn timer with clue & guessing phases
- Automatic validation of clues and guesses
- Error tracking and win/loss conditions
- Difficulty settings (grid size, timer, error limit, word pool)
- Firebase backend for persistent data
- Responsive TypeScript UI

## Project Structure

```
CodeNames/
├── backend/                    # Java backend
│   ├── src/
│   │   └── main/java/
│   │       └── com/codenames/
│   │           ├── server/
│   │           ├── game/
│   │           ├── model/
│   │           └── util/
│   ├── tests/
│   ├── pom.xml
│   └── README.md
├── frontend/                   # TypeScript/React UI
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── README.md
├── firebase/                   # Firebase config & rules
│   ├── firestore.rules
│   ├── storage.rules
│   ├── functions/
│   └── README.md
├── docs/                       # Project documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── GAME_RULES.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
├── deployment/                 # VPS deployment files
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── .env.example
│   └── README.md
├── .github/
│   └── workflows/             # CI/CD pipelines
├── .gitignore
├── LICENSE
└── CONTRIBUTING.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js 20+, Express, TypeScript |
| **Frontend** | TypeScript, React, Vite |
| **Real-time** | WebSocket (ws) |
| **Database** | Firebase Firestore |
| **Testing** | Vitest (both) |
| **Deployment** | Docker, Nginx, VPS |

## Quick Start

### Prerequisites
- Node.js 20+
- npm/yarn
- Firebase project & credentials

### Development

1. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Add Firebase credentials to .env
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Firebase Setup**
   - Create `.env.local` in frontend with:
   ```
   VITE_API_URL=http://localhost:8080/api
   ```

### Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Game Rules

- **Grid**: 5×5 (25 words)
- **Turns**: 9 total
- **Turn Time**: 30 seconds per phase
- **Target Words**: 9 green cards per player (different key maps)
- **Neutral Cards**: 13 beige cards
- **Assassin Cards**: 3 black cards (instant loss)
- **Win Condition**: Both players identify all their target words
- **Lose Condition**: Assassin chosen OR turns end before all words found

## Deployment

See `deployment/README.md` for VPS setup and `docs/DEPLOYMENT.md` for detailed instructions.

## Contributing

See `CONTRIBUTING.md` for development guidelines.

## License

See `LICENSE` file for details.

---

**Status:** Under Development  
**Last Updated:** Feb 9, 2026
