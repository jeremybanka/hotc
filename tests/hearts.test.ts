import { IActionRequest } from "../src/core/actions/types"
import installHeartsActions from "../src/plugin/hearts"
import createGame from "../src/store/game"

describe(`hearts actions`, () => {
  let g
  let make
  beforeEach(() => {
    const game = createGame()
    installHeartsActions(game)
    g = () => game.getState()
    make = (request: IActionRequest) => g().dispatch(request)
    const addPlayers = (x:number) => {
      while (x) {
        const eny = Math.random()
        const request: IActionRequest = {
          type: `CREATE_PLAYER`,
          payload: { options: { userId: eny, socketId: `${eny}` } },
        }
        make(request)
        x--
        console.log(`# of players`, g().getPlayers().length)
      }
    }
    addPlayers(3)
    console.log(`# of players`, g().getPlayers().length)
  })
  describe(`INIT`, () => {
    it(``, () => {
      console.log(g().actions)
      const request = {
        type: `INIT`,
        payload: { },
      }
      make(request)
      console.log(g())
      // const { cardValuesById } = g()
      // expect(tallyOf(cardValuesById)).toBe(52)
      // CLEAR_TABLE
      // LOAD_CARD_VALUES
      // // set "classic_52"
      // // => card_vals { card_val_id_X: card_val_X } (52)
      // CREATE_ZONE_LAYOUT for "everyone"
      // // => layout_id
      // CREATE_ZONE in layout_id for Deck
      // // => zone_id_Deck
      // CREATE_ZONE in layout_id for Trick
      // // => zone_id_Trick
      // CREATE_DECK
      // // with card_vals.keys.toArray()
      // // => deck_id
      // for P, CREATE_HAND
      // // for P_id
      // // => {hand_id_P_id} (P#)
      // for P, CREATE_TAKE
      // // for P_id
      // // => {take_id_P_id} (P#)
      // CREATE_CARD_CYCLE
      // // from [deck_id, {hand_id_P_id}, zone_id_Trick, {}]
      // // => cycle_id
      // P, CREATE_ZONE_LAYOUT
      // // for P_id
      // PLACE_DECK deck_id on zone_id_DECK
      // SHUFFLE deck_id
      // DEAL deck_id "maximum"
    })
  })
})
