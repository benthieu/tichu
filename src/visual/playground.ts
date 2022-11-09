import {
  CardCombinations,
  Combination,
  CombinationType,
} from '../game/card/card-combinations';
import {CardType} from '../game/card/card.model';
import {GameLeader} from '../game/game-leader';
import {Player} from '../player/player.inteface';
import {Assets} from './assets';
import {VisualPlayerComputer} from './visual-player-computer';
import {VisualPlayerPerson} from './visual-player-person';
import {VisualPlayer} from './visual-player.inteface';

export class Playground {
  private mainPlayer: Player;
  private visualPlayers: VisualPlayer[] = [];
  private mainPlayerVisual: VisualPlayerPerson;
  private cardCombinations = new CardCombinations();

  constructor(private gameLeader: GameLeader) {
    gameLeader.getGameState().subscribe((state) => {
      document.querySelector('body').setAttribute('class', `state-${state}`);
    });

    const players = gameLeader.getPlayers();
    this.mainPlayer = players[0];
    this.mainPlayerVisual = new VisualPlayerPerson(players[0]);
    this.visualPlayers[0] = new VisualPlayerComputer(players[1]);
    this.visualPlayers[1] = new VisualPlayerComputer(players[2]);
    this.visualPlayers[2] = new VisualPlayerComputer(players[3]);
    this.connectButtons();

    gameLeader.getCurrentStack().subscribe((stack) => {
      document.querySelectorAll('.stack').forEach((stack) => {
        stack.innerHTML = '';
      });
      if (stack.length > 0) {
        const validCombinations = stack.filter(
          (combination) => combination.length > 0
        );
        validCombinations.forEach((combination) => {
          const currentStackElement = document.querySelector(
            `#stack-${combination.player}`
          );
          const currentPlayElement = document.createElement('div');
          currentPlayElement.classList.add('play');
          const cards = combination.cards;
          cards.forEach((card) => {
            const el = document.createElement('div');
            el.setAttribute('class', `card`);
            const image = document.createElement('img');
            const asset = Assets.getCardAsset(card);
            image.setAttribute('src', asset);
            el.appendChild(image);
            currentPlayElement.appendChild(el);
          });
          currentStackElement.appendChild(currentPlayElement);
        });
      }
    });
  }

  private connectButtons(): void {
    document
      .getElementById('call-grand-tichu')
      .addEventListener('click', () => this.callGrandTichu());
    document
      .getElementById('get-all-cards')
      .addEventListener('click', () => this.getAllCards());
    document
      .getElementById('exchange-cards')
      .addEventListener('click', () => this.exchangeCards());
    document
      .querySelector('#play-cards')
      .addEventListener('click', () => this.playCards());
    document
      .querySelector('#pass')
      .addEventListener('click', () => this.pass());

    this.gameLeader.getCurrentPlayer().subscribe((currentPlayer) => {
      const isPlaying = currentPlayer === 0;
      document
        .querySelector('#play-cards')
        .classList[!isPlaying ? 'add' : 'remove']('hidden');
      const cannotPass = this.gameLeader.currentStack.length === 0;
      document
        .querySelector('#pass')
        .classList[!isPlaying || cannotPass ? 'add' : 'remove']('hidden');
    });
  }

  private callGrandTichu(): void {
    this.mainPlayer.setGrandTichuCalled();
  }

  private getAllCards(): void {
    this.gameLeader.getPlayers()[0].setAllCardsWanted();
  }

  private playCards(): void {
    const selectedCards = this.mainPlayerVisual.getSelectedCards();
    const combinationToBeat = CardCombinations.getCombinationToBeat(
      this.gameLeader.currentStack
    );
    const possiblePlays = this.cardCombinations.getCombinations(
      this.mainPlayer.handCards,
      combinationToBeat
    );
    const isValidPlay = possiblePlays.find(
      (play) =>
        play.length === selectedCards.length &&
        selectedCards.every(
          (search) =>
            !!play.cards.find((card) => {
              return (
                card.index === search.index || search.type === CardType.PHOENIX
              );
            })
        )
    );
    if (isValidPlay) {
      this.mainPlayer.setCombinationToPlay(isValidPlay);
    } else {
      alert('Not a possible play');
    }
  }

  private pass(): void {
    this.mainPlayer.pass();
  }

  private exchangeCards(): void {
    const cardsToExchange = this.mainPlayerVisual.getSelectedCards();
    if (cardsToExchange.length === 3) {
      this.mainPlayer.setCardsToExchange(cardsToExchange);
    } else {
      window.alert('Select 3 cards');
    }
  }
}
