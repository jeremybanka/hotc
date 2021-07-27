import { GameSession } from "../../store/game"
import { PlayerId, TrueId, VirtualId } from "../util/Id"

export type domainType =
  | `System`
  | `Deck`

export type actionType =
  | `CLEAR_TABLE`
  | `CREATE_CARD_CYCLE`
  | `CREATE_DECK`
  | `CREATE_HAND`
  | `CREATE_PLAYER`
  | `CREATE_TAKE`
  | `CREATE_TRICK`
  | `CREATE_ZONE`
  | `CREATE_ZONE_LAYOUT`
  | `DEAL`
  | `DRAW`
  | `LOAD`
  | `PLACE`
  | `SHUFFLE`

export type RealTargets = Record<string, TrueId|TrueId[]>

export type VirtualTargets = Record<string, VirtualId|VirtualId[]>

export interface IVirtualActionRequest {
  type: actionType
  targets?: VirtualTargets
  options?: Record<string, (number|string)>
}

export interface IActionRequestPayload {
  subjectId?: PlayerId
  targets?: RealTargets
  options?: Record<string, any>
}

export interface IActionRequest {
  type: actionType
  payload: IActionRequestPayload
}

export type IStateUpdate = Partial<GameSession>

export type updateProducer = (payload:IActionRequestPayload) => IStateUpdate

export interface IAction {
  domain: domainType
  run: updateProducer
}

export interface IVirtualImperative {
  subjectId?: PlayerId
  targets?: VirtualTargets
  type: actionType
}
