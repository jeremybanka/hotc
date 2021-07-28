// import produce from "immer"
import { StoreApi } from "zustand/vanilla"
import { EBUSY } from "constants"
import { GameSession } from "../store/game"
import {
  actionType,
  IAction, IActionRequestPayload,
} from "../core/actions/types"
import installCoreActions from "../core/actions"
import { frenchPlayingCardDeck } from "./PlayingCard"
import { Player } from "../core/models"

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
  const { stamp } = get()
  const getAllCardValueIds = () => Object.values(get().cardValuesById)
    .map(cardValue => cardValue.id)
  return {
    INIT: {
      domain: `System`,
      run: () => {
        const { forEach, dispatch } = get()

        const run = (
          type:actionType,
          payload:IActionRequestPayload
        ) => dispatch({ type, payload })

        run(`CLEAR_TABLE`, {})
        run(`LOAD`, { options: { values: frenchPlayingCardDeck } })
        run(`CREATE_ZONE_LAYOUT`, { options: { id: `main` } })
        run(`CREATE_ZONE`, { targets: stamp(`zoneLayoutId`, `main`) })
        run(`CREATE_DECK`, { targets: { cardValueIds: getAllCardValueIds() } })
        forEach<Player>(`playersById`, player =>
          run(`CREATE_HAND`, { targets: { ownerId: player.id } }))

        return ({})
      },
    },

  }
}

const hearts = {
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
