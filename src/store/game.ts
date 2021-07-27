import create, { StoreApi } from 'zustand/vanilla'
import produce from 'immer'
import {
  GameId,
  TrueId,
} from '../core/util/Id'
import {
  Card,
  CardCycle,
  CardGroup,
  Player,
  Zone,
  ZoneLayout,
} from "../core/models"
import { IAction, IActionRequest } from '../core/actions/types'
import { CardValue } from '../core/models/CardValue'

export interface GameSession {
  id: GameId
  forEachPlayer: (fn:() => void) => void
  actions: Record<string, IAction>
  actionLog: IActionRequest[]
  onPlayerJoin: CallableFunction
  getSocketOwner: CallableFunction
  getPlayers: () => Player[]
  dispatch(actionRequest:IActionRequest) : void
  identify(id:TrueId) : unknown
  cardsById: Record<string, Card>
  cardCyclesById: Record<string, CardCycle>
  cardGroupsById: Record<string, CardGroup>
  cardValuesById: Record<string, CardValue>
  playersById: Record<string, Player>
  playerIdsByUserId: Record<number, string>
  playerIdsBySocketId: Record<string, string>
  registerSocket: (socketId:string) => {to: (player:Player) => void}
  zonesById: Record<string, Zone<any>>
  zoneLayoutsById: Record<string, ZoneLayout>
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

  identify(id: TrueId) {
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

  registerSocket: (socketId:string) => ({
    to: (player:Player) => {
      set(state => {
        state.playerIdsBySocketId[socketId] = player.id.toString()
      })
    },
  }),

  onPlayerJoin: (userId:number, socketId:string) => {
    set(state => {
      const playerId = state.playerIdsByUserId[userId]
      console.log(`playerIsAlreadyHere`, !!playerId)
      if (playerId) {
        state.playerIdsBySocketId[socketId] = playerId
      } else {
        const newPlayer = new Player(`displayName`, userId)
        const playerId = newPlayer.id.toString()
        state.playerIdsByUserId[userId] = playerId
        state.playerIdsBySocketId[socketId] = playerId
        state.playersById[newPlayer.id.toString()] = newPlayer
      }
    })
  },

  forEachPlayer: (fn:(draft:Player) => void): void => {
    get().getPlayers().forEach(player => {
      produce(player, (draft:Player) => fn(draft))
    })
  },

  getPlayers: () => Object.values(get().playersById),

  getSocketOwner: (socketId:string) =>
    get().playersById[get().playerIdsBySocketId[socketId]],

  install: (installer:CallableFunction): void => {
    set(state => {
      state.actions = {
        ...state.actions,
        ...installer(state),
      }
    })
  },

  dispatch: (actionRequest:IActionRequest): void => {
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
    // console.log(`validated...`, get())
  },

}))

export default createGame
