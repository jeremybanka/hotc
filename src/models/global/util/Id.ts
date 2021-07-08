import { nanoid } from "nanoid"

export default class Id {
  private str: string

  constructor(str?: string) {
    this.str = str || nanoid()
  }

  toString = (): string => this.str

  isVirtual = false

  isAnon = false

  of = ``
}

export class TrueId extends Id {}
export class VirtualId extends Id { isVirtual = true }
export class AnonId extends VirtualId { isAnon = true }

export class GameId extends Id { of = `Game` }
export class PlayerId extends Id { of = `Player` }

export class CardId extends TrueId { of = `Card` }
export class CardGroupId extends TrueId { of = `CardGroup` }
export class CardCycleId extends TrueId { of = `CardCycle` }

export class VirtualCardId extends VirtualId { of = `Card` }
export class VirtualCardGroupId extends VirtualId { of = `CardGroup` }
export class VirtualCardCycleId extends VirtualId { of = `CardCycle` }

export class AnonCardId extends AnonId { of = `Card` }
export class AnonCardGroupId extends AnonId { of = `Card` }
export class AnonCardCycleId extends AnonId { of = `Card` }

const trueIdClassDict = {
  Card: CardId,
  CardCycle: CardCycleId,
  CardGroup: CardGroupId,
  Game: GameId,
  Player: PlayerId,
}
const virtualIdClassDict = {
  Card: VirtualCardId,
  CardCycle: VirtualCardCycleId,
  CardGroup: VirtualCardGroupId,
}
const anonClassDict = {
  Card: AnonCardId,
  CardCycle: AnonCardGroupId,
  CardGroup: AnonCardCycleId,
}

interface preFrozenId {
  nano: string
  of: string
  isVirtual: boolean
  isAnon: boolean
}

export const freezeId = (id: Id): string => {
  const { of, isVirtual, isAnon } = id
  const nano = id.toString()
  const idObj: preFrozenId = { nano, of, isVirtual, isAnon }
  return JSON.stringify(idObj)
}

export const thawId = (frozenId: string): Id => {
  const { nano, of, isVirtual, isAnon }: preFrozenId = JSON.parse(frozenId)
  return isAnon
    ? new anonClassDict[of](nano)
    : isVirtual
      ? new virtualIdClassDict[of](nano)
      : new trueIdClassDict[of](nano)
}

export class Witness { // players[playerId].virtualize(trueId)
  private virtualIds: Record<string, VirtualId>

  private trueIds: Record<string, TrueId>

  constructor() {
    this.virtualIds = {}
    this.trueIds = {}
  }

  virtualize: {
    (id: CardId): VirtualCardId
    (id: CardGroupId): VirtualCardGroupId
    (id: CardCycleId): VirtualCardCycleId
  } = (id: TrueId): VirtualId =>
    this.virtualIds[id.toString()]
    || new anonClassDict[id.of](id.toString())

  devirtualize: {
    (id: VirtualCardId): CardId
    (id: VirtualCardGroupId): CardGroupId
    (id: VirtualCardCycleId): CardCycleId
  } = (id: VirtualId): TrueId => this.trueIds[id.toString()]
}
