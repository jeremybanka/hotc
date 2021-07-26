import { immerable } from "immer"
import { nanoid } from "nanoid"
import {
  IActionRequest,
  IVirtualActionRequest,
  IVirtualImperative,
} from "../actions/types"
import { Card, CardCycle, CardGroup, Hand } from "."
import {
  PlayerId,
} from "../util/Id"

import * as Id from "../util/Id"

export class Perspective { // players[playerId].virtualize(trueId)
  [immerable] = true

  private virtualIds: Record<string, Id.VirtualId>

  private trueIds: Record<string, Id.TrueId>

  virtualActionLog: IVirtualActionRequest[]

  constructor() {
    this.virtualIds = {}
    this.trueIds = {}
    this.virtualActionLog = []
  }

  virtualizeId: {
    (id: Id.CardId): Id.VirtualCardId
    (id: Id.CardGroupId): Id.VirtualCardGroupId
    (id: Id.CardCycleId): Id.VirtualCardCycleId
  } = (id: Id.TrueId): Id.VirtualId => {
    console.log(id)
    return this.virtualIds[id.toString()]
    || new Id.anonClassDict[id.of](nanoid())
  }

  virtualizeIds = (reals: Id.TrueId[]): Id.VirtualId[] =>
    reals.map((target:Id.TrueId) => this.virtualizeId(target))

  devirtualizeId: {
    (id: Id.VirtualCardId): Id.CardId
    (id: Id.VirtualCardGroupId): Id.CardGroupId
    (id: Id.VirtualCardCycleId): Id.CardCycleId
  } = (id: Id.VirtualId): Id.TrueId => this.trueIds[id.toString()]

  devirtualizeIds = (virtuals: Id.VirtualId[] = []): Id.TrueId[] =>
    virtuals.map(target => this.devirtualizeId(target))

  deriveImperative = (action: IActionRequest): IVirtualImperative => ({
    type: action.type,
    from: action.payload.from,
    targets: this.virtualizeIds(action.payload.targets = []),
  })

  unlink = (trueId:Id.TrueId): void => {
    const trueIdString = trueId.toString()
    const virtualIdString = this.virtualizeId(trueId).toString()
    delete this.trueIds[trueIdString]
    delete this.virtualIds[virtualIdString]
  }
}

export class Player extends Perspective {
  [immerable] = true

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
    type: request.type,
    payload: {
      from: this.id,
      targets: this.devirtualizeIds(request.targets),
    },
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
