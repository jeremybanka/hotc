import { PlayerId, Witness } from "./util/Id"

export default class Player extends Witness {
  id: PlayerId

  // hand: Card[]

  // deck: ICard[]

  // discardPile: ICard[]

  constructor() {
    super()
    this.id = new PlayerId()
    // this.hand = []
    // this.deck = []
    // discardPile = []
  }
}

/*
Player brings cards into game

Cards reside within stacks. They belong to cycles.

Stacks reside within layouts

Layouts reside within

Cycles contain Phases
The first Phase of a cycle is considered the
"home" or "starting" phase

*/
