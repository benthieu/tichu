import {Card, CardType} from './card.model';
import {DeckFactory} from './deck.factory';

export class CardCombinations {
  public getCombinations(cards: Card[], toBeat?: Combination): Combination[] {
    return [
      ...this.singleCard(cards, toBeat),
      ...this.cardPair(cards, toBeat),
      ...this.stairs(cards, toBeat),
      ...this.threeOfAKind(cards, toBeat),
      ...this.straight(cards, toBeat),
      ...this.fullHouse(cards, toBeat),
      ...this.bombOfAKind(cards, toBeat),
      ...this.bombStraight(cards, toBeat),
    ];
  }

  public singleCard(cards: Card[], toBeat?: Combination): Combination[] {
    if (toBeat && toBeat.type !== CombinationType.SINGLE_CARD) {
      return [];
    }
    return cards
      .filter((card) => {
        return (
          card.index > (toBeat?.start || -1) ||
          (card.type === CardType.PHOENIX && (!toBeat || toBeat?.start < 15))
        );
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

  public cardPair(cards: Card[], toBeat?: Combination): Combination[] {
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
              search.type === CardType.PHOENIX
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
          length: 4,
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
          length: predecessor.length + 2,
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
      collections = collections.filter(
        (collection) => collection.start > toBeat.start
      );
    }
    return collections;
  }

  public straight(cards: Card[], toBeat?: Combination): Combination[] {
    if (toBeat && toBeat.type !== CombinationType.STRAIGHT) {
      return [];
    }
    let collections: Combination[] = [];
    for (let index = 1; index <= 14; index++) {
      const cardsWithIndex = cards.filter(
        (card) => card.index === index || card.type === CardType.PHOENIX
      );
      cardsWithIndex.forEach((card) => {
        if (card.type === CardType.PHOENIX) {
          card = DeckFactory.getPhoenixCard();
          card.index = index;
        }
        collections
          .filter(
            (combination) =>
              combination.cards.find((card) => card.index === index - 1) &&
              !combination.cards.find((card) => card.index === index)
          )
          .map((collection) => {
            collections.push({
              type: CombinationType.STRAIGHT,
              cards: [...collection.cards, card],
              start: collection.start,
              length: collection.length + 1,
            });
          });
      });
      // phenix should not be at the start
      cardsWithIndex
        .filter((card) => card.type !== CardType.PHOENIX)
        .forEach((card) => {
          collections.push({
            type: CombinationType.STRAIGHT,
            cards: [card],
            start: index,
            length: 1,
          });
        });
    }
    // add phoenix (only when upper limit), at the start
    const phoenix = cards.find((card) => card.type === CardType.PHOENIX);
    if (phoenix) {
      collections
        .filter((collection) => {
          return collection.cards[collection.cards.length - 1].index === 14;
        })
        .map((collection) => {
          collections.push({
            type: CombinationType.STRAIGHT,
            cards: [phoenix, ...collection.cards],
            start: collection.start - 1,
            length: collection.length + 1,
          });
        });
    }
    collections = collections.filter((collection) => collection.length >= 5);
    collections = collections.filter((collection) => {
      return (
        collection.cards.filter((card) => card.type === CardType.PHOENIX)
          .length <= 1
      );
    });
    // should not include bomb straights
    const bombs = this.bombStraight(cards);
    if (bombs.length) {
      bombs.forEach((bomb) => {
        collections = collections.filter(
          (collection) =>
            !(
              collection.length === bomb.length &&
              collection.cards.every((search) => bomb.cards.includes(search))
            )
        );
      });
    }
    if (toBeat) {
      collections = collections.filter(
        (collection) =>
          collection.start > toBeat.start && collection.length === toBeat.length
      );
    }
    return collections;
  }

  public fullHouse(cards: Card[], toBeat?: Combination): Combination[] {
    if (toBeat && toBeat.type !== CombinationType.FULL_HOUSE) {
      return [];
    }
    const cardPairList = this.cardPair(cards);
    const threeOfAKindList = this.threeOfAKind(cards);
    let collections: Combination[] = [];
    cardPairList.forEach((cardPair) => {
      threeOfAKindList
        .filter((collection) => {
          return !(
            collection.cards.includes(cardPair.cards[0]) ||
            collection.cards.includes(cardPair.cards[1])
          );
        })
        .forEach((threeOfAKind) => {
          collections.push({
            type: CombinationType.FULL_HOUSE,
            cards: [...threeOfAKind.cards, ...cardPair.cards],
            start: threeOfAKind.start,
            length: 5,
          });
        });
    });
    collections = collections.filter((collection) => {
      return !collections.find((search) => {
        return (
          search.start > collection.start &&
          this.hasSameCards(search, collection)
        );
      });
    });
    if (toBeat) {
      collections = collections.filter(
        (collection) => collection.start > toBeat.start
      );
    }
    return collections;
  }

  public bombOfAKind(cards: Card[], toBeat?: Combination): Combination[] {
    if (toBeat && toBeat.type === CombinationType.BOMB_STRAIGHT) {
      return [];
    }
    let collections: Combination[] = [];
    for (let index = 2; index <= 14; index++) {
      const cardsWithIndex = cards.filter((card) => card.index === index);
      if (cardsWithIndex.length === 4) {
        collections.push({
          type: CombinationType.BOMB_OF_A_KIND,
          cards: [...cardsWithIndex],
          start: index,
          length: 4,
        });
      }
    }
    if (toBeat && toBeat.type === CombinationType.BOMB_OF_A_KIND) {
      collections = collections.filter(
        (collection) => collection.start > toBeat.start
      );
    }
    return collections;
  }

  public bombStraight(cards: Card[], toBeat?: Combination): Combination[] {
    let collections: Combination[] = [];
    for (let index = 2; index <= 14; index++) {
      const cardsWithIndex = cards.filter((card) => card.index === index);
      cardsWithIndex.forEach((card) => {
        collections
          .filter((combination) =>
            combination.cards.find(
              (search) =>
                search.index === index - 1 && search.color === card.color
            )
          )
          .map((collection) => {
            collections.push({
              type: CombinationType.BOMB_STRAIGHT,
              cards: [...collection.cards, card],
              start: collection.start,
              length: collection.length + 1,
            });
          });
      });
      cardsWithIndex.forEach((card) => {
        collections.push({
          type: CombinationType.BOMB_STRAIGHT,
          cards: [card],
          start: index,
          length: 1,
        });
      });
    }
    collections = collections.filter((collection) => collection.length >= 5);
    if (toBeat && toBeat.type === CombinationType.BOMB_STRAIGHT) {
      collections = collections.filter(
        (collection) =>
          collection.start > toBeat.start || collection.length >= toBeat.length
      );
    }
    return collections;
  }

  public static getCombinationToBeat(
    combinations: Combination[]
  ): Combination | undefined {
    let combinationToBeat: Combination;
    const combinationsToBeat = combinations.filter(
      (combination) => combination.type !== CombinationType.PASS
    );
    if (combinationsToBeat) {
      combinationToBeat = combinationsToBeat[combinationsToBeat.length - 1];
    }
    return combinationToBeat;
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
  player?: number;
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
  PASS,
}
