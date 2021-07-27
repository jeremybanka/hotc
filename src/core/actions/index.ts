import produce from "immer"
import { StoreApi } from "zustand/vanilla"
import { GameSession } from "../../store/game"
import {
  Card,
  CardCycle,
  CardValue,
  Deck,
  Hand,
  Player,
  Zone,
  ZoneLayout,
} from "../models"
import {
  CardGroupId,
  CardValueId,
  PlayerId,
  TrueId,
  ZoneId,
  ZoneLayoutId,
} from "../util/Id"
import mapObject from "../util/mapObject"
import  { actionType, IAction, RealTargets  } from "./types"

export const useCoreActions
= (game:StoreApi<GameSession>)
: Record<actionType, IAction> => {
  // const set = fn => game.setState(fn)
  const get = () => game.getState()
  return ({

    CLEAR_TABLE: {
      domain: `System`,
      run: () => {
        const clearPlayer = (player:Player): Player =>
          produce(player, draft => {
            draft.cycleIdToHandIdMap = new Map()
            draft.inbox = []
          })
        const playersById = mapObject(get().playersById, clearPlayer)
        return {
          cardsById: {},
          cardCyclesById: {},
          cardGroupsById: {},
          playersById,
          zonesById: {},
          zoneLayoutsById: {},
        }
      },
    },

    CREATE_CARD_CYCLE: {
      domain: `System`,
      run: ({ targets, options }) => {
        if (!(targets && options)) throw new Error(`invalid call`)
        const realTargets = targets as RealTargets
        const { phaseNames } = options as {phaseNames: (keyof RealTargets)[]}
        const phases = phaseNames.map(phaseName => {
          const phase = realTargets[phaseName]
          if (!phase) throw new Error(`invalid call`)
          if (Array.isArray(phase)) {
            const phaseProtoMap = phase.map((id:TrueId) => {
              if (id instanceof PlayerId) {
                const hand = new Hand({})
                return [id, hand.id] as [PlayerId, CardGroupId]
              } else if (id instanceof ZoneId) {
                const zone = get().identify(id) as Zone<any>
                if (zone.ownerId instanceof PlayerId) {
                  return [zone.ownerId, id] as [PlayerId, ZoneId]
                }
                throw new Error(`zone has no owner`)
              } else { throw new Error(`invalid phase array`) }
            })
            return new Map(phaseProtoMap)
          }
          if (phase instanceof CardGroupId) return phase
          if (phase instanceof ZoneId) return phase
          throw new Error(`invalid phase`)
        })
        const newCardCycle = new CardCycle({ phases })
        const cardCyclesById = {
          ...get().cardCyclesById,
          [newCardCycle.id.toString()]: newCardCycle,
        }
        return { cardCyclesById }
      },
    },

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

    CREATE_HAND: {
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

    CREATE_TAKE: {
      domain: `System`,
      run: () => ({}),
    },

    CREATE_TRICK: {
      domain: `System`,
      run: () => ({}),
    },

    CREATE_ZONE: {
      domain: `System`,
      run: ({ targets }) => {
        const { identify } = get()
        const { zoneLayoutId } = targets as {zoneLayoutId:ZoneLayoutId}
        const zoneLayout = identify(zoneLayoutId) as ZoneLayout
        const newZoneLayout = produce(zoneLayout, draft => {
          draft.content.push(newZone.id)
        })
        const newZone = new Zone({})
        const zonesById = {
          ...get().zonesById,
          [newZone.id.toString()]: newZone,
        }
        const zoneLayoutsById = {
          ...get().zoneLayoutsById,
          [newZoneLayout.id.toString()]: newZoneLayout,
        }
        return { zonesById, zoneLayoutsById }
      },
    },

    CREATE_ZONE_LAYOUT: {
      domain: `System`,
      run: () => {
        const newZoneLayout = new ZoneLayout({})
        const zoneLayoutsById = {
          ...get().zoneLayoutsById,
          [newZoneLayout.id.toString()]: newZoneLayout,
        }
        return { zoneLayoutsById }
      },
    },

    DEAL: {
      domain: `Deck`,
      run: () => ({}),
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

    LOAD: {
      domain: `System`,
      run: ({ options }) => {
        const { values } = options as {values:{rank:string, suit:string}[]}
        const newCardValuesById: Record<string, CardValue> = {}
        values.forEach(value => {
          const newCardValue = new CardValue({ content: value })
          newCardValuesById[newCardValue.id.toString()] = newCardValue
        })
        const cardValuesById = {
          ...get().cardValuesById,
          ...newCardValuesById,
        }
        return { cardValuesById }
      },
    },

    PLACE: {
      domain: `System`,
      run: () => ({}),
    },

    SHUFFLE: {
      domain: `System`,
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
