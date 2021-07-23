import create, { StoreApi } from 'zustand/vanilla'
import produce from 'immer'
import {
  GameId,
} from '../models/global/util/Id'
import Player from '../models/global/Player'
import CardGroup from '../models/global/CardGroup'
import CardCycle from '../models/global/CardCycle'
import { IAction, IActionRequest } from '../models/global/Action'
import Card from '../models/global/Card'
import Zone from '../models/global/Zone'
import ZoneLayout from '../models/global/ZoneLayout'

export interface GameSession {
  id: GameId
  set: CallableFunction
  forEachPlayer: CallableFunction
  actions: Record<string, IAction>
  actionLog: IActionRequest[]
  onPlayerJoin: CallableFunction
  getSocketOwner: CallableFunction
  getPlayers: CallableFunction
  dispatch: CallableFunction
  install: CallableFunction
  cardGroupsById: Record<string, CardGroup>
  cardCyclesById: Record<string, CardCycle>
  cardsById: Record<string, Card>
  playersById: Record<string, Player>
  playersByUserId: Record<number, Player>
  playersBySocketId: Record<string, Player>
  zonesById: Record<string, Zone>
  zoneLayoutsById: Record<string, ZoneLayout>
}

export const createGame
= ()
: StoreApi<GameSession> => create<GameSession>((set, get) =>
  ({
    set: fn => set(produce(fn)),
    id: new GameId(),
    actions: {},
    actionLog: [],
    cardsById: {},
    cardGroupsById: {},
    cardCyclesById: {},
    playersById: {},
    playersByUserId: {},
    playersBySocketId: {},
    zonesById: {},
    zoneLayoutsById: {},

    registerSocket: (socketId:string) => ({
      to: (player:Player) => {
        set(state => {
          state.playersBySocketId[socketId] = player
        })
      },
    }),

    onPlayerJoin: (userId:number, socketId:string) => {
      set(state => {
        const player = state.playersByUserId[userId]
        console.log(`playerIsAlreadyHere`, !!player)
        if (player) {
          state.playersBySocketId[socketId] = player
        } else {
          const newPlayer = new Player(`displayName`, userId)
          state.playersByUserId[userId] = newPlayer
          state.playersBySocketId[socketId] = newPlayer
          state.playersById[newPlayer.id.toString()] = newPlayer
        }
      })
    },

    getSocketOwner: (socketId:string) => get().playersBySocketId[socketId],

    getPlayers: () => Object.values(get().playersById),

    forEachPlayer: (fn:CallableFunction): void => get().getPlayers().forEach(fn),

    install: (installer:CallableFunction): void => {
      set(state => {
        state.actions = {
          ...state.actions,
          ...installer(state),
        }
      })
    },

    dispatch: (actionReq:IActionRequest): void => {
      // console.log(actionReq)
      const { type, targets = [], systemArgs } = actionReq
      const action = get().actions[type]
      try {
        // if (!(type && from)) throw new Error(`fuk u`)
        action.run({ targets, systemArgs })
      } catch (error) {
        console.log(error)
        return error
      }
      // 'console.log(`validated...`)
      set(state => {
        state.actionLog.push(actionReq)
      })
      set(state => state.forEachPlayer((player:Player) => {
        const imperative = player.virtualizeRequest(actionReq)
        player.imperativeLog.push(imperative)
      }))
    },

  })
)

export const gameCore = createGame()

export default gameCore.getState()
