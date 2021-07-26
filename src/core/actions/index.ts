import produce from "immer"
import { StoreApi } from "zustand/vanilla"
import { GameSession } from "../../store/game"
import { Card, CardGroup, Deck, Player, Zone } from "../models"
import { CardGroupId, CardId, PlayerId } from "../util/Id"
import ACTION, { actionType, IAction, ICoreActions } from "./types"

export const useCoreActions
= (game:StoreApi<GameSession>)
: Record<actionType, IAction> => {
  const set = fn => game.setState(fn)
  const get = () => game.getState()
  return ({

    // CREATE_PLAYER: {
    //   domain: `SYSTEM`,
    //   run: () => undefined,
    // },

    // ({ systemArgs }): => {
    //   const [userId, socketId] = systemArgs
    //   set(state => {
    //     const newPlayer = new Player(Math.random.toString(), userId)
    //     state.playersByUserId[userId] = newPlayer
    //     state.registerSocket(socketId).to(newPlayer)
    //     state.playersById[newPlayer.id.toString()] = newPlayer
    //   })
    // }

    WHATEVER: {
      domain: ``,
      run: () => undefined,
    },

    CREATE_ZONE: {
      domain: `SYSTEM`,
      run: () => {
        const newZone = new Zone()
        const zonesById = {
          ...get().zonesById,
          [newZone.id.toString()]: newZone,
        }
        return { zonesById }
      },
    },

    DRAW: {
      domain: `DECK`,
      run: ({ from, targets }) => {
        const { identify } = get()
        const [cardGroupId] = targets as [CardGroupId]
        const actor = identify(from) as Player
        const targetDeck = identify(cardGroupId) as Deck
        if (!(actor && targetDeck)) throw new Error(``)
        let cardId
        const newDeck = produce(targetDeck, draft => { cardId = draft.draw() })
        const card = identify(cardId) as Card
        if (card.ownerId === actor.id) {

        } 
        const playersById = {
          ...get().playersById,
          [actor.id.toString()]:  
        }
        return { playersById }
        set(state => {
          if (!cardGroupId) throw new Error(`no deck id passed`)
          const deck = state.cardGroupsById[cardGroupId.toString()]
          if (!(deck instanceof Deck)) throw new Error(`draw targets decks`)
          const drawnCard = deck.draw()
          if (!playerId) throw new Error(`no player id passed`)
          const player = state.playersById[playerId.toString()]
          player.receive(drawnCard)
        })
      },
    },

    // DEAL: {
    //   domain: `DECK`,
    //   run: () => undefined,
    // },
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
