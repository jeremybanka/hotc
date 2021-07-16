import create from 'zustand/vanilla'
import produce from 'immer'
import { IAction, PlayerId } from '../models/global/util/Id'
import Player from '../models/global/Player'

interface GameSession {
  setState: CallableFunction
  addPlayer: CallableFunction
  tick: number
  actionLog: IAction[]
  virtualActionLogs: Map<PlayerId, IAction>
  players: Map<PlayerId, Player>
}

const createGame = () => create<GameSession>(set => ({
  setState: fn => set(produce(fn)),
  addPlayer: (displayName:string) => {
    const newPlayer = new Player(displayName)
    setState(state => {
      state.players = state.players.set(newPlayer.id, newPlayer)
    })
  },
  tick: 0,
  actionLog: [],
  virtualActionLogs: new Map(),
  players: new Map(),
}))

const game = createGame()

export const { addPlayer } = game.getState()

export const {
  getState,
  setState,
  subscribe,
  destroy,
} = game
