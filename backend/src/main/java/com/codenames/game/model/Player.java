package com.codenames.game.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Player {
    private String playerId;
    private String nickname;
    private PlayerRole role;  // CLUE_GIVER or GUESSER
    private int correctGuesses;
    private boolean connected;
    private long lastHeartbeat;
    
    public enum PlayerRole {
        CLUE_GIVER, GUESSER
    }
}
