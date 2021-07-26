import { immerable } from "immer"
import { nanoid } from "nanoid"
import {
  IActionRequest,
  IVirtualActionRequest,
  IVirtualImperative,
} from "../actions/types"
import { Card, CardCycle, CardGroup } from "."
import {
  PlayerId,
  CardGroupId,
  TrueId,
  VirtualId,
  CardId,
  VirtualCardId,
  VirtualCardGroupId,
  VirtualCardCycleId,
  CardCycleId,
  anonClassDict,
} from "../util/Id"

export class Perspective { // players[playerId].virtualize(trueId)
  [immerable] = true

  private virtualIds: Record<string, VirtualId>

  private trueIds: Record<string, TrueId>

  virtualActionLog: IVirtualActionRequest[]

  constructor() {
    this.virtualIds = {}
    this.trueIds = {}
    this.virtualActionLog = []
  }

  virtualizeId: {
    (id: CardId): VirtualCardId
    (id: CardGroupId): VirtualCardGroupId
    (id: CardCycleId): VirtualCardCycleId
  } = (id: TrueId): VirtualId => {
    console.log(id)
    return this.virtualIds[id.toString()]
    || new anonClassDict[id.of](nanoid())
  }

  virtualizeIds = (reals: TrueId[]): VirtualId[] =>
    reals.map((target:TrueId) => this.virtualizeId(target))

  devirtualizeId: {
    (id: VirtualCardId): CardId
    (id: VirtualCardGroupId): CardGroupId
    (id: VirtualCardCycleId): CardCycleId
  } = (id: VirtualId): TrueId => this.trueIds[id.toString()]

  devirtualizeIds = (virtuals: VirtualId[] = []): TrueId[] =>
    virtuals.map(target => this.devirtualizeId(target))

  deriveImperative = (action: IActionRequest): IVirtualImperative => ({
    type: action.type,
    from: action.payload.from,
    targets: this.virtualizeIds(action.payload.targets = []),
  })

  unlink = (trueId:TrueId): void => {
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

  cycleIdToHandIdMap: Map<(null|CardCycleId), CardGroupId>

  inbox: (CardId|CardGroupId)[]

  userId: number

  cardCyclesById: Record<string, CardCycle>

  imperativeLog: IVirtualImperative[]

  constructor(displayName:string, userId:number) {
    super()
    this.id = new PlayerId()
    this.cycleIdToHandIdMap = new Map()
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
