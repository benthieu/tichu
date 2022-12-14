import {
  BehaviorSubject,
  combineLatest,
  delay,
  map,
  Observable,
  of,
  Subject,
  take,
} from 'rxjs';
import {
  CardCombinations,
  Combination,
  CombinationType,
} from '../game/card/card-combinations';
import {Card, CardType} from '../game/card/card.model';
import {DeckFactory} from '../game/card/deck.factory';
import {Player} from './player.inteface';

export class PlayerComputer implements Player {
  team: number;
  index: number;
  handCards: Card[] = [];
  tableCards: Card[] = [];

  private handCards$ = new BehaviorSubject<Card[]>([]);
  private tableCards$ = new BehaviorSubject<Card[]>([]);

  private grandTichuCalled$ = new BehaviorSubject<boolean>(false);
  private tichuCalled$ = new BehaviorSubject<boolean>(false);
  private shouldPlay$ = new Subject<boolean>();

  private combinationToPlay$ = new Subject<Combination>();

  private gameStack: Observable<Combination[]>;

  private cardCombinations = new CardCombinations();

  constructor(
    team: number,
    index: number,
    gameStack: Observable<Combination[]>
  ) {
    this.team = team;
    this.index = index;
    this.gameStack = gameStack;
  }

  public reset(): void {
    this.handCards = [];
    this.handCards$.next(this.handCards);
    this.tableCards = [];
    this.tableCards$.next(this.tableCards);
    this.grandTichuCalled$.next(false);
    this.tichuCalled$.next(false);
  }

  public addHandCards(cards: Card[]): void {
    this.handCards = DeckFactory.sortHandCards([...this.handCards, ...cards]);
    this.handCards$.next(this.handCards);
  }

  public removeHandCards(cards: Card[]): void {
    this.handCards = this.handCards.filter((card) => !cards.includes(card));
    // ugly hack for phoenix
    if (cards.find((search) => search.type === CardType.PHOENIX)) {
      this.handCards = this.handCards.filter(
        (card) => card.type !== CardType.PHOENIX
      );
    }
    this.handCards$.next(this.handCards);
  }

  public getHandCards(): Observable<Card[]> {
    return this.handCards$.asObservable();
  }

  public addTableCards(cards: Card[]): void {
    this.tableCards = [...this.tableCards$.value, ...cards];
    this.tableCards$.next(this.tableCards);
  }

  public getTableCards(): Observable<Card[]> {
    return this.tableCards$.asObservable();
  }

  public getAllCardsWanted(): Observable<boolean> {
    return of(true);
  }

  public setAllCardsWanted(): void {}

  public getGrandTichuCalled(): Observable<boolean> {
    return this.grandTichuCalled$.asObservable();
  }

  public setGrandTichuCalled(): void {
    this.grandTichuCalled$.next(true);
  }

  public getTichuCalled(): Observable<boolean> {
    return this.tichuCalled$.asObservable();
  }

  public setTichuCalled(): void {
    this.tichuCalled$.next(true);
  }

  public getCardsToExchange(): Observable<Card[]> {
    return of([
      this.handCards[0],
      this.handCards[1],
      this.handCards[this.handCards.length - 1],
    ]);
  }

  public setCardsToExchange(cards: Card[]): void {}

  public getShouldPlay(): Observable<boolean> {
    return this.shouldPlay$.asObservable();
  }

  public setShouldPlay(play: boolean): void {
    this.shouldPlay$.next(play);
    combineLatest({
      cards: this.getHandCards(),
      collections: this.gameStack,
    })
      .pipe(take(1))
      .subscribe((val) => {
        setTimeout(
          () => this.makeNextMove(val.cards, val.collections),
          val.cards.length ? 1000 : 0
        );
      });
  }

  private makeNextMove(cards: Card[], currentGameStack: Combination[]): void {
    const allPossibleCombinations = this.cardCombinations.getCombinations(
      cards,
      CardCombinations.getCombinationToBeat(currentGameStack)
    );
    if (allPossibleCombinations.length) {
      const longestPlayPossible = allPossibleCombinations
        .map((a) => a.length)
        .indexOf(Math.max(...allPossibleCombinations.map((a) => a.length)));
      this.setCombinationToPlay(allPossibleCombinations[longestPlayPossible]);
    } else {
      this.setCombinationToPlay({
        type: CombinationType.PASS,
        cards: [],
        start: 0,
        length: 0,
      });
    }
  }

  public getCombinationToPlay(): Observable<Combination> {
    return this.combinationToPlay$.asObservable();
  }

  public setCombinationToPlay(combination: Combination): void {
    console.log(`${this.index}: setCombinationToPlay:`, combination);
    return this.combinationToPlay$.next(combination);
  }

  public pass(): void {
    this.setCombinationToPlay({
      type: CombinationType.PASS,
      cards: [],
      start: 0,
      length: 0,
    });
  }
}
