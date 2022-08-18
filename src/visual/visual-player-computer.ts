import {Card} from '../game/card/card.model';
import {Player} from '../player/player.inteface';
import {VisualPlayer} from './visual-player.inteface';

export class VisualPlayerComputer implements VisualPlayer {
  private handCards: Card[] = [];
  constructor(private player: Player) {
    this.player.getShouldPlay().subscribe(() => {
      if (this.handCards.length) {
        const playerDiv = document.getElementById(
          `player-${this.player.index}`
        );
        const el = document.createElement('div');
        el.append(document.createElement('div'));
        el.setAttribute('class', `loading`);
        playerDiv.appendChild(el);
        setTimeout(() => {
          playerDiv.removeChild(el);
        }, 1000);
      }
    });
    this.player.getHandCards().subscribe((cards) => {
      this.handCards = cards;
      this.draw();
    });
  }

  public draw(): void {
    const playerDiv = document.getElementById(`player-${this.player.index}`);
    playerDiv
      .querySelectorAll('.card')
      .forEach((cardElem) => cardElem.remove());
    this.handCards.forEach((_, cardIndex) => {
      const el = document.createElement('div');
      el.setAttribute('class', `card card-${cardIndex}`);
      const image = document.createElement('img');
      image.setAttribute('src', 'assets/back.png');
      el.appendChild(image);
      playerDiv?.appendChild(el);
    });
  }
}
