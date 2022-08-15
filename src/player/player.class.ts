import { BehaviorSubject, Observable } from 'rxjs';
import {Card, CardType} from '../game/card/card.model';

export class Player {
  private handCards = new BehaviorSubject<Card[]>([]);
  private tableCards = new BehaviorSubject<Card[]>([]);

  public reset(): void {
    this.handCards.next([]);
    this.tableCards.next([]);
  }

  public addHandCards(cards: Card[]): void {
    this.handCards.next([...this.handCards.value, ...this.sortHandCards(cards)]);
  }

  public getHandCards(): Observable<Card[]> {
    return this.handCards.asObservable();
  }

  public addTableCards(cards: Card[]): void {
    this.tableCards.next([...this.tableCards.value, ...this.sortHandCards(cards)]);
  }

  public getTableCards(): Observable<Card[]> {
    return this.tableCards.asObservable();
  }

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
