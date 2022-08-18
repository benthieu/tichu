import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {
  CardCombinations,
  Combination,
  CombinationType,
} from '../game/card/card-combinations';
import {Card, CardType} from '../game/card/card.model';
import {DeckFactory} from '../game/card/deck.factory';
import {Player} from './player.inteface';

export class PlayerPerson implements Player {
  public team: number;
  public index: number;
  public handCards: Card[] = [];
  public tableCards: Card[] = [];

  private handCards$ = new BehaviorSubject<Card[]>([]);
  private tableCards$ = new BehaviorSubject<Card[]>([]);

  private allCardsWanted$ = new BehaviorSubject<boolean>(false);
  private grandTichuCalled$ = new BehaviorSubject<boolean>(false);
  private tichuCalled$ = new BehaviorSubject<boolean>(false);

  private cardsToExchange$ = new BehaviorSubject<Card[]>([]);

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
    this.allCardsWanted$.next(false);
    this.grandTichuCalled$.next(false);
    this.tichuCalled$.next(false);
    this.cardsToExchange$.next([]);
  }

  public addHandCards(cards: Card[]): void {
    this.handCards = DeckFactory.sortHandCards([...cards, ...this.handCards]);
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
    return this.allCardsWanted$.asObservable();
  }

  public setAllCardsWanted(): void {
    this.allCardsWanted$.next(true);
  }

  public getGrandTichuCalled(): Observable<boolean> {
    return this.grandTichuCalled$.asObservable();
  }

  public setGrandTichuCalled(): void {
    this.grandTichuCalled$.next(true);
    this.allCardsWanted$.next(true);
  }

  public getTichuCalled(): Observable<boolean> {
    return this.tichuCalled$.asObservable();
  }

  public setTichuCalled(): void {
    this.tichuCalled$.next(true);
  }

  public getCardsToExchange(): Observable<Card[]> {
    return this.cardsToExchange$.asObservable();
  }

  public setCardsToExchange(cards: Card[]): void {
    this.cardsToExchange$.next(cards);
  }

  public getShouldPlay(): Observable<boolean> {
    return this.shouldPlay$.asObservable();
  }

  public setShouldPlay(play: boolean): void {
    this.shouldPlay$.next(play);
  }

  public getCombinationToPlay(): Observable<Combination> {
    return this.combinationToPlay$.asObservable();
  }

  public setCombinationToPlay(combination: Combination): void {
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
