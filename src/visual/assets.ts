import {Card, CardColor, CardType} from '../game/card/card.model';

export class Assets {
  public static getCardAsset(card: Card): string {
    let assetName = '';
    switch (card.type) {
      case CardType.DOG:
        assetName = 'dog';
        break;
      case CardType.DRAGON:
        assetName = 'dragon';
        break;
      case CardType.MAHJONG:
        assetName = 'mahjong';
        break;
      case CardType.PHOENIX:
        assetName = 'phoenix';
        break;
      case CardType.NORMAL:
        switch (card.color) {
          case CardColor.JADE:
            assetName = 'spade_';
            break;
          case CardColor.PAGODA:
            assetName = 'heart_';
            break;
          case CardColor.STAR:
            assetName = 'diamond_';
            break;
          case CardColor.SWORD:
            assetName = 'club_';
            break;
        }
        assetName += card.index;
        break;
    }
    return `assets/${assetName}.png`;
  }
}
