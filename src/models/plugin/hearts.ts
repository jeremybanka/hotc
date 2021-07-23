import produce from "immer"
import { StoreApi } from "zustand/vanilla"
import { GameSession } from "../../store/game"
import { IAction } from "../global/Action"

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

const useHeartsActions
= (
  game:StoreApi<GameSession>,
  coreActions:Record<string, IAction>)
: Record<string, IAction> => {
  const set = fn => game.setState(produce(fn))
  const { dispatch } = game.getState()
  const { createDeck } = coreActions

  return {

    init: {
      domain: `System`,
      run: () => {
        dispatch(createDeck)
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

export default useHeartsActions
