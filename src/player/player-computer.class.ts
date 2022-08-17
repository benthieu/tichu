import {combineLatest, filter, map, Observable, switchMap, take} from 'rxjs';
import {Combination, CombinationType} from '../game/card/card-combinations';
import {Card} from '../game/card/card.model';
import {Player} from './player.class';

export class PlayerComputer extends Player {
  public isComputer = true;
  constructor(team: number, gameStack: Observable<Combination[]>) {
    super(team, gameStack);
    this.getAllCards();
    this.getShouldPlay().subscribe((val) => {
      combineLatest({
        cards: this.getHandCards(),
        collections: this.gameStack,
      })
        .pipe(take(1))
        .subscribe((val) => {
          this.makeNextMove(val.cards, val.collections);
        });
    });
  }

  public makeNextMove(cards: Card[], currentGameStack: Combination[]): void {
    let combinationsToBeat = currentGameStack.filter(
      (combination) => combination.length > 0
    );
    let toBeat: Combination;
    if (combinationsToBeat.length) {
      toBeat = combinationsToBeat[combinationsToBeat.length - 1];
    }
    const allPossibleCombinations = this.cardCombinations.getCombinations(
      cards,
      toBeat
    );
    if (allPossibleCombinations.length) {
      this.setCombinationToPlay(allPossibleCombinations[0]);
    } else {
      /* this.setCombinationToPlay({
        type: CombinationType.PASS,
        cards: [],
        start: 0,
        length: 0,
      }); */
    }
  }

  public getExchangeCards(): Observable<Card[]> {
    return this.getHandCards().pipe(
      map((cards) => {
        return [cards[0], cards[1], cards[cards.length - 1]];
      })
    );
  }
}
