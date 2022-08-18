import {Observable} from 'rxjs';
import {Combination} from '../game/card/card-combinations';
import {Card} from '../game/card/card.model';

export interface Player {
  team: number;
  index: number;
  handCards: Card[];
  tableCards: Card[];

  getHandCards(): Observable<Card[]>;
  addHandCards(cards: Card[]): void;
  removeHandCards(cards: Card[]): void;

  getTableCards(): Observable<Card[]>;
  addTableCards(cards: Card[]): void;

  getCardsToExchange(): Observable<Card[]>;
  setCardsToExchange(cards: Card[]): void;

  getAllCardsWanted(): Observable<boolean>;
  setAllCardsWanted(): void;

  getGrandTichuCalled(): Observable<boolean>;
  setGrandTichuCalled(): void;

  getTichuCalled(): Observable<boolean>;
  setTichuCalled(): void;

  getShouldPlay(): Observable<boolean>;
  setShouldPlay(play: boolean): void;

  getCombinationToPlay(): Observable<Combination>;
  setCombinationToPlay(combination: Combination): void;

  pass(): void;

  reset(): void;
}
