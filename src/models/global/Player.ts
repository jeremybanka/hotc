import { IAction, IRequest, PlayerId, Spectator } from "./util/Id"

export default class PlayerServer extends Spectator {
  id: PlayerId

  displayName: string

  // hand: Card[]

  // deck: ICard[]

  // discardPile: ICard[]

  constructor(displayName: string) {
    super()
    this.id = new PlayerId()
    this.displayName = displayName
    // this.hand = []
    // this.deck = []
    // discardPile = []
  }

  requestAction = (request: IRequest): IAction => ({
    from: this.id,
    type: request.type,
    targets: this.devirtualizeIds(request.targets),
  })
}

/*
Player brings cards into game

Cards reside within CardGroups. They belong to cycles.

CardGroups [Decks, Hands, Piles] reside within layouts

Layouts reside within

Cycles contain Phases
The first Phase of a cycle is considered the
"home" or "starting" phase

*/
