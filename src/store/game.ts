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

export interface GameSession {
  id: GameId
  // set: CallableFunction
  forEachPlayer: CallableFunction
  actions: Record<string, IAction>
  actionLog: IActionRequest[]
  onPlayerJoin: CallableFunction
  getSocketOwner: CallableFunction
  getPlayers: CallableFunction
  dispatch(actionRequest:IActionRequest) : void
  identify(id:TrueId) : unknown
  cardsById: Record<string, Card>
  cardCyclesById: Record<string, CardCycle>
  cardGroupsById: Record<string, CardGroup>
  cardValuesById: Record<string, string>
  playersById: Record<string, Player>
  playerIdsByUserId: Record<number, string>
  playerIdsBySocketId: Record<string, string>
  zonesById: Record<string, Zone>
  zoneLayoutsById: Record<string, ZoneLayout>
}

const createGame
= ()
: StoreApi<GameSession> => create<GameSession>((set, get) => {
  // const set = fn => setState(produce(fn))
  console.log(set)
  return ({
    // set,
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

    getSocketOwner: (socketId:string) =>
      get().playersById[get().playerIdsBySocketId[socketId]],

    getPlayers: () => Object.values(get().playersById),

    forEachPlayer: (fn:CallableFunction): void => {
      get().getPlayers().forEach(player => {
        produce(player, (draft:Player) => fn(draft))
      })
    },

    install: (installer:CallableFunction): void => {
      set(state => {
        state.actions = {
          ...state.actions,
          ...installer(state),
        }
      })
    },

    dispatch: (actionReq:IActionRequest): void => {
      const { type, payload: { from, targets = [], systemArgs } } = actionReq
      console.log(`received action: ${type} [${targets}]`)
      const action = get().actions[type]
      try {
        // if (!(type && from)) throw new Error(`fuk u`)
        const response = action.run({ from, targets, systemArgs })
        console.log(response)
        set((state:GameSession) => {
          state = { ...state, ...response }
          state.actionLog.push(actionReq)
          // console.log(`ACTION LOG`, state.actionLog)
          const newPlayersById = { ...state.playersById }
          const newPlayers = Object.values(newPlayersById)
          for (let index = 0; index < newPlayers.length; index++) {
            const player = newPlayers[index]
            const newPlayer = produce(player, draft => {
              const imperative = draft.deriveImperative(actionReq)
              console.log(`imperative`, imperative)
              draft.imperativeLog.push(imperative)
              // console.log(`player`, draft)
            })
            console.log(`newPlayer`, newPlayer)
            newPlayersById[player.id.toString()] = newPlayer
          }
          state.playersById = newPlayersById
          console.log(`state`, state)

          // const newPlayers = { ...state.getPlayers() }
          // for (let index = 0; index < newPlayers.length; index++) {
          //   const player = newPlayers[index]
          //   const imperative = player.virtualizeRequest(actionReq)
          //   console.log(`imperative for player ${player.id}`, imperative)
          //   player.imperativeLog = [...player.imperativeLog, imperative]
          // }
          // state.players = newPlayers
        })
      } catch (error) {
        console.log(error)
        return error
      }
      // 'console.log(`validated...`)
    },

  })
})

export default createGame
