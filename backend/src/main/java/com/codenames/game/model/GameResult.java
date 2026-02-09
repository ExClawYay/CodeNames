package com.codenames.game.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameResult {
    private GameOutcome outcome;  // WIN, LOSS, TIMEOUT
    private String winnerPlayerId;  // if applicable
    private int totalTurnsPlayed;
    private int totalErrors;
    private int player1CorrectGuesses;
    private int player2CorrectGuesses;
    private LocalDateTime endedAt;
    private String reason;  // WIN, ASSASSIN_FOUND, TIMEOUT, etc.
    
    public enum GameOutcome {
        WIN, LOSS_ASSASSIN, LOSS_TIMEOUT, LOSS_DISCONNECTED
    }
}
