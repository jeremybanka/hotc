import produce from "immer"
import { StoreApi } from "zustand/vanilla"
import { GameSession } from "../../store/game"
import { Card, Deck, Hand, Player, Zone, ZoneLayout } from "../models"
import {  CardGroupId, CardValueId } from "../util/Id"
import  { actionType, IAction  } from "./types"

export const useCoreActions
= (game:StoreApi<GameSession>)
: Record<actionType, IAction> => {
  // const set = fn => game.setState(fn)
  const get = () => game.getState()
  return ({

    CREATE_DECK: {
      domain: `System`,
      run: ({ targets }) => {
        const { identify } = get()
        const { cardValueIds } = targets as {cardValueIds:CardValueId[]}
        const cardsById = { ...get().cardsById }
        const cardIds = cardValueIds.map(valueId => {
          const idIsBogus = !identify(valueId)
          if (idIsBogus) throw new Error(`id ${valueId} has no real value`)
          const card = new Card(valueId)
          const cardId = card.id
          cardsById[cardId.toString()] = card
          return cardId
        })
        const newDeck = new Deck({ cardIds })
        const cardGroupsById = {
          ...get().cardGroupsById,
          [newDeck.id.toString()]: newDeck,
        }
        return { cardsById, cardGroupsById }
      },
    },

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

    CREATE_LAYOUT: {
      domain: `System`,
      run: () => {
        const newZoneLayout = new ZoneLayout()
        const zoneLayoutsById = {
          ...get().zoneLayoutsById,
          [newZoneLayout.id.toString()]: newZoneLayout,
        }
        return { zoneLayoutsById }
      },
    },

    DRAW: {
      domain: `Deck`,
      run: ({ subjectId, targets }) => {
        if (!subjectId) throw new Error(``)
        const { identify } = get()
        const { cardGroupId } = targets as {cardGroupId:CardGroupId}
        const subject = identify(subjectId) as Player
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
          newHand = new Hand({ cardIds: [cardId], ownerId: subject.id })
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
      run: () => ({}),
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
