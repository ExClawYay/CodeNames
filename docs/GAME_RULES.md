# Codenames Duet - Game Rules

## Overview

A cooperative, real-time deduction game for **exactly 2 players**. Players take turns giving one-word clues and guessing words on a 5×5 board. Each player has a secret "key map" showing which cards belong to them.

## The Board

- **25 cards** arranged in a 5×5 grid
- Each card shows a single word
- Key map distribution:
  - **9 green cards** (target words per player, different for each)
  - **13 neutral cards** (beige, nothing happens)
  - **3 assassin cards** (black, instant loss if guessed)

## Game Flow

### Setup
1. Player 1 (host) creates a room and sets difficulty
2. Player 2 joins using the room code
3. System generates 25 random words for the board
4. Each player receives a secret key map (different green card positions)

### Turn Structure
**9 total turns, each with 2 phases:**

#### Phase 1: Clue (30 seconds)
- Active player (clue giver) gives a **single-word clue**
- Clue is accompanied by a **number** (how many target words relate to it)
- Example: "Ocean – 2" means 2 words on the board are related to ocean

**Clue Rules:**
- Must be exactly ONE word (no hyphens, no numbers in the word itself)
- Cannot be a word currently on the board
- Cannot reference board positions or colors
- Number must be 1–9

#### Phase 2: Guessing (30 seconds)
- Other player (guesser) selects cards they think match the clue
- Can guess **up to** the number given (doesn't have to use all)
- Can **stop early** at any time
- Each guess reveals the card immediately

**Guess Outcomes:**

| Card Type | Outcome | What Happens |
|-----------|---------|--------------|
| **Green** | ✅ Correct | Card stays revealed. Guesser gets a point. Can continue guessing. |
| **Neutral** | ⚠️ Mistake | Card stays revealed with error mark. **Turn ends immediately.** Error counter increments. |
| **Assassin** | ❌ Game Over | Game ends. **Both players lose.** |

### Turn Switching
- After guessing phase ends, roles switch
- Previous guesser becomes clue giver
- Continue with next turn

## Winning

**WIN Condition:**
- Both players identify **all of their target words** (9 each) **before all 9 turns end**
- Example: If both have guessed all 18 target words by turn 5, they win immediately

**LOSS Conditions:**
1. **Assassin selected** – Game over instantly, both lose
2. **Turns run out** – If 9 turns end and not all target words found, both lose
3. **Disconnect** – If a player disconnects for >30 seconds, game is forfeit (loss)

## Difficulty Settings

The host can customize before starting:

| Setting | Default | Options |
|---------|---------|---------|
| **Grid Size** | 5×5 (25 cards) | 4×4, 6×6, 7×7 |
| **Timer** | 30 sec/phase | 20, 30, 45, 60 sec |
| **Max Errors** | 3 | 1, 2, 3, 4, 5 |
| **Max Turns** | 9 | 7, 9, 11, 13 |
| **Word Pool** | 100 words | 75, 100, 150, 200+ |

## Strategy Tips

**For Clue Givers:**
- Look at your 9 target words and think of themes or connections
- Give clues that are as specific as possible to your cards
- Consider what neutral words might mislead your partner
- Track which target words have been found

**For Guessers:**
- Listen carefully to the clue and previous clues given
- Consider the number given (it limits your guesses)
- Be cautious if multiple words fit the clue
- Pay attention to board patterns and what's already revealed

**Communication:**
- Develop shared language (inside jokes, themes)
- Remember previous clues and what cards they revealed
- Build context over turns about each other's clue styles

## Examples

### Good Clue
- Target words: OCEAN, WATER, BEACH
- Clue: "Seaside – 3" ✅

### Bad Clue
- Cannot say "Seaside-things" (must be single word)
- Cannot say "S-words" (references position)
- Cannot say "Blue" if blue cards are visible (too obvious)
- Cannot say "WATER" if WATER is on the board (can't use board words)

### Guess Scenario
- Clue given: "Animal – 2"
- Board has: DOG, CAT, HORSE, RABBIT
- Guesser picks: DOG (green ✅), CAT (green ✅), HORSE (neutral ⚠️)
- **Turn ends** because of neutral card
- Error counter +1

## Cards & Roles

### Player 1 (Host/Clue Giver First)
- Gives the first clue
- Sees their own 9 target words in their key map
- Cannot see opponent's green words

### Player 2 (Joiner/Guesser First)
- Guesses from clue
- Sees their own 9 target words (different from Player 1)
- Cannot see opponent's green words

---

**Remember:** You're working together. Both players must find all their words, or you both lose! 🎯
