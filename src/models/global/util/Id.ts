import { nanoid } from "nanoid"

export const isNanoId = (x:string): boolean => new RegExp(/^[A-Za-z0-9_-]{0,21}$/).test(x)

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
  str: string
  of: string
  isVirtual: boolean
  isAnon: boolean
}

export const freezeId = (id: Id): string => {
  const { of, isVirtual, isAnon } = id
  const str = id.toString()
  const idObj: preFrozenId = { str, of, isVirtual, isAnon }
  return JSON.stringify(idObj)
}

export const thawId = (frozenId: string): Id => {
  const { str, of, isVirtual, isAnon }: preFrozenId = JSON.parse(frozenId)
  return isAnon
    ? new anonClassDict[of](str)
    : isVirtual
      ? new virtualIdClassDict[of](str)
      : new trueIdClassDict[of](str)
}

export class Witness { // players[playerId].virtualize(trueId)
  private virtualIds: Record<string, VirtualId>

  private trueIds: Record<string, TrueId>

  constructor() {
    this.virtualIds = {}
    this.trueIds = {}
  }

  virtualizeId: {
    (id: CardId): VirtualCardId
    (id: CardGroupId): VirtualCardGroupId
    (id: CardCycleId): VirtualCardCycleId
  } = (id: TrueId): VirtualId =>
    this.virtualIds[id.toString()] || new anonClassDict[id.of](nanoid())

  devirtualizeId: {
    (id: VirtualCardId): CardId
    (id: VirtualCardGroupId): CardGroupId
    (id: VirtualCardCycleId): CardCycleId
  } = (id: VirtualId): TrueId => this.trueIds[id.toString()]

  virtualizeAction = (action: IAction): IVirtualAction => ({
    ...action,
    targets: action.targets.map((target:TrueId) => this.virtualizeId(target)),
  })
}

type actionType = `draw` | `destroy` | `discard` | `mill`

interface IAction {
  from: PlayerId
  type: actionType
  targets: TrueId[]
}

interface IVirtualAction extends IAction {
  targets: VirtualId[]
}
