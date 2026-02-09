package com.codenames.game.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KeyMap {
    private String playerId;
    private List<Card> cards;  // 25 cards with assigned types
    
    public int countGreenCards() {
        return (int) cards.stream()
            .filter(c -> c.getType() == Card.CardType.GREEN)
            .count();
    }
    
    public int countNeutralCards() {
        return (int) cards.stream()
            .filter(c -> c.getType() == Card.CardType.NEUTRAL)
            .count();
    }
    
    public int countAssassinCards() {
        return (int) cards.stream()
            .filter(c -> c.getType() == Card.CardType.ASSASSIN)
            .count();
    }
}
