import {Observable} from 'rxjs';
import {CardCombinations, Combination, CombinationType} from '../game/card/card-combinations';
import {Card, CardType} from '../game/card/card.model';
import {Player} from '../player/player.class';
import {Assets} from './assets';

export class VisualPlayerPerson {
  private playerDiv = document.getElementById('player-0');
  private cardCombinations = new CardCombinations();
  private cards: Card[];
  private combinationToBeat: Combination;
  constructor(private player: Player) {
    this.player.getHandCards().subscribe((cards) => {
      this.cards = cards;
      this.draw();
    });
    document
      .querySelector('#play-cards')
      .addEventListener('click', () => this.playCards());

    document
      .querySelector('#pass')
      .addEventListener('click', () => this.pass());

    this.player.getShouldPlay().subscribe((isPlaying) => {
      document
        .querySelector('#play-cards')
        .classList[!isPlaying ? 'add' : 'remove']('hidden');
      const cannotPass =
        !!this.cards.find((card) => card.type === CardType.MAHJONG) &&
        this.cards.length === 14;
      document
        .querySelector('#pass')
        .classList[!isPlaying || cannotPass ? 'add' : 'remove']('hidden');
    });
    this.player.gameStack.subscribe((gameStack) => {
      let toBeat: Combination;
      if (gameStack.length) {
        toBeat = gameStack[gameStack.length - 1];
      }
      this.combinationToBeat = toBeat;
    });
  }

  private draw(): void {
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

  public setExchangeCards(): boolean {
    const selectedCards = this.getSelectedCards();
    if (selectedCards.length === 3) {
      this.player.setExchangeCards(selectedCards);
      return true;
    }
    return false;
  }

  public playCards(): void {
    const selectedCards = this.getSelectedCards();
    const possiblePlays = this.cardCombinations.getCombinations(
      this.cards,
      this.combinationToBeat
    );
    const combinationToPlay = possiblePlays.find(
      (combination) =>
        combination.length === selectedCards.length &&
        combination.cards.every((search) => selectedCards.includes(search))
    );
    if (possiblePlays) {
      this.player.setCombinationToPlay(combinationToPlay);
    } else {
      alert('Not a possible play');
    }
  }

  public pass(): void {
    this.player.setCombinationToPlay({
      type: CombinationType.PASS,
      cards: [],
      start: 0,
      length: 0,
    });
  }

  private getSelectedCards(): Card[] {
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
