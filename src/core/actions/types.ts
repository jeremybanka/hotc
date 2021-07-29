import { GameSession } from "../../store/game"
import { PlayerId, TrueId, VirtualId } from "../util/Id"

export type domainType =
  | `System`
  | `Deck`

export type optionType =
  | `id`

export type targetType =
  | number
  | `cardValueIds`
  | `deckId`
  | `ownerId`
  | `playerId`
  | `zoneId`
  | `zoneLayoutId`

export type actionType =
  | `CLEAR_TABLE`
  | `CREATE_CARD_CYCLE`
  | `CREATE_CARD_GROUP`
  | `CREATE_CARD_VALUES`
  | `CREATE_DECK`
  | `CREATE_HAND`
  | `CREATE_PILE`
  | `CREATE_PLAYER`
  | `CREATE_TRICK`
  | `CREATE_ZONE`
  | `CREATE_ZONE_LAYOUT`
  | `DEAL`
  | `DRAW`
  | `PLACE`
  | `SHUFFLE`

export type RealTargets = Partial<Record<targetType, TrueId|TrueId[]>>

export type VirtualTargets = Partial<Record<targetType, VirtualId|VirtualId[]>>

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
