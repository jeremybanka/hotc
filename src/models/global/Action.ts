// actions
// [s] shuffle deck
//     change the order of a single cardgroup
// [D] deal cards (keep remainder "public" but hidden)
//     (playersToReceive:PlayerId[]=all, howManyPerPlayer:number=1)
//     pass card from top of deck to each player, x times
// [S] sort hand
//     organize a cardgroup by the id of the card entities
// [h] create new hand
// [w] switch cards to other hand, three times
// [p] pass hand of cards to other player (change keeper of zone)
// [o] offer card (pass to public zone)
//

import { StoreApi } from "zustand/vanilla"
import { GameSession } from "../../store/game"
import { Deck } from "./CardGroup"
import Player from "./Player"
import { PlayerId, TrueId, VirtualId } from "./util/Id"
import Zone from "./Zone"

// layouts: infinite and finite
// infinite layouts can have a new zone appended at any time
// finite layouts have a certain number of zones that are "filled"

export type domain =
    `System`
  | `Deck`

export type actionType =
    `contribute`
  | `createPlayer`
  | `createZone`
  | `createZoneLayout`
  | `destroy`
  | `deal`
  | `discard`
  | `draw`
  | `mill`
  | `give`
  | `sort`

export interface IVirtualActionRequest {
  targets: VirtualId[]
  type: actionType
}

export interface IActionRequest {
  from: PlayerId
  targets: TrueId[]
  type: actionType
  systemArgs?: (number|string)[]
}

export interface IVirtualImperative {
  from: PlayerId
  targets: VirtualId[]
  type: actionType
}

export interface IAction {
  domain: domain
  run: CallableFunction
}

export const useCoreActions
= (game:StoreApi<GameSession>)
: Partial<Record<actionType, IAction>> => {
  const set = fn => game.setState(fn)
  return ({

    createPlayer: {
      domain: `System`,
      run: ({ systemArgs }) => {
        const [userId, socketId] = systemArgs
        set(state => {
          const newPlayer = new Player(Math.random.toString(), userId)
          state.playersByUserId[userId] = newPlayer
          state.registerSocket(socketId).to(newPlayer)
          state.playersById[newPlayer.id.toString()] = newPlayer
        })
      },
    },

    createZone: {
      domain: `System`,
      run: () => {
        set(state => {
          console.log(`creating Zone...`)
          const newZone = new Zone()
          const newZonesById = {
            ...state.zonesById,
            [newZone.id.toString()]: newZone,
          }
          state.zonesById = newZonesById
        })
      },
    },

    draw: {
      domain: `Deck`,
      run: (
        playerId:string,
        deckId:string,
      ) => {
        set(state => {
          if (!deckId) throw new Error(`no deck id passed`)
          const deck = state.cardGroupsById[deckId]
          if (!(deck instanceof Deck)) throw new Error(`draw targets decks`)
          const drawnCard = deck.draw()
          if (!PlayerId) throw new Error(`no player id passed`)
          const player = state.playersById[playerId]
          player.receive(drawnCard)
        })
      },
    },

    deal: {
      domain: `Deck`,
      run: () => undefined,
    },
  })
}

export const installCoreActions
= (game:StoreApi<GameSession>)
: void => {
  game.setState(state => {
    state.actions = {
      ...state.actions,
      ...useCoreActions(game),
    }
  })
}

export default installCoreActions
