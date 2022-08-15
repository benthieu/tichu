import { CardCombinations, CombinationType } from '../game/card/card-combinations';
import {Card, CardColor, CardType} from '../game/card/card.model';
import {Player} from '../player/player.class';

export class Playground {
  private combinator: CardCombinations = new CardCombinations();
  
  constructor(private players: Player[]) {
    players.forEach((player, playerIndex) => {
      player.getHandCards().subscribe((cards) => {
        if (playerIndex === 0) {
          this.drawPlayerHand0(cards);
          console.log(this.combinator.getCombinations(cards));
        } else {
          this.drawPlayerHand(cards, playerIndex);
        }
      });
    });
  }

  private drawPlayerHand0(cards: Card[]): void {
    const playerDiv = document.getElementById('player-0');
    cards.forEach((card, cardIndex) => {
      const el = document.createElement('div');
      el.setAttribute('class', `card card-${cardIndex}`);
      const image = document.createElement('img');
      const asset = this.getCardAsset(card);
      image.setAttribute('src', asset);
      el.appendChild(image);
      playerDiv?.appendChild(el);
    });
  }

  private drawPlayerHand(cards: Card[], playerIndex: number): void {
    const playerDiv = document.getElementById(`player-${playerIndex}`);
    cards.forEach((_, cardIndex) => {
      const el = document.createElement('div');
      el.setAttribute('class', `card card-${cardIndex}`);
      const image = document.createElement('img');
      image.setAttribute('src', 'assets/back.png');
      el.appendChild(image);
      playerDiv?.appendChild(el);
    });
  }

  private getCardAsset(card: Card): string {
    let assetName = '';
    switch (card.type) {
      case CardType.DOG:
        assetName = 'dog';
        break;
      case CardType.DRAGON:
        assetName = 'dragon';
        break;
      case CardType.MAHJONG:
        assetName = 'mahjong';
        break;
      case CardType.PHOENIX:
        assetName = 'phoenix';
        break;
      case CardType.NORMAL:
        switch (card.color) {
          case CardColor.JADE:
            assetName = 'spade_';
            break;
          case CardColor.PAGODA:
            assetName = 'heart_';
            break;
          case CardColor.STAR:
            assetName = 'diamond_';
            break;
          case CardColor.SWORD:
            assetName = 'club_';
            break;
        }
        assetName += card.index;
        break;
    }
    return `assets/${assetName}.png`;
  }
}
