import {Card} from '../game/card/card.model';
import {PlayerComputer} from '../player/player-computer.class';

export class VisualPlayerComputer {
  constructor(private player: PlayerComputer, private playerIndex: number) {
    this.player.getHandCards().subscribe((cards) => {
      this.draw(cards);
    });
  }

  private draw(cards: Card[]): void {
    const playerDiv = document.getElementById(`player-${this.playerIndex}`);
    playerDiv.innerHTML = '';
    cards.forEach((_, cardIndex) => {
      const el = document.createElement('div');
      el.setAttribute('class', `card card-${cardIndex}`);
      const image = document.createElement('img');
      image.setAttribute('src', 'assets/back.png');
      el.appendChild(image);
      playerDiv?.appendChild(el);
    });
  }
}
