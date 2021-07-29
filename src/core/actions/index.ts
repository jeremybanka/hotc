import produce from "immer"
import { StoreApi } from "zustand/vanilla"
import { GameSession } from "../../store/game"
import {
  Card,
  CardCycle,
  CardGroup,
  CardValue,
  Deck,
  Hand,
  IZoneProps,
  Pile,
  Player,
  Trick,
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
import  { ActionType, IAction, RealTargets  } from "./types"

export const useCoreActions
= (game:StoreApi<GameSession>)
: Record<ActionType, IAction> => {
  const set = fn => game.setState(fn)
  const get = () => game.getState()
  return ({

    CLEAR_TABLE: {
      domain: `System`,
      run: () => {
        const clearPlayer = (player:Player): Player =>
          produce(player, draft => {
            draft.inbox = []
          })
        const playersById
        = mapObject(get().playersById, clearPlayer) as Record<string, Player>
        return {
          cardsById: {},
          cardCyclesById: {},
          cardGroupsById: {},
          cardValuesById: {},
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
        const { id, phaseNames } = options as {
          phaseNames: (keyof RealTargets)[],
          id?: string
        }
        const phases = phaseNames.map(phaseName => {
          const phase = realTargets[phaseName]
          if (!phase) throw new Error(`invalid call`)
          if (Array.isArray(phase)) {
            const phaseProtoMap = phase.map((id:TrueId) => {
              if (id instanceof PlayerId) {
                const hand = new Hand({})
                return [id, hand.id] as [PlayerId, CardGroupId]
              } else if (id instanceof ZoneId) {
                const zone = get().identify(id) as Zone
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
        const newCardCycle = new CardCycle({ id, phases })
        const cardCyclesById = {
          ...get().cardCyclesById,
          [newCardCycle.id.toString()]: newCardCycle,
        }
        return { cardCyclesById }
      },
    },

    CREATE_CARD_GROUP: {
      domain: `System`,
      run: ({ targets, options = {} }) => {
        const classes = { Deck, Pile, Trick }
        const { identify } = get()
        const { cardValueIds, zoneId, ownerId } = targets as {
          cardValueIds?: CardValueId[]
          ownerId?: PlayerId
          zoneId?: ZoneId
        }
        // if (options.className === `Pile`)console.log(ownerId)
        const { id, className = `Deck` } = options as {
          id?:string,
          className?:keyof typeof classes
        }
        const cardsById = { ...get().cardsById }
        const cardIds = cardValueIds?.map(valueId => {
          const idIsBogus = !identify(valueId)
          if (idIsBogus) throw new Error(`id ${valueId} has no real value`)
          const card = new Card(valueId)
          const cardId = card.id
          cardsById[cardId.toString()] = card
          return cardId
        })
        const newCardGroup = new classes[className]({ id, cardIds, ownerId })
        const cardGroupsById = {
          ...get().cardGroupsById,
          [newCardGroup.id.toString()]: newCardGroup,
        }
        if (zoneId) {
          try {
            const zone = identify(zoneId) as Zone
            const newZone = produce(zone, draft => draft.place(newCardGroup))
            const zonesById = {
              ...get().zonesById,
              [newZone.id.toString()]: newZone,
            }
            return { cardsById, cardGroupsById, zonesById }
          } catch (e) { console.log(e) }
        }
        return { cardsById, cardGroupsById }
      },
    },

    CREATE_CARD_VALUES: {
      domain: `System`,
      run: ({ options }) => {
        const { showPlayers } = get()
        const { values } = options as {values:{rank:string, suit:string}[]}
        const newCardValuesById: Record<string, CardValue> = {}
        values.forEach(value => {
          const newCardValue = new CardValue({ content: value })
          newCardValuesById[newCardValue.id.toString()] = newCardValue
          showPlayers(newCardValue.id)
        })
        const cardValuesById = {
          ...get().cardValuesById,
          ...newCardValuesById,
        }
        return { cardValuesById }
      },
    },

    CREATE_DECK: {
      domain: `System`,
      run: ({ targets, options = {} }) =>
        get().actions.CREATE_CARD_GROUP.run({
          targets,
          options: { ...options, className: `Deck` },
        }),
    },

    CREATE_HAND: {
      domain: `System`,
      run: ({ targets, options = {} }) => {
        const { ownerId } = targets as {ownerId:PlayerId}
        const { id } = options as {id?:string}
        const newHand = new Hand({ id, ownerId })
        const cardGroupsById = {
          ...get().cardGroupsById,
          [newHand.id.toString()]: newHand,
        }
        return { cardGroupsById }
      },
    },

    CREATE_PLAYER: {
      domain: `System`,
      run: ({ options }) => {
        const { mapPlayers, forEach } = get()
        const { userId, socketId } = options as {userId:number, socketId:string}
        const newPlayer = new Player(`displayName`, userId)
        const playerId = newPlayer.id.toString()
        set((state:GameSession) => {
          const newPlayers = mapPlayers(player => player.show(newPlayer.id))
          state.playersById = newPlayers
          newPlayer.show(newPlayer.id)
          forEach<Player>(`playersById`, player => newPlayer.show(player.id))
        })
        const playersById = {
          ...get().playersById,
          [playerId]: newPlayer,
        }
        const playerIdsByUserId = { [userId]: playerId }
        get().registerSocket(socketId).to(newPlayer)
        return { playersById, playerIdsByUserId }
      },
    },

    CREATE_PILE: {
      domain: `System`,
      run: ({ targets, options = {} }) =>
        get().actions.CREATE_CARD_GROUP.run({
          targets,
          options: { ...options, className: `Pile` },
        }),
    },

    CREATE_TRICK: {
      domain: `System`,
      run: () => ({}),
    },

    CREATE_ZONE: {
      domain: `System`,
      run: ({ targets, options = {} }) => {
        const { identify, showPlayers } = get()
        const { zoneLayoutId, ownerId } = targets as {
          zoneLayoutId:ZoneLayoutId,
          ownerId:PlayerId
        }
        const { id, contentType } = options as IZoneProps
        const newZone = new Zone({ id, contentType, ownerId })
        const zoneLayout = identify(zoneLayoutId) as ZoneLayout
        const newZoneLayout = produce(zoneLayout, draft => {
          draft.content.push(newZone.id)
        })
        showPlayers(newZone.id)
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
      run: ({ targets = {}, options = {} }) => {
        const { showPlayers } = get()
        const { id } = options as {id?:string}
        const { ownerId } = targets as {ownerId?:PlayerId}
        const newZoneLayout = new ZoneLayout({ id, ownerId })
        showPlayers(newZoneLayout.id)
        const zoneLayoutsById = {
          ...get().zoneLayoutsById,
          [newZoneLayout.id.toString()]: newZoneLayout,
        }
        return { zoneLayoutsById }
      },
    },

    DEAL: {
      domain: `Deck`,
      run: ({ targets, options = {} }) => {
        // console.log(`DEAL`, targets)
        const { run, identify, getPlayers, forEach } = get()
        const { deckId } = targets as {deckId:CardGroupId}
        let { howMany: roundsRemaining = 1 } = options as {howMany?:number}
        while (roundsRemaining) {
          const deck = identify(deckId) as Deck
          // console.log(roundsRemaining, `rounds remaining`,
          // deck.cardIds.length, `cards left`)
          if (deck.cardIds.length < getPlayers().length) break
          forEach<Player>(`playersById`, p => {
            run(`DRAW`, { actorId: p.id, targets: { deckId } })
          })
          --roundsRemaining
        }
        return ({})
      },
    },

    DEAL_ALL: {
      domain: `Deck`,
      run: ({ targets }) => {
        // console.log(`DEAL_ALL`, targets)
        const { identify } = get()
        const { deckId } = targets as {deckId:CardGroupId}
        const deck = identify(deckId) as Deck
        return get().actions.DEAL.run({
          targets,
          options: { howMany: deck.cardIds.length },
        })
      },
    },

    DRAW: {
      domain: `Deck`,
      run: ({ actorId, targets }) => {
        if (!actorId) throw new Error(``)
        const { identify, match, run } = get()
        const { deckId } = targets as {deckId:CardGroupId}
        // console.log(`DRAW`, targets, actorId)
        const actor = identify(actorId) as Player
        const targetDeck = identify(deckId) as Deck
        if (!actor) throw new Error(``)
        if (!targetDeck) throw new Error(``)

        const handId = match<CardGroup>(
          `cardGroupId`,
          cardGroup => (
            cardGroup.ownerId === actorId
            && cardGroup.class === `Hand`
          )
        )
        run(`MOVE`, {
          targets: {
            originId: deckId,
            destinationId: handId,
          },
          options: { howMany: 1, originIdx: 0, destinationIdx: 0 },
        })
        return {}
      },
    },

    MOVE: {
      domain: `System`,
      run: ({ targets, options }) => {
        const { identify } = get()
        const { originId, destinationId }
        = targets as {
          originId:CardGroupId,
          destinationId:CardGroupId}
        const { howMany, originIdx, destinationIdx }
        = options as Record<string, number>
        const origin = identify(originId) as CardGroup
        let cardIds
        const newOrigin = produce(origin, cardGroup => {
          cardIds = cardGroup.cardIds.splice(originIdx, howMany)
        })
        const destination = identify(destinationId) as CardGroup

        const newDestination = produce(destination, cardGroup => {
          // console.log(`deck-${deck.id.toString()}:`, deck.cardIds.length)
          cardGroup.cardIds.splice(destinationIdx, 0, cardIds)
        })

        const cardGroupsById = {
          ...get().cardGroupsById,
          [newOrigin.id.toString()]: newOrigin,
          [newDestination.id.toString()]: newDestination,
        }
        return { cardGroupsById }
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
