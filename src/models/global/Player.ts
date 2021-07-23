import {
  IActionRequest,
  IVirtualActionRequest,
  IVirtualImperative,
} from "./Action"
import Card from "./Card"
import CardCycle from "./CardCycle"
import CardGroup, { Hand } from "./CardGroup"
import {
  PlayerId,
} from "./util/Id"
import Portal from "./util/Portal"

export default class Player extends Portal {
  id: PlayerId

  displayName: string

  hands: Hand[]

  inbox: (Card|CardGroup)[]

  userId: number

  cardCyclesById: Record<string, CardCycle>

  imperativeLog: IVirtualImperative[]

  constructor(displayName:string, userId:number) {
    super()
    this.id = new PlayerId()
    this.hands = []
    this.inbox = []
    this.displayName = displayName
    this.userId = userId
    this.cardCyclesById = {}
    this.imperativeLog = []
    // this.hand = []
    // this.deck = []
    // discardPile = []
  }

  devirtualizeRequest
  = (request: IVirtualActionRequest)
  : IActionRequest => ({
    from: this.id,
    type: request.type,
    targets: this.devirtualizeIds(request.targets),
  })

  receive = (card:Card): void => {
    if (card.ownerId?.toString() === this.id.toString()) console.log(`bingo`)
  }
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
