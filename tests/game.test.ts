import installCoreActions from "../src/core/actions"
import CODE, { IActionRequest } from "../src/core/actions/types"
import createGame from "../src/store/game"

describe(`game/coreActions`, () => {
  it(`can create a player`, () => {
    const game = createGame()
    const get = () => game.getState()
    const actionRequest:IActionRequest = {
      type: `CREATE_PLAYER`,
      payload: { targets: [], systemArgs: [1, `foo`] },
    }
    installCoreActions(game)
    get().dispatch(actionRequest)
    expect(get().playerIdsBySocketId.foo).toBe(get().playerIdsByUserId[1])
    // console.log(get())
  })
})
