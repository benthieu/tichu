import { CardType } from './card/card.model';
import {DeckFactory} from './card/deck.factory';
import {Player} from '../player/player.class';
import { CardCombinations } from './card/card-combinations';

export class GameLeader {
  private deckFactory = new DeckFactory();
  private players = [new Player(), new Player(), new Player(), new Player()];
  private currentlyPlaying = 0;

  constructor() {
    this.startGame();
  }
  
  public startGame(): void {
    this.giveOutCards();
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  private giveOutCards(): void {
    const deck = this.deckFactory.shuffleCards(this.deckFactory.createDeck());
    this.players.forEach((player, index) => {
      player.addHandCards(
        deck.slice(
          (index * deck.length) / this.players.length,
          ((index + 1) * deck.length) / this.players.length
        )
      );
    });
    const startingIndex = deck.findIndex((card) => {
      return card.type === CardType.MAHJONG;
    });
    this.currentlyPlaying = Math.floor(startingIndex / deck.length * 4);
  }
}
