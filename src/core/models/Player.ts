import { immerable } from "immer"
import { nanoid } from "nanoid"
import {
  IActionRequest,
  IVirtualActionRequest,
  IVirtualImperative,
  RealTargets,
  VirtualTargets,
} from "../actions/types"
import { Card, CardCycle } from "."
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

const mapObject
= <I, O> (
  obj: Record<string, I>,
  fn: (val: I) => O
)
: Record<string, O> => {
  const newObj = {}
  const entries = Object.entries(obj)
  const newEntries = entries.map(entry =>
    [entry[0], fn(entry[1])] as [string, O]
  )
  newEntries.forEach(entry => {
    newObj[entry[0]] = entry[1]
  })
  return newObj
}

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

  virtualizeEntry = (real:TrueId[]|TrueId): VirtualId[]|VirtualId =>
    Array.isArray(real)
      ? this.virtualizeIds(real)
      : this.virtualizeId(real)

  virtualizeTargets = (targets?:RealTargets): VirtualTargets|undefined =>
    targets && mapObject<VirtualId|VirtualId[], TrueId|TrueId[]>(
      targets, this.virtualizeEntry
    )

  devirtualizeId: {
    (id: VirtualCardId): CardId
    (id: VirtualCardGroupId): CardGroupId
    (id: VirtualCardCycleId): CardCycleId
  } = (id: VirtualId): TrueId => this.trueIds[id.toString()]

  devirtualizeIds = (virtuals: VirtualId[] = []): TrueId[] =>
    virtuals.map(target => this.devirtualizeId(target))

  devirtualizeEntry = (virtual:VirtualId[]|VirtualId): TrueId[]|TrueId =>
    Array.isArray(virtual)
      ? this.virtualizeIds(virtual)
      : this.virtualizeId(virtual)

  devirtualizeTargets = (targets?: VirtualTargets): RealTargets|undefined =>
    targets && mapObject<TrueId|TrueId[], VirtualId|VirtualId[]>(
      targets, this.devirtualizeEntry
    )

  deriveImperative = (action: IActionRequest): IVirtualImperative => ({
    type: action.type,
    subjectId: action.payload.subjectId,
    targets: this.virtualizeTargets(action.payload.targets),
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
  : IActionRequest => {
    const { type, options } = request
    return ({
      type,
      payload: {
        subjectId: this.id,
        options,
        targets: this.devirtualizeTargets(request.targets),
      },
    })
  }

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
