import { GameSession } from "../../store/game"
import { PlayerId, TrueId, VirtualId } from "../util/Id"

export type IdType =
  | `cardId`
  | `cardCycleId`
  | `cardGroupId`
  | `cardValueId`
  | `playerId`
  | `zoneId`
  | `zoneLayoutId`

export type TargetType =
  | IdType
  | number
  | `cardValueIds`
  | `deckId`
  | `handId`
  | `ownerId`

export type DomainType =
  | `System`
  | `Deck`

export type OptionType =
  | `id`

export type ActionType =
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

export type RealTargets = Partial<Record<TargetType, TrueId|TrueId[]>>

export type VirtualTargets = Partial<Record<TargetType, VirtualId|VirtualId[]>>

export interface IVirtualActionRequest {
  type: ActionType
  targets?: VirtualTargets
  options?: Record<string, (number|string)>
}

export interface IActionRequestPayload {
  subjectId?: PlayerId
  targets?: RealTargets
  options?: Record<string, any>
}

export interface IActionRequest {
  type: ActionType
  payload: IActionRequestPayload
}

export type IStateUpdate = Partial<GameSession>

export type updateProducer = (payload:IActionRequestPayload) => IStateUpdate

export interface IAction {
  domain: DomainType
  run: updateProducer
}

export interface IVirtualImperative {
  subjectId?: PlayerId
  targets?: VirtualTargets
  type: ActionType
}
