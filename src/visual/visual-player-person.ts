import { Card } from '../game/card/card.model';
import { Player } from '../player/player.inteface';
import { Assets } from './assets';
import { VisualPlayer } from './visual-player.inteface';

export class VisualPlayerPerson implements VisualPlayer {
  private playerDiv = document.getElementById('player-0');
  private cards: Card[];
  constructor(private player: Player) {
    this.player.getHandCards().subscribe((cards) => {
      this.cards = cards;
      this.draw();
    });
  }

  public draw(): void {
    this.playerDiv.innerHTML = '';
    this.cards.forEach((card, cardIndex) => {
      const el = document.createElement('div');
      el.setAttribute('card-index', cardIndex.toString());
      el.addEventListener('click', (e) => {
        if (e.detail > 1) {
          return;
        }
        el.classList.toggle('selected');
      });
      el.setAttribute('class', `card card-${cardIndex}`);
      const image = document.createElement('img');
      const asset = Assets.getCardAsset(card);
      image.setAttribute('src', asset);
      el.appendChild(image);
      this.playerDiv?.appendChild(el);
    });
  }

  public getSelectedCards(): Card[] {
    const selectedCardElements =
      this.playerDiv.querySelectorAll('.card.selected');
    const selectedCards: Card[] = [];
    selectedCardElements.forEach((element) => {
      selectedCards.push(
        this.cards[parseInt(element.getAttribute('card-index'))]
      );
    });
    return selectedCards;
  }
}
