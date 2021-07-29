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
  ActionType,
  IAction,
  IActionRequest,
  IActionRequestPayload,
  IdType,
  RealTargets,
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
  | ZoneLayout

const SLICE_NAMES_BY_TYPE: Record<string, keyof GameData> = {
  cardId: `cardsById`,
  cardCycleId: `cardCyclesById`,
  cardGroupId: `cardGroupsById`,
  cardValueId: `cardValuesById`,
  playerId: `playersById`,
  zoneId: `zonesById`,
  zoneLayoutId: `zoneLayoutsById`,
}

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
  every<T extends gameEntity>(type:IdType, fn:((entity:T) => boolean)) : TrueId[]
  forEach<T>(slice: keyof GameData, fn:(entity:T) => void) : void
  getPlayers(): Player[]
  getSocketOwner(socketId:string) : Player
  identify(id:TrueId) : unknown
  mapPlayers(fn:(player:Player) => void) : Record<string, Player>
  mapEach(slice: keyof GameData, fn:(entity:gameEntity) => gameEntity)
    : Partial<Record<string, gameEntity>>
  match<T extends gameEntity>(
    type:IdType,
    pattern:string|((entity:T) => boolean))
    : TrueId
  merge(entities:gameEntity[])
    : {into: (sliceName:keyof GameData) => Partial<GameData>}
  registerSocket(socketId:string) : {to: (player:Player) => void}
  run(type: ActionType, payload: IActionRequestPayload): void
  showPlayers(id:TrueId) : void
  target(type:IdType, id:string) : RealTargets
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
    const { actorId, targets, options } = payload
    const action = get().actions[type]

    console.log(`action`, type, { ...payload, actorId: actorId?.toString() })

    try {
      const update = action.run({ actorId, targets, options })
      // console.log(`update`, update)
      set((state:GameSession) => {
        state = { ...state, ...update }
        // console.log(state)
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

  every<T extends gameEntity>(
    type:IdType,
    fn:((entity:T) => boolean)
  ) : TrueId[] {
    const sliceName = SLICE_NAMES_BY_TYPE[type]
    const ids: TrueId[] = []
    get().forEach<T>(sliceName, entity => {
      if (fn(entity) === true) ids.push(entity.id)
    })
    return ids
  },

  forEach(slice, fn) {
    const entities = Object.values(get()[slice])
    entities.forEach(fn)
  },

  getPlayers: () => Object.values(get().playersById),

  getSocketOwner: socketId =>
    get().playersById[get().playerIdsBySocketId[socketId]],

  identify(id) {
    // console.log(id)
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

  match<T extends gameEntity>(type, pattern) {
    const sliceName = SLICE_NAMES_BY_TYPE[type]
    console.log(`type`, type, `pattern`, pattern)
    let id
    if (typeof pattern === `string`) {
      const slice = get()[sliceName]
      // console.log(`sliceName`, sliceName)
      // console.log(`get()`, get())
      // console.log(`slice`, slice)
      id = slice[pattern].id
    }
    if (typeof pattern === `function`) {
      get().forEach<T>(sliceName, entity => {
        const matchFound = pattern(entity)
        // console.log(`matchFound`, matchFound, `===`, entity)
        if (matchFound) id = entity.id
      })
    }
    return id
  },

  merge: entities => ({ into: sliceName => {
    const slice = get()[sliceName]
    // console.log(`into`, sliceName, `entities`, entities)
    const newEntitiesById: Partial<typeof slice> = {}
    entities.forEach(entity => {
      newEntitiesById[entity.id.toString()] = entity
    })
    //  console.log(`newEntitiesById`, newEntitiesById)
    // console.log(`slice`, slice)
    return ({
      [sliceName]: {
        ...slice,
        ...newEntitiesById,
      },
    })
  } }),

  registerSocket: socketId => ({
    to: (player:Player) => {
      set(state => {
        state.playerIdsBySocketId[socketId] = player.id.toString()
      })
    },
  }),

  run: (type, payload) => get().dispatch({ type, payload }),

  showPlayers(id) {
    set((state:GameSession) => {
      const newPlayers = get().mapPlayers(player => player.show(id))
      state.playersById = newPlayers
    })
  },

  target: (type, id) => ({ [type]: get().match(type, id) }),

}))

export default createGame
