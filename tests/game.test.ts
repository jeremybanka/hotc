import installCoreActions from "../src/core/actions"
import { IActionRequest } from "../src/core/actions/types"
import { PlayerId } from "../src/core/util/Id"
import createGame from "../src/store/game"

describe(`game/coreActions`, () => {
  it(`can create a player`, () => {
    const game = createGame()
    const get = () => game.getState()
    const actionRequest:IActionRequest = {
      type: `CREATE_PLAYER`,
      payload: {
        from: new PlayerId(),
        targets: [],
        options: { userId: 1, socketId: `foo` },
      },
    }
    installCoreActions(game)
    get().dispatch(actionRequest)
    console.log(get().playerIdsBySocketId)
    console.log(get().playerIdsByUserId)
    console.log(get().playersById)
    expect(get().playerIdsBySocketId.foo).toBe(get().playerIdsByUserId[1])
    // console.log(get())
  })
})
