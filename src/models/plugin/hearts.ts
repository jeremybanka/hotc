import produce from "immer"
import { StoreApi } from "zustand/vanilla"
import { GameSession } from "../../store/game"
import { Deck } from "../global"
import {
  actionType,
  CardCycleId,
  CardGroupId,
  PlayerId,
} from "../global/util/Id"

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

const buildActions
= (game:StoreApi<GameSession>)
: Record<string, {methodOf: string, run: CallableFunction}> => {
  const set = fn => game.setState(produce(fn))
  const get = game.getState()
  return {

    draw: {
      methodOf: `Deck`,
      run: (
        actor:PlayerId,
        targetId:CardGroupId,
      ) => {
        set((state:GameSession) => {
          if (!targetId) throw new Error(`no id passed`)
          const target = state.cardGroupsById.get(targetId)
          if (!(target instanceof Deck)) {
            throw new Error(`draw only targets decks`)
          }
          const drawnCard = target.draw()
        })
      },
    },

    deal: {
      methodOf: `Deck`,
      run: () => {},
    },

  }
}

const hearts = {
  name: `Hearts`,
  description:
    `The classic trick-taking game where points are bad...until they're not!`,
  buildActions,
}

export default hearts
