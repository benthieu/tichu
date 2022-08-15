export interface Card {
  type: CardType;
  color?: CardColor;
  index?: number;
  points: number;
}

export enum CardColor {
  JADE,
  SWORD,
  PAGODA,
  STAR,
}

export enum CardType {
  NORMAL,
  MAHJONG,
  DOG,
  PHOENIX,
  DRAGON,
}
