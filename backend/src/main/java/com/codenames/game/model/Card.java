package com.codenames.game.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Card {
    private String word;
    private CardType type;  // GREEN, NEUTRAL, ASSASSIN
    private boolean revealed;
    private int position;   // 0-24 on 5x5 grid

    public enum CardType {
        GREEN, NEUTRAL, ASSASSIN
    }
}
