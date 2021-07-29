// import produce from "immer"
/* eslint-disable max-len */
import { StoreApi } from "zustand/vanilla"
import { GameSession } from "../store/game"
import {
  ActionType,
  IAction, IActionRequestPayload,
} from "../core/actions/types"
import installCoreActions from "../core/actions"
import { frenchPlayingCardDeck } from "./PlayingCard"
import { CardGroup, Player, Zone } from "../core/models"

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

// layouts: infinite and finite
// infinite layouts can have a new zone appended at any time
// finite layouts have a certain number of zones that are "filled"

export const useHeartsActions
= (game:StoreApi<GameSession>)
: Record<string, IAction> => {
  installCoreActions(game)
  const get = () => game.getState()
  const getAllCardValueIds = () => Object.values(get().cardValuesById)
    .map(cardValue => cardValue.id)
  return {
    INIT: {
      domain: `System`,
      run: () => {
        const { every, forEach, dispatch, match, target } = get()

        const run = (
          type: ActionType,
          payload: IActionRequestPayload
        ) => dispatch({ type, payload })

        run(`CLEAR_TABLE`, {})
        run(`CREATE_CARD_VALUES`, { options: { values: frenchPlayingCardDeck } })
        run(`CREATE_ZONE_LAYOUT`, { options: { id: `main-layout` } })
        run(`CREATE_ZONE`, {
          options: { id: `main-deck-zone`, contentType: `Deck` },
          targets: target(`zoneLayoutId`, `main-layout`),
        })
        run(`CREATE_ZONE`, {
          options: { id: `main-trick-zone` },
          targets: target(`zoneLayoutId`, `main-layout`),
        })
        run(`CREATE_DECK`, {
          options: { id: `main-deck` },
          targets: { ...target(`zoneId`, `main-deck-zone`), cardValueIds: getAllCardValueIds() },
        })
        forEach<Player>(`playersById`, p => {
          const idString = p.id.toString()
          const zoneLayoutIdStr = `${idString}-zoneLayout`
          const pileZoneIdStr = `${idString}-pile-zone`
          const pileIdStr = `${idString}-pile`
          run(`CREATE_HAND`, {
            targets: { ownerId: p.id },
          })
          run(`CREATE_ZONE_LAYOUT`, {
            options: { id: zoneLayoutIdStr },
            targets: { ownerId: p.id },
          })
          run(`CREATE_ZONE`, {
            options: { id: pileZoneIdStr, contentType: `Pile` },
            targets: target(`zoneLayoutId`, zoneLayoutIdStr),
          })
          run(`CREATE_PILE`, {
            options: { id: pileIdStr },
            targets: target(`zoneId`, pileZoneIdStr),
          })
        })
        run(`CREATE_CARD_CYCLE`, {
          options: { id: `main-cycle`, phaseNames: [0, 1, 2, 3] },
          targets: {
            0: match<CardGroup>(`cardGroupId`, `main-deck`),
            1: every<CardGroup>(`cardGroupId`, hand => !!hand.ownerId),
            2: match<Zone>(`zoneId`, `main-trick-zone`),
            3: every<Zone>(`zoneId`, zone => (!!zone.ownerId && zone.contentType === `Pile`)),
          },
        })
        return ({})
      },
    },

  }
}

export const hearts = {
  name: `Hearts`,
  description:
    `The classic trick-taking game where points are bad...until they're not!`,
  useHeartsActions,
}

export const installHeartsActions
= (game:StoreApi<GameSession>)
: void => {
  const heartsActions = useHeartsActions(game)
  game.setState(state => {
    state.actions = {
      ...state.actions,
      ...heartsActions,
    }
  })
}

export default installHeartsActions
