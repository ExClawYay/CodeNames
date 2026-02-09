package com.codenames.game.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameConfig {
    private int gridSize;           // 5 = 5x5 (default), 6 = 6x6, etc.
    private int timerSeconds;       // per phase (default: 30)
    private int maxErrors;          // errors before loss (default: depends on grid)
    private int maxTurns;           // total turns (default: 9)
    private int wordPoolSize;       // available words (default: 100)
    
    public static GameConfig getDefault() {
        return new GameConfig(5, 30, 3, 9, 100);
    }
}
