import installCoreActions from "../src/models/global/Action"
import { createGame } from "../src/store/game"

describe(`game/coreActions`, () => {
  it(`can create a player`, () => {
    const game = createGame()
    const get = () => game.getState()
    installCoreActions(game)
    get().dispatch({ type: `createPlayer`, systemArgs: [1, `foo`] })
    expect(get().playersBySocketId.foo).toBe(get().playersByUserId[1])
    console.log(get())
  })
})
