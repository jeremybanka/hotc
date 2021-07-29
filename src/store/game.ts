import create, { StoreApi } from 'zustand/vanilla'
import produce from 'immer'
import { GameId, TrueId } from '../core/util/Id'
import {
  Card,
  CardCycle,
  CardGroup,
  Player,
  Zone,
  ZoneLayout,
} from "../core/models"
import {
  IAction,
  IActionRequest,
  RealTargets,
  targetType,
} from '../core/actions/types'
import { CardValue } from '../core/models/CardValue'
import mapObject from '../core/util/mapObject'

type gameEntity =
  | Card
  | CardCycle
  | CardGroup
  | CardValue
  | Player
  | Zone
  | Zone

export interface GameData {
  cardsById: Record<string, Card>
  cardCyclesById: Record<string, CardCycle>
  cardGroupsById: Record<string, CardGroup>
  cardValuesById: Record<string, CardValue>
  playersById: Record<string, Player>
  zonesById: Record<string, Zone>
  zoneLayoutsById: Record<string, ZoneLayout>
}

export interface GameSession extends GameData {
  id: GameId
  actions: Record<string, IAction>
  actionLog: IActionRequest[]
  playerIdsByUserId: Record<number, string>
  playerIdsBySocketId: Record<string, string>
  dispatch(actionRequest:IActionRequest) : void
  forEach<T>(slice: keyof GameData, fn:(entity:T) => void) : void
  identify(id:TrueId) : unknown
  mapPlayers(fn:(player:Player) => void) : Record<string, Player>
  mapEach(slice: keyof GameData, fn:(entity:gameEntity) => gameEntity)
    : Partial<Record<string, gameEntity>>
  registerSocket(socketId:string) : {to: (player:Player) => void}
  showPlayers(id:TrueId) : void
  getSocketOwner(socketId:string) : Player
  target(type:targetType, id:string) : RealTargets
}

const createGame
= ()
: StoreApi<GameSession> => create<GameSession>((set, get) => ({
  id: new GameId(),
  actions: {},
  actionLog: [],
  cardsById: {},
  cardCyclesById: {},
  cardGroupsById: {},
  cardValuesById: {},
  playersById: {},
  playerIdsByUserId: {},
  playerIdsBySocketId: {},
  zonesById: {},
  zoneLayoutsById: {},

  dispatch: actionRequest => {
    const { type, payload } = actionRequest
    const { subjectId, targets, options } = payload
    const action = get().actions[type]

    console.log(`action`, type, { ...payload, subjectId: subjectId?.toString() })

    try {
      const update = action.run({ subjectId, targets, options })
      set((state:GameSession) => {
        state = { ...state, ...update }
        state.actionLog.push(actionRequest)
        const newPlayersById = { ...state.playersById }
        Object.values(newPlayersById).forEach(player => {
          const newPlayer = produce(player, draft => {
            const imperative = draft.deriveImperative(actionRequest)
            draft.imperativeLog.push(imperative)
          })
          newPlayersById[player.id.toString()] = newPlayer
        })
        state.playersById = newPlayersById
        return state
      })
    } catch (error) {
      console.log(error)
      return error
    }
  },

  forEach(slice, fn) {
    const entities = Object.values(get()[slice])
    entities.forEach(fn)
  },

  getSocketOwner: socketId =>
    get().playersById[get().playerIdsBySocketId[socketId]],

  identify(id) {
    const idString = id.toString()
    switch (id.of) {
      case `Card`: return get().cardsById[idString]
      case `CardCycle`: return get().cardCyclesById[idString]
      case `CardGroup`: return get().cardGroupsById[idString]
      case `CardValue`: return get().cardValuesById[idString]
      case `Player`: return get().playersById[idString]
      case `Zone`: return get().zonesById[idString]
      case `ZoneLayout`: return get().zoneLayoutsById[idString]
      default: throw new Error(`id of unknown entity`)
    }
  },

  mapEach: (
    slice: keyof GameData,
    fn:(entity:gameEntity) => gameEntity
  ) =>
    mapObject<string, gameEntity, gameEntity>(
      get()[slice], entity => produce(entity, fn)
    ),

  mapPlayers(fn) {
    const newPlayersById = { ...get().playersById }
    Object.values(newPlayersById).forEach(player => {
      const newPlayer = produce(player, fn)
      newPlayersById[player.id.toString()] = newPlayer
    })
    return newPlayersById
  },

  showPlayers(id) {
    set((state:GameSession) => {
      const newPlayers = get().mapPlayers(player => player.show(id))
      state.playersById = newPlayers
    })
  },

  target(type, id) {
    switch (type) {
      case `cardId`: return { [type]: get().cardsById[id].id }
      case `cardCycleId`: return { [type]: get().cardCyclesById[id].id }
      case `cardGroupId`: return { [type]: get().cardGroupsById[id].id }
      case `cardValueId`: return { [type]: get().cardValuesById[id].id }
      case `playerId`: return { [type]: get().playersById[id].id }
      case `zoneId`: return { [type]: get().zonesById[id].id }
      case `zoneLayoutId`: return { [type]: get().zoneLayoutsById[id].id }
      default: throw new Error(`id of unknown entity`)
    }
  },

  registerSocket: socketId => ({
    to: (player:Player) => {
      set(state => {
        state.playerIdsBySocketId[socketId] = player.id.toString()
      })
    },
  }),

}))

export default createGame
