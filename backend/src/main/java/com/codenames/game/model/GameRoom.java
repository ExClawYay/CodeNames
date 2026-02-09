package com.codenames.game.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameRoom {
    private String roomCode;
    private String hostId;
    private GameStatus status;  // WAITING, ACTIVE, FINISHED
    private LocalDateTime createdAt;
    private LocalDateTime lastActivity;
    
    // Players
    private Map<String, Player> players;  // playerId -> Player
    
    // Game state
    private List<String> words;  // 25 words on board
    private Map<String, KeyMap> keyMaps;  // playerId -> KeyMap
    private int currentTurn;  // 0-8
    private int currentPhase;  // 0 = clue, 1 = guess
    private String activePlayerId;
    private int turnsRemaining;
    private int errorsRemaining;
    
    // Game configuration
    private GameConfig config;
    
    // Game result
    private GameResult result;
    
    public enum GameStatus {
        WAITING, ACTIVE, FINISHED
    }
}
