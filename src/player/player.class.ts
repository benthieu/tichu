import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CardCombinations, Combination } from '../game/card/card-combinations';
import { Card, CardType } from '../game/card/card.model';

export class Player {
  private handCards = new BehaviorSubject<Card[]>([]);
  private tableCards = new BehaviorSubject<Card[]>([]);
  private allCardsWanted = new BehaviorSubject<boolean>(false);
  private grandTichuCalled = new BehaviorSubject<boolean>(false);
  private tichuCalled = new BehaviorSubject<boolean>(false);
  private exchangeCards = new BehaviorSubject<Card[]>([]);
  private shouldPlay = new Subject<boolean>();
  private combinationToPlay = new Subject<Combination>();
  public isComputer = false;
  public team: number;
  public gameStack: Observable<Combination[]>;
  public cardCombinations = new CardCombinations();

  constructor(team: number, gameStack: Observable<Combination[]>) {
    this.team = team;
    this.gameStack = gameStack;
  }

  public reset(): void {
    this.handCards.next([]);
    this.tableCards.next([]);
    this.allCardsWanted.next(false);
    this.grandTichuCalled.next(false);
    this.tichuCalled.next(false);
    this.exchangeCards.next([]);
    // this.shouldPlay.next(false);
  }

  public addHandCards(cards: Card[]): void {
    if (cards.find((card) => card.type === CardType.MAHJONG)) {

    }
    this.handCards.next(this.sortHandCards([...cards, ...this.handCards.value]));
  }

  public removeHandCards(cards: Card[]): void {
    this.handCards.next(this.handCards.value.filter((card) => !cards.includes(card)));
  }

  public getHandCards(): Observable<Card[]> {
    return this.handCards.asObservable();
  }

  public addTableCards(cards: Card[]): void {
    this.tableCards.next([...this.tableCards.value, ...cards]);
  }

  public getTableCards(): Observable<Card[]> {
    return this.tableCards.asObservable();
  }

  public wantsAllCards(): Observable<boolean> {
    return this.allCardsWanted.asObservable();
  }

  public getAllCards(): void {
    this.allCardsWanted.next(true);
  }

  public callsGrandTichu(): Observable<boolean> {
    return this.grandTichuCalled.asObservable();
  }

  public callGrandTichu(): void {
    this.grandTichuCalled.next(true);
    this.allCardsWanted.next(true);
  }

  public callsTichu(): Observable<boolean> {
    return this.tichuCalled.asObservable();
  }

  public callTichu(): void {
    this.tichuCalled.next(true);
  }

  public getExchangeCards(): Observable<Card[]> {
    return this.exchangeCards.asObservable();
  }

  public setExchangeCards(cards: Card[]): void {
    this.exchangeCards.next(cards);
  }

  public getShouldPlay(): Observable<boolean> {
    return this.shouldPlay.asObservable();
  }

  public setShouldPlay(play: boolean): void {
    this.shouldPlay.next(play);
  }

  public getCombinationToPlay(): Observable<Combination> {
    return this.combinationToPlay.asObservable();
  }

  public setCombinationToPlay(combination: Combination): void {
    return this.combinationToPlay.next(combination);
  }

  public makeNextMove(cards: Card[], currentGameStack: Combination[]): void {}

  private sortHandCards(cards: Card[]): Card[] {
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
