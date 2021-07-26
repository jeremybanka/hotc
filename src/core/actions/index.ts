import produce from "immer"
import { StoreApi } from "zustand/vanilla"
import { GameSession } from "../../store/game"
import { Card, Deck, Hand, Player, Zone } from "../models"
import {  CardGroupId } from "../util/Id"
import  { actionType, IAction  } from "./types"

export const useCoreActions
= (game:StoreApi<GameSession>)
: Record<actionType, IAction> => {
  // const set = fn => game.setState(fn)
  const get = () => game.getState()
  return ({

    CREATE_PLAYER: {
      domain: `System`,
      run: ({ options }) => {
        const { userId, socketId } = options as {userId:number, socketId:string}
        const newPlayer = new Player(`displayName`, userId)
        const playerId = newPlayer.id.toString()
        const playersById = { [playerId]: newPlayer }
        const playerIdsByUserId = { [userId]: playerId }
        get().registerSocket(socketId).to(newPlayer)
        return { playersById, playerIdsByUserId }
      },
    },

    // ({ systemArgs }): => {
    //   const [userId, socketId] = systemArgs
    //   set(state => {
    //     const newPlayer = new Player(Math.random.toString(), userId)
    //     state.playersByUserId[userId] = newPlayer
    //     state.registerSocket(socketId).to(newPlayer)
    //     state.playersById[newPlayer.id.toString()] = newPlayer
    //   })
    // }

    CREATE_ZONE: {
      domain: `System`,
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
      domain: `Deck`,
      run: ({ from, targets }) => {
        const { identify } = get()
        const [cardGroupId] = targets as [CardGroupId]
        const subject = identify(from) as Player
        const targetDeck = identify(cardGroupId) as Deck
        if (!subject) throw new Error(``)
        if (!targetDeck) throw new Error(``)
        let cardId
        const newDeck = produce(targetDeck, deck => {
          cardId = deck.draw()
        })
        const card = identify(cardId) as Card
        const cardCycleId = card.cycleId
        const handId = subject.cycleIdToHandIdMap.get(cardCycleId)
        let newHand
        let newSubject
        if (handId) {
          const hand = identify(handId) as Hand
          newHand = produce(hand, draft => draft.add(cardId))
        } else {
          newHand = new Hand({ cards: [cardId], ownerId: subject.id })
          newSubject = produce(subject, player => {
            player.cycleIdToHandIdMap.set(cardCycleId, newHand.id)
          })
        }
        const cardGroupsById = {
          ...get().cardGroupsById,
          [newDeck.id.toString()]: newDeck,
          [newHand.id.toString()]: newHand,
        }
        if (!newSubject) return { cardGroupsById }
        const playersById = {
          ...get().playersById,
          [newSubject.id.toString()]: newSubject,
        }
        return { cardGroupsById, playersById }
      },
    },

    DEAL: {
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