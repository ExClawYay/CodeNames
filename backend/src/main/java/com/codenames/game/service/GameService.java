package com.codenames.game.service;

import com.codenames.game.model.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class GameService {
    
    private static final List<String> MASTER_WORD_LIST = Arrays.asList(
        "ACROBAT", "ADHESIVE", "ALARM", "ALCOHOL", "ANGEL", "ANGER", "ANGLE",
        "ANIMAL", "ANKLE", "ANSWER", "ANTACID", "ANTELOPE", "ANVIL", "APES",
        // Add full 100-word list here or load from resource file
        "ARCTIC", "AREA", "ARGUMENT", "ARK", "ARM", "ARMY", "ARROW", "ART"
    );
    
    /**
     * Create a new game room with initial configuration
     */
    public GameRoom createGameRoom(String hostId, GameConfig config) {
        String roomCode = generateRoomCode();
        GameRoom room = new GameRoom();
        room.setRoomCode(roomCode);
        room.setHostId(hostId);
        room.setStatus(GameRoom.GameStatus.WAITING);
        room.setPlayers(new HashMap<>());
        room.setConfig(config != null ? config : GameConfig.getDefault());
        room.setCurrentTurn(0);
        room.setTurnsRemaining(config.getMaxTurns());
        room.setErrorsRemaining(config.getMaxErrors());
        return room;
    }
    
    /**
     * Start the game: select words, generate key maps, assign players
     */
    public void startGame(GameRoom room) {
        List<String> selectedWords = selectRandomWords(room.getConfig().getWordPoolSize(), 
                                                       room.getConfig().getGridSize() * room.getConfig().getGridSize());
        room.setWords(selectedWords);
        room.setKeyMaps(generateKeyMaps(room.getPlayers().keySet(), selectedWords));
        room.setStatus(GameRoom.GameStatus.ACTIVE);
        assignInitialRoles(room);
    }
    
    /**
     * Process a clue submission
     */
    public void submitClue(GameRoom room, String playerId, String clueWord, int clueNumber) {
        // Validate clue (single word, valid number)
        // Store clue in game state
        // Switch to guessing phase
        // Set timer
    }
    
    /**
     * Process a word guess
     */
    public boolean submitGuess(GameRoom room, String playerId, int cardPosition) {
        // Get card type from current player's key map
        Card.CardType cardType = room.getKeyMaps().get(playerId).getCards().get(cardPosition).getType();
        
        // Update game state based on card type
        if (cardType == Card.CardType.ASSASSIN) {
            room.setStatus(GameRoom.GameStatus.FINISHED);
            GameResult result = new GameResult();
            result.setOutcome(GameResult.GameOutcome.LOSS_ASSASSIN);
            result.setReason("ASSASSIN_FOUND");
            room.setResult(result);
            return false;  // Game ends
        } else if (cardType == Card.CardType.GREEN) {
            room.getPlayers().get(playerId).setCorrectGuesses(
                room.getPlayers().get(playerId).getCorrectGuesses() + 1
            );
            return true;  // Can continue guessing
        } else {
            // NEUTRAL card
            room.setErrorsRemaining(room.getErrorsRemaining() - 1);
            return false;  // Turn ends
        }
    }
    
    /**
     * Check win condition
     */
    public boolean checkWinCondition(GameRoom room) {
        return room.getPlayers().values().stream()
            .allMatch(p -> p.getCorrectGuesses() >= 9);
    }
    
    /**
     * Switch player roles for next turn
     */
    public void switchRoles(GameRoom room) {
        for (Player p : room.getPlayers().values()) {
            if (p.getRole() == Player.PlayerRole.CLUE_GIVER) {
                p.setRole(Player.PlayerRole.GUESSER);
            } else {
                p.setRole(Player.PlayerRole.CLUE_GIVER);
            }
        }
    }
    
    /**
     * Generate unique key maps for each player
     */
    private Map<String, KeyMap> generateKeyMaps(Set<String> playerIds, List<String> words) {
        Map<String, KeyMap> keyMaps = new HashMap<>();
        List<String> players = new ArrayList<>(playerIds);
        
        // Distribute cards: 9 green, 13 neutral, 3 assassin per player (but different green cards)
        for (String playerId : players) {
            KeyMap keyMap = new KeyMap();
            keyMap.setPlayerId(playerId);
            keyMap.setCards(new ArrayList<>());
            
            // Create cards for this player
            for (int i = 0; i < words.size(); i++) {
                Card card = new Card();
                card.setWord(words.get(i));
                card.setPosition(i);
                card.setRevealed(false);
                // Type assignment will be random but ensure 9 green per player
                keyMap.getCards().add(card);
            }
            
            keyMaps.put(playerId, keyMap);
        }
        
        return keyMaps;
    }
    
    /**
     * Select random words from master list
     */
    private List<String> selectRandomWords(int poolSize, int gridSize) {
        List<String> available = new ArrayList<>(MASTER_WORD_LIST);
        Collections.shuffle(available);
        return available.subList(0, Math.min(gridSize, available.size()));
    }
    
    /**
     * Assign initial clue giver and guesser roles
     */
    private void assignInitialRoles(GameRoom room) {
        List<String> playerIds = new ArrayList<>(room.getPlayers().keySet());
        if (playerIds.size() >= 2) {
            room.getPlayers().get(playerIds.get(0)).setRole(Player.PlayerRole.CLUE_GIVER);
            room.getPlayers().get(playerIds.get(1)).setRole(Player.PlayerRole.GUESSER);
        }
    }
    
    /**
     * Generate a unique room code
     */
    private String generateRoomCode() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
