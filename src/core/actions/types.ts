import { GameSession } from "../../store/game"
import { PlayerId, TrueId, VirtualId } from "../util/Id"

export type domainType =
  |`SYSTEM`
  |`DECK`

export type actionType =
  |`CREATE_PLAYER`
  |`CREATE_ZONE`
  |`DEAL`
  |`DRAW`

export interface IVirtualActionRequest {
  type: actionType
  targets: VirtualId[]
  options?: Record<string, (number|string)>
}

export interface IActionRequestPayload {
  from: PlayerId
  targets: TrueId[]
  options?: Record<string, (number|string)>
  systemArgs?: (number|string)[]
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
  from?: PlayerId
  targets: VirtualId[]
  type: actionType
}
