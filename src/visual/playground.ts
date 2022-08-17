import {GameLeader} from '../game/game-leader';
import {VisualPlayerComputer} from './visual-player-computer';
import {VisualPlayerPerson} from './visual-player-person';

export class Playground {
  private mainPlayer: VisualPlayerPerson;
  private computerPlayers: VisualPlayerComputer[] = [];
  constructor(private gameLeader: GameLeader) {
    gameLeader.getGameState().subscribe((state) => {
      document.querySelector('body').setAttribute('class', `state-${state}`);
    });
    gameLeader.getPlayers().forEach((player, playerIndex) => {
      if (player.isComputer) {
        this.computerPlayers.push(
          new VisualPlayerComputer(player, playerIndex)
        );
      } else {
        this.mainPlayer = new VisualPlayerPerson(player);
      }
    });
    this.connectButtons();
  }

  private connectButtons(): void {
    document
      .getElementById('call-grand-tichu')
      .addEventListener('click', () =>
        this.gameLeader.getPlayers()[0].callGrandTichu()
      );
    document
      .getElementById('get-all-cards')
      .addEventListener('click', () =>
        this.gameLeader.getPlayers()[0].getAllCards()
      );
    document.getElementById('exchange-cards').addEventListener('click', () => {
      if (this.mainPlayer.setExchangeCards()) {
        this.gameLeader.exchangeCards();
      } else {
        window.alert('Select 3 cards');
      }
    });
  }
}
