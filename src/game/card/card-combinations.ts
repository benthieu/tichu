import {Card, CardType} from './card.model';

export class CardCombinations {
  public getCombinations(cards: Card[], toBeat?: Combination): Combination[] {
    return [
      ...this.singleCard(cards, toBeat),
      ...this.cardPair(cards, toBeat),
      ...this.stairs(cards, toBeat),
      ...this.threeOfAKind(cards, toBeat),
    ];
  }

  public singleCard(cards: Card[], toBeat?: Combination): Combination[] {
    if (toBeat && toBeat.type !== CombinationType.SINGLE_CARD) {
      return [];
    }
    return cards
      .filter((card) => {
        return card.index > (toBeat?.start || -1);
      })
      .map((card) => {
        return {
          type: CombinationType.SINGLE_CARD,
          cards: [card],
          start:
            card.type === CardType.PHOENIX
              ? (toBeat?.start || 0) + 0.5
              : card.index,
          length: 1,
        };
      });
  }

  public cardPair(
    cards: Card[],
    toBeat?: Combination,
    withPhoenix = true
  ): Combination[] {
    if (toBeat && toBeat.type !== CombinationType.CARD_PAIR) {
      return [];
    }
    let collections: Combination[] = [];
    cards
      .filter((card) => card.type === CardType.NORMAL)
      .forEach((card) => {
        cards
          .filter((search) => search !== card)
          .forEach((search) => {
            if (
              (search.index === card.index &&
                search.type === CardType.NORMAL) ||
              (search.type === CardType.PHOENIX && withPhoenix)
            ) {
              collections.push({
                type: CombinationType.CARD_PAIR,
                cards: [card, search],
                start: card.index,
                length: 2,
              });
            }
          });
      });
    if (toBeat) {
      collections = collections.filter(
        (collection) => collection.start > toBeat.start
      );
    }
    return this.removeDoubles(collections);
  }

  public stairs(cards: Card[], toBeat?: Combination): Combination[] {
    if (toBeat && toBeat.type !== CombinationType.STAIRS) {
      return [];
    }
    let collections: Combination[] = [];
    const allPairs = this.cardPair(cards);
    allPairs.forEach((pair) => {
      const pairPredecessor = allPairs.filter(
        (predecessor) => predecessor.start === pair.start - 1
      );
      // there is a pair predecessing this pair
      pairPredecessor.forEach((predecessor) => {
        collections.push({
          type: CombinationType.STAIRS,
          cards: [...pair.cards, ...predecessor.cards],
          start: predecessor.start,
          length: 2,
        });
      });
      // there are multiple pairs predecessing this pair
      const stairPredecessor = collections.filter(
        (combination) =>
          !!combination.cards.find((card) => card.index === pair.start - 1) &&
          !combination.cards.find((card) => card.index >= pair.start)
      );
      stairPredecessor.forEach((predecessor) => {
        collections.push({
          type: CombinationType.STAIRS,
          cards: [...pair.cards, ...predecessor.cards],
          start: predecessor.start,
          length: predecessor.length + 1,
        });
      });
    });
    if (toBeat) {
      collections = collections.filter(
        (collection) =>
          collection.start > toBeat.start && collection.length === toBeat.length
      );
    }
    // remove double phoenix
    return collections.filter((collection) => {
      return (
        collection.cards.filter((card) => card.type === CardType.PHOENIX)
          .length <= 1
      );
    });
  }

  public threeOfAKind(cards: Card[], toBeat?: Combination): Combination[] {
    if (toBeat && toBeat.type !== CombinationType.THREE_OF_A_KIND) {
      return [];
    }
    let collections: Combination[] = [];
    for (let index = 2; index <= 14; index++) {
      const cardsWithIndex = cards.filter(
        (card) => card.index === index || card.type === CardType.PHOENIX
      );
      if (cardsWithIndex.length === 3) {
        collections.push({
          type: CombinationType.THREE_OF_A_KIND,
          cards: [...cardsWithIndex],
          start: index,
          length: 3,
        });
      }
      if (cardsWithIndex.length > 3) {
        collections.push(
          ...cardsWithIndex
            .reduce(
              (subsets, value) =>
                subsets.concat(subsets.map((set) => [value, ...set])),
              [[]]
            )
            .filter((cards) => cards.length === 3)
            .map((cards) => {
              return {
                type: CombinationType.THREE_OF_A_KIND,
                cards: [...cards],
                start: index,
                length: 3,
              };
            })
        );
      }
    }
    if (toBeat) {
      collections = collections.filter((collection) => collection.start > toBeat.start);
    }
    return collections;
  }

  private removeDoubles(doubles: Combination[]): Combination[] {
    let collections: Combination[] = [];
    doubles.forEach((combination) => {
      const hasCollection = collections.find((search) => {
        return (
          search.length === combination.length &&
          search.start === combination.start &&
          search.type === combination.type &&
          this.hasSameCards(search, combination)
        );
      });
      if (!hasCollection) {
        collections.push(combination);
      }
    });
    return collections;
  }

  private hasSameCards(
    combinationA: Combination,
    combinationB: Combination
  ): boolean {
    if (combinationA.length === combinationB.length) {
      let hasSameCards = true;
      combinationA.cards.forEach((card) => {
        if (
          !combinationB.cards.find(
            (search) =>
              card.type === search.type &&
              card.color === search.color &&
              card.index === search.index
          )
        ) {
          hasSameCards = false;
        }
      });
      return hasSameCards;
    }
    return false;
  }
}

export interface Combination {
  type: CombinationType;
  cards: Card[];
  start: number;
  length: number;
}

export enum CombinationType {
  SINGLE_CARD,
  CARD_PAIR,
  STAIRS,
  THREE_OF_A_KIND,
  STRAIGHT,
  FULL_HOUSE,
  BOMB_OF_A_KIND,
  BOMB_STRAIGHT,
}
