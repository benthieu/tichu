import {
  BehaviorSubject,
  combineLatest,
  filter,
  merge,
  Observable,
  take,
} from 'rxjs';
import {PlayerComputer} from '../player/player-computer.class';
import {PlayerPerson} from '../player/player-person.class';
import {Player} from '../player/player.inteface';
import {Combination, CombinationType} from './card/card-combinations';
import {Card, CardType} from './card/card.model';
import {DeckFactory} from './card/deck.factory';
import {GameState} from './game-state.model';

export class GameLeader {
  private deckFactory = new DeckFactory();
  private deck: Card[] = [];
  private currentStack$ = new BehaviorSubject<Combination[]>([]);
  public currentStack: Combination[] = [];
  private players = [
    new PlayerPerson(0, 0, this.getCurrentStack()),
    new PlayerComputer(1, 1, this.getCurrentStack()),
    new PlayerComputer(0, 2, this.getCurrentStack()),
    new PlayerComputer(1, 3, this.getCurrentStack()),
  ];
  private currentPlayer$ = new BehaviorSubject<number | null>(null);
  private gameState = new BehaviorSubject<GameState>(GameState.GAME_STARTED);

  constructor() {
    this.startGame();
    this.currentPlayer$
      .pipe(filter((playerIndex) => playerIndex != null))
      .subscribe((playerIndex) => {
        console.log('setting', playerIndex);
        this.players[playerIndex].setShouldPlay(true);
      });
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  public getGameState(): Observable<GameState> {
    return this.gameState.asObservable();
  }

  public getCurrentStack(): Observable<Combination[]> {
    return this.currentStack$.asObservable();
  }

  public getCurrentPlayer(): Observable<number | null> {
    return this.currentPlayer$.asObservable();
  }

  private startGame(): void {
    this.gameState.next(GameState.GAME_STARTED);
    this.deck = this.deckFactory.shuffleCards(this.deckFactory.createDeck());
    this.giveFirstOutCards();
  }

  private giveFirstOutCards(): void {
    this.players.forEach((player, index) => {
      player.addHandCards(
        this.deck.slice(
          (index * this.deck.length) / this.players.length,
          (index * this.deck.length) / this.players.length + 8
        )
      );
    });
    this.gameState.next(GameState.FIRST_CARDS_HANDED_OUT);
    this.waitForPlayersToRequestCards();
  }

  private waitForPlayersToRequestCards(): void {
    combineLatest(this.players.map((player) => player.getAllCardsWanted()))
      .pipe(
        filter((values) => {
          return values.every((val) => !!val);
        }),
        take(1)
      )
      .subscribe(() => {
        this.giveOutAllCards();
      });
  }

  private giveOutAllCards(): void {
    this.gameState.next(GameState.ALL_CARDS_HANDED_OUT);
    this.players.forEach((player, index) => {
      player.addHandCards(
        this.deck.slice(
          (index * this.deck.length) / this.players.length + 8,
          ((index + 1) * this.deck.length) / this.players.length
        )
      );
    });
    this.waitForCardExchange();
  }

  public waitForCardExchange(): void {
    this.gameState.next(GameState.WAITING_FOR_EXCHANGE);
    combineLatest(this.players.map((player) => player.getCardsToExchange()))
      .pipe(
        filter((values) => {
          return values.every((val) => val.length === 3);
        }),
        take(1)
      )
      .subscribe((playerCards) => this.exchangeCards(playerCards));
  }

  private exchangeCards(cards: Card[][]): void {
    cards.forEach((exchangeCards, index) => {
      const thisPlayer = this.players[index];
      const teammate = this.players.find(
        (player, searchIndex) =>
          player.team === this.players[index].team && searchIndex !== index
      );
      const enemy = this.players.filter(
        (player) => player.team !== this.players[index].team
      );
      teammate.addHandCards([exchangeCards[2]]);
      enemy[0].addHandCards([exchangeCards[0]]);
      enemy[1].addHandCards([exchangeCards[1]]);
      thisPlayer.removeHandCards(exchangeCards);
    });
    this.gameState.next(GameState.CARDS_EXCHANGED);
    this.startRound();
  }

  private startRound(): void {
    this.gameState.next(GameState.ROUND_STARTED);
    this.subscribeToPlayerCombinations();
    this.setStartingPlayer();
  }

  private subscribeToPlayerCombinations(): void {
    merge(
      ...this.players.map((player) => player.getCombinationToPlay())
    ).subscribe((combination) => this.handleNewCombination(combination));
  }

  private handleNewCombination(combination: Combination): void {
    if (combination.cards.length) {
      this.players[this.currentPlayer$.value].removeHandCards(
        combination.cards
      );
    }
    if (!!combination.cards.find((search) => search.type === CardType.DOG)) {
      this.handleDogPlay();
      return;
    }
    combination.player = this.currentPlayer$.value;
    this.addCombinationToStack(combination);

    const newPlayerIndex = this.getNextPlayer();
    const playerToBeat = this.getPlayerToBeat();
    console.log('playerToBeat', playerToBeat);
    if (playerToBeat === newPlayerIndex) {
      this.clearTableAndStack(newPlayerIndex);
    }
    console.log('this.currentPlayer$', newPlayerIndex);
    this.currentPlayer$.next(newPlayerIndex);
  }

  private addCombinationToStack(combination: Combination): void {
    this.currentStack = [...this.currentStack, combination];
    this.currentStack$.next(this.currentStack);
  }

  private clearTableAndStack(assignToPlayerIndex: number): void {
    this.players[assignToPlayerIndex].addTableCards([
      ...this.currentStack.map((combination) => combination.cards).flat(),
    ]);
    this.currentStack = [];
    this.currentStack$.next(this.currentStack);
  }

  private getNextPlayer(): number {
    return this.currentPlayer$.value + 1 >= this.players.length
      ? 0
      : this.currentPlayer$.value + 1;
  }

  private getPlayerToBeat(): number | undefined {
    let playerToBeat;
    const playersToBeat = this.currentStack
      .filter((combination) => combination.type !== CombinationType.PASS)
      .map((combination) => combination.player);
    if (playersToBeat.length) {
      playerToBeat = playersToBeat[playersToBeat.length - 1];
    }
    return playerToBeat;
  }

  private handleDogPlay(): void {
    let newPlayerIndex: number;
    switch (this.currentPlayer$.value) {
      case 0:
        newPlayerIndex = 2;
        break;
      case 1:
        newPlayerIndex = 3;
        break;
      case 2:
        newPlayerIndex = 0;
        break;
      case 3:
        newPlayerIndex = 1;
        break;
    }
    this.currentPlayer$.next(newPlayerIndex);
    this.currentStack = [];
    this.currentStack$.next(this.currentStack);
  }

  private setStartingPlayer(): void {
    const firstPlayer = this.players.findIndex((player) => {
      console.log(player.handCards);
      return !!player.handCards.find((card) => card.type === CardType.MAHJONG);
    });
    this.currentPlayer$.next(firstPlayer);
  }
}
