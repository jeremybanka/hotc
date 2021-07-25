import { immerable } from "immer"
import { nanoid } from "nanoid"
import {
  IActionRequest,
  IVirtualActionRequest,
  IVirtualImperative,
} from "../Action"
import * as Id from "./Id"

export default class Portal { // players[playerId].virtualize(trueId)
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
    ...action,
    targets: this.virtualizeIds(action.targets = []),
  })

  unlink = (trueId:Id.TrueId): void => {
    const trueIdString = trueId.toString()
    const virtualIdString = this.virtualizeId(trueId).toString()
    delete this.trueIds[trueIdString]
    delete this.virtualIds[virtualIdString]
  }
}
