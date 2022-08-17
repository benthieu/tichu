import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  merge,
  Observable,
  take,
  takeUntil,
} from 'rxjs';
import {PlayerComputer} from '../player/player-computer.class';
import {Player} from '../player/player.class';
import {Combination, CombinationType} from './card/card-combinations';
import {Card, CardType} from './card/card.model';
import {DeckFactory} from './card/deck.factory';

export class GameLeader {
  private deckFactory = new DeckFactory();
  private deck: Card[] = [];
  private currentStack = new BehaviorSubject<Combination[]>([]);
  private players = [
    new Player(0, this.getCurrentStack()),
    new PlayerComputer(1, this.getCurrentStack()),
    new PlayerComputer(0, this.getCurrentStack()),
    new PlayerComputer(1, this.getCurrentStack()),
  ];
  private currentlyPlaying = new BehaviorSubject<number | null>(null);
  private gameState = new BehaviorSubject<GameState>(GameState.GAME_STARTED);

  constructor() {
    this.startGame();
    this.currentlyPlaying
      .pipe(filter((playerIndex) => playerIndex != null))
      .subscribe((playerIndex) => {
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
    return this.currentStack.asObservable();
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
    combineLatest(this.players.map((player) => player.wantsAllCards()))
      .pipe(
        filter((values) => {
          return values.every((val) => val);
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
  }

  public exchangeCards(): void {
    this.gameState.next(GameState.WAITING_FOR_EXCHANGE);
    combineLatest(this.players.map((player) => player.getExchangeCards()))
      .pipe(
        filter((values) => {
          return values.every((val) => val.length === 3);
        }),
        take(1)
      )
      .subscribe((playerCards) => {
        playerCards.forEach((exchangeCards, index) => {
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
      });
  }

  private startRound(): void {
    this.setStartingPlayer();
    this.gameState.next(GameState.ROUND_STARTED);
    this.subscribeToPlayerCombinations();
  }

  private subscribeToPlayerCombinations(): void {
    merge(
      ...this.players.map((player) => player.getCombinationToPlay())
    ).subscribe((combination) => this.handleNewCombination(combination));
  }

  private handleNewCombination(combination: Combination): void {
    if (combination.cards.length) {
      this.players[this.currentlyPlaying.value].removeHandCards(
        combination.cards
      );
    }
    combination.player = this.currentlyPlaying.value;
    this.currentStack.next([...this.currentStack.value, combination]);
    const newPlayingIndex =
      this.currentlyPlaying.value + 1 >= this.players.length
        ? 0
        : this.currentlyPlaying.value + 1;
    const activePlayers = this.currentStack.value
      .filter((combination) => combination.type !== CombinationType.PASS)
      .map((combination) => combination.player);
    if (activePlayers[activePlayers.length - 1] === newPlayingIndex) {
      this.players[newPlayingIndex].addTableCards([
        ...this.currentStack.value
          .map((combination) => combination.cards)
          .flat(),
      ]);
      this.currentStack.next([]);
    }
    this.currentlyPlaying.next(newPlayingIndex);
  }

  private setStartingPlayer(): void {
    const handCardsWithPlayerIndex = this.players.map((player, playerIndex) =>
      player.getHandCards().pipe(
        take(1),
        map((cards) => {
          return {cards: cards, playerIndex: playerIndex};
        })
      )
    );
    merge(...handCardsWithPlayerIndex)
      .pipe(
        filter(
          (cardAndPlayer) =>
            !!cardAndPlayer.cards.find((card) => card.type === CardType.MAHJONG)
        )
      )
      .subscribe((cardAndPlayer) => {
        this.currentlyPlaying.next(cardAndPlayer.playerIndex);
      });
  }
}

export enum GameState {
  GAME_STARTED,
  FIRST_CARDS_HANDED_OUT,
  ALL_CARDS_HANDED_OUT,
  WAITING_FOR_EXCHANGE,
  CARDS_EXCHANGED,
  ROUND_STARTED,
  ROUND_ENDED,
  GAME_ENDED,
}
