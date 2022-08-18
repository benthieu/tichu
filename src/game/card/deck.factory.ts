import {Card, CardColor, CardType} from './card.model';

export class DeckFactory {
  public createDeck(): Card[] {
    return [...this.createSpecialCards(), ...this.createNormalCards()];
  }

  public shuffleCards(initial: Card[]): Card[] {
    return initial
      .map((value) => ({value, sort: Math.random()}))
      .sort((a, b) => a.sort - b.sort)
      .map(({value}) => value);
  }

  private createSpecialCards(): Card[] {
    const cards: Card[] = [];
    for (let color of [
      CardColor.JADE,
      CardColor.PAGODA,
      CardColor.STAR,
      CardColor.SWORD,
    ]) {
      for (let index = 2; index <= 14; index++) {
        cards.push(this.createCard(color, index));
      }
    }
    return cards;
  }

  private createNormalCards(): Card[] {
    const cards: Card[] = [];
    cards.push(DeckFactory.getDogCard());
    cards.push(DeckFactory.getDragonCard());
    cards.push(DeckFactory.getMahjongCard());
    cards.push(DeckFactory.getPhoenixCard());
    return cards;
  }

  private createCard(color: CardColor, index: number): Card {
    return {
      type: CardType.NORMAL,
      color: color,
      index: index,
      points: index === 10 || index === 13 ? 10 : 0,
    };
  }

  public static getDogCard(): Card {
    return {
      type: CardType.DOG,
      index: 0,
      points: 0,
    };
  }

  public static getMahjongCard(): Card {
    return {
      type: CardType.MAHJONG,
      index: 1,
      points: 0,
    };
  }

  public static getDragonCard(): Card {
    return {
      type: CardType.DRAGON,
      index: 15,
      points: 25,
    };
  }

  public static getPhoenixCard(): Card {
    return {
      type: CardType.PHOENIX,
      points: -25,
    };
  }

  public static sortHandCards(cards: Card[]): Card[] {
    return cards.sort((cardA, cardB) => {
      if (cardA.type === CardType.PHOENIX) {
        return 1;
      }
      if (cardB.type === CardType.PHOENIX) {
        return -1;
      }
      return cardA.index - cardB.index;
    });
  }
}
